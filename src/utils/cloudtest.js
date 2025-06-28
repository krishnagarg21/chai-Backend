import { v2 as cloudinary } from "cloudinary";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Load env vars
dotenv.config({
    path: './.env'
});

// Handle __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Config Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Use absolute path
const localPath = path.resolve(__dirname, "../public/temp/idcard.jpg");

console.log("📂 Uploading:", localPath);

cloudinary.uploader.upload(localPath, { resource_type: "auto" })
  .then((res) => {
    console.log("✅ Upload Success:", res.secure_url);
  })
  .catch((err) => {
    console.error("❌ Upload Failed:", err);
  });