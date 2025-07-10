
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload helper function
export const uploadToCloudinary = (localPath, folder = "uploads") => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      localPath,
      { folder },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
  });
};

export default cloudinary;
