import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId(),
    },
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    chatName: { type: String, required: true },
    messages: [
      {
        role: {
          type: String,
          enum: ["user", "assistant", "system"],
          required: true,
        },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { collection: "Chat" }
);

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;
