// models/Contact.js
import mongoose from "mongoose";

const ContactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, lowercase: true, trim: true },
    subject: { type: String, required: true, maxlength: 200 },
    message: { type: String, required: true, maxlength: 2000 },
    status: {
      type: String,
      enum: ["new", "read", "replied"],
      default: "new",
    },
    ipAddress: String,
  },
  { timestamps: true }
);

ContactSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.Contact || mongoose.model("Contact", ContactSchema);
