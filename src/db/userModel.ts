import mongoose from "mongoose";
import { hash } from "bcrypt";
const userSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId(),
    },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    isVerified: { type: Boolean, required: true, default: false },
  },
  { collection: "User" }
);

userSchema.pre("save", async function (next) {
  if (typeof this.password == "string") {
    const hashedPassword = await hash(this.password || "", 10);
    this.password = hashedPassword;
    next();
  }
});

userSchema.pre(["updateOne", "findOneAndUpdate"], async function (next) {
  const update = this.getUpdate() as { password?: string };
  if (update.password) {
    const hashedPassword = await hash(update.password, 10);
    update.password = hashedPassword;
  }
  next();
});

const User = mongoose.model("User", userSchema);
export default User;
