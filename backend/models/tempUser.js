import mongoose from "mongoose";

const tempUserSchema = new mongoose.Schema({
  username: String,
  email: { type: String, required: true },
  password: String,
  phone: String,
  address: String,
  profileImage: String,
  otp: String,
  role: String, 
  hostType: {
    type: [String],
    enum: ["hotel", "services", "experiences"],
    default: [],
  },

  // 🆕 KYC Documents (array of objects)
  kycDocuments: [
    {
      docType: { type: String }, 
      url: { type: String }
    }
  ],

  createdAt: { type: Date, default: Date.now, expires: 300 }, 
});

const TempUser = mongoose.model("TempUser", tempUserSchema);
export default TempUser;
