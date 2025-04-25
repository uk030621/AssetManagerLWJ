import mongoose from "mongoose";
import ImageModel from "../../models/ImageModel";

export async function GET(req) {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const {
      search,
      folder,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = Object.fromEntries(new URL(req.url).searchParams);

    const query = {};
    if (search) {
      const tagsArray = search.split(",");
      query.tags = { $in: tagsArray };
    }
    if (folder) query.folder = folder; // ✅ Restored folder filtering
    if (startDate && endDate) {
      query.uploadedAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const skip = (page - 1) * limit;
    const images = await ImageModel.find(query)
      .sort({ uploadedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ImageModel.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    return new Response(JSON.stringify({ images, totalPages }), {
      status: 200,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Search failed!", details: error.message }),
      { status: 500 }
    );
  }
}
