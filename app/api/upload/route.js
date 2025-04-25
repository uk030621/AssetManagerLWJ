import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";
import ImageModel from "../../models/ImageModel";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const { file, folder, tags } = await req.json();
    if (!file)
      return new Response(JSON.stringify({ error: "No file provided!" }), {
        status: 400,
      });

    // Upload image to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(file, {
      folder: folder || "default-folder",
      tags: tags ? tags.split(",") : [],
    });

    // Save Image Data in MongoDB including `public_id`
    const imageData = new ImageModel({
      url: uploadResponse.secure_url,
      public_id: uploadResponse.public_id, // ✅ Store public_id for future deletion
      folder,
      tags: tags ? tags.split(",") : [],
    });

    await imageData.save();

    return new Response(JSON.stringify({ url: uploadResponse.secure_url }), {
      status: 200,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Upload failed!", details: error.message }),
      { status: 500 }
    );
  }
}
