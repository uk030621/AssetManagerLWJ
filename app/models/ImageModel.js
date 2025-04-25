import mongoose from "mongoose";

const ImageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  public_id: { type: String, required: true }, // 🔹 Stores Cloudinary's unique public_id
  folder: { type: String },
  tags: [{ type: String }],
  uploadedAt: { type: Date, default: Date.now },
});

const ImageModel =
  mongoose.models.Image || mongoose.model("Image", ImageSchema);
export default ImageModel;
