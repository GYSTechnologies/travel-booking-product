import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../utils/cloudinary.js';

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: 'ghumakad-web-app',
      allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'], // ✅ Add 'pdf' here
      resource_type: file.mimetype === "application/pdf" ? "raw" : "image", // ✅ Key change
      transformation:
        file.mimetype.startsWith("image/")
          ? [{ width: 500, height: 500, crop: 'limit' }]
          : undefined,
    };
  },
});


const upload = multer({ storage });

export default upload;
