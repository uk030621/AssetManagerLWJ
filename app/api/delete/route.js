import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";
import ImageModel from "../../models/ImageModel";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function DELETE(req) {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const { public_id } = await req.json();
    if (!public_id)
      return new Response(JSON.stringify({ error: "No asset provided!" }), {
        status: 400,
      });

    // Delete from Cloudinary
    const deleteResponse = await cloudinary.uploader.destroy(public_id);

    if (deleteResponse.result !== "ok") {
      return new Response(
        JSON.stringify({
          error: "Cloudinary delete failed!",
          details: deleteResponse,
        }),
        { status: 500 }
      );
    }

    // Remove from MongoDB
    await ImageModel.findOneAndDelete({ url: { $regex: public_id } });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Asset deleted!",
        cloudinaryResponse: deleteResponse,
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Delete failed!", details: error.message }),
      { status: 500 }
    );
  }
}
