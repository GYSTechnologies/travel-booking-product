import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();
import path from "path";


// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// export const uploadToCloudinary = (localPath, folder = "uploads") => {
//   return new Promise((resolve, reject) => {
//     cloudinary.uploader.upload(
//       localPath,
//       {
//         folder,
//         resource_type: "auto",
//       },
//       (error, result) => {
//         if (error) {
//           console.error("❌ Cloudinary Upload Failed:", error);
//           reject(error);
//         } else {
//           console.log("✅ Uploaded to Cloudinary:", result.secure_url);
//           resolve(result);
//         }
//       }
//     );
//   });
// };


export const uploadToCloudinary = (localPath, folder = "uploads") => {
  return new Promise((resolve, reject) => {
    const fileExt = path.extname(localPath).toLowerCase();
    const isPDF = fileExt === ".pdf";

    cloudinary.uploader.upload(
      localPath,
      {
        folder,
        resource_type: isPDF ? "raw" : "auto", // 👈 force raw for PDFs
      },
      (error, result) => {
        if (error) {
          console.error("❌ Cloudinary Upload Failed:", error);
          reject(error);
        } else {
          
          resolve(result);
        }
      }
    );
  });
};

export default cloudinary;
