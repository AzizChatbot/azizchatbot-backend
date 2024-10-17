import mongoose from "mongoose";

const passwordResetSchema = new mongoose.Schema(
  {
    token: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    createdAt: { type: Date, required: true, default: Date.now, expires: "1h" },
  },
  { collection: "passwordResets" }
);

const PasswordReset = mongoose.model("PasswordReset", passwordResetSchema);
export default PasswordReset;
