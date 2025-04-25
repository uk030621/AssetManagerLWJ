// /app/api/tags/route.js
import mongoose from "mongoose";
import ImageModel from "@/app/models/ImageModel";

export async function GET() {
  await mongoose.connect(process.env.MONGO_URI);
  const tags = await ImageModel.distinct("tags");
  return new Response(JSON.stringify(tags), { status: 200 });
}
