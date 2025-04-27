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
    await mongoose.connect(process.env.MONGO_URI, { connectTimeoutMS: 30000 }); // ✅ Extended timeout for stability

    const { file, folder, tags } = await req.json();

    if (!file) {
      console.log("❌ No file provided in request!"); // ✅ Debug log
      return new Response(JSON.stringify({ error: "No file provided!" }), {
        status: 400,
      });
    }

    console.log("📂 Upload Request Received:", { folder, tags }); // ✅ Debug log

    // ✅ Validate iOS Base64 Encoding
    if (!file.startsWith("data:image")) {
      console.log("❌ Invalid file format detected!");
      return new Response(
        JSON.stringify({ error: "Unsupported file format!" }),
        { status: 400 }
      );
    }

    // ✅ Implement Retry Mechanism
    let uploadResponse;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        uploadResponse = await cloudinary.uploader.upload(file, {
          folder: folder || "default-folder",
          tags: tags ? tags.split(",") : [],
        });
        console.log(`✅ Upload Successful (Attempt ${attempt + 1})`);
        break;
      } catch (error) {
        console.error(`❌ Upload failed (Attempt ${attempt + 1}):`, error);
        if (attempt === 2)
          return new Response(
            JSON.stringify({ error: "Upload failed after multiple attempts!" }),
            { status: 500 }
          );
      }
    }

    // Save Image Data in MongoDB including `public_id`
    const imageData = new ImageModel({
      url: uploadResponse.secure_url,
      public_id: uploadResponse.public_id, // ✅ Store public_id for future deletion
      folder,
      tags: tags ? tags.split(",") : [],
    });

    await imageData.save();
    console.log("✅ Image saved in database:", uploadResponse.secure_url); // ✅ Debug log

    return new Response(JSON.stringify({ url: uploadResponse.secure_url }), {
      status: 200,
    });
  } catch (error) {
    console.error("❌ Server Error:", error); // ✅ Debug log
    return new Response(
      JSON.stringify({ error: "Upload failed!", details: error.message }),
      { status: 500 }
    );
  }
}
