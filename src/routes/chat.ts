import { Router, Request, Response } from "express";

import passport from "passport";

import Chat from "../db/chatModel";
import openaiAPI from "../utils/openai";

import { validateData } from "../middleware/validationMiddleware";
import {
  createChatSchema,
  getChatSchema,
  sendMessageSchema,
} from "../schemas/chatSchema";

const chatRouter: Router = Router();

chatRouter.post(
  "/:chatId/messages",
  passport.authenticate("jwt", { session: false }),
  validateData(sendMessageSchema),
  async (req: Request["body"], res: Response) => {
    try {
      const userId = req.user._id;
      const { userMessage } = req.body;
      const { chatId } = req.params;

      const chat = await Chat.findOne({
        _id: chatId,
        userId,
      });
      if (!chat) {
        return res.status(404).json({ message: "Chat not found." });
      }

      chat.messages.push({ role: "user", content: userMessage });
      await chat.save();

      const response = await openaiAPI.create({
        model: "gpt-4o-mini",
        messages: chat.messages,
      });

      const assistantMessage = response.choices[0].message.content;
      chat.messages.push({
        role: "assistant",
        content: assistantMessage,
      });
      await chat.save();

      return res.json({ assistantMessage });
    } catch (err) {
      return res.status(500).json({ message: "Internal Server Error." });
    }
  }
);

chatRouter.get(
  "/:chatId/messages",
  passport.authenticate("jwt", { session: false }),
  validateData(getChatSchema),
  async (req: Request["body"], res: Response) => {
    try {
      const { chatId } = req.params;
      const userId = req.user._id;
      const chat = await Chat.findOne({
        _id: chatId,
        userId,
      });
      if (!chat) {
        return res.status(404).json({ message: "Chat not found." });
      }
      // Filter out messages with role: 'system'
      const filteredMessages = chat.messages.filter(
        (message) => message.role !== "system"
      );
      return res.json(filteredMessages);
    } catch (err) {
      return res.status(500).json({ message: "Internal Server Error." });
    }
  }
);

chatRouter.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req: Request["body"], res: Response) => {
    try {
      const userId = req.user._id;
      const chats = await Chat.find(
        {
          userId,
        },
        { _id: 1, chatName: 1 } // Return the chat id and chatName only
      );
      if (!chats) {
        return res.status(404).json({ message: "No chats found." });
      }
      return res.json(chats);
    } catch (err) {
      return res.status(500).json({ message: "Internal Server Error." });
    }
  }
);

chatRouter.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  validateData(createChatSchema),
  async (req: Request["body"], res: Response) => {
    try {
      const userId = req.user._id;
      const { initialMessage } = req.body;

      const genChatName = await openaiAPI.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Generate a suitable name for this chat based on the context.",
          },
          { role: "user", content: initialMessage },
        ],
      });
      const chatName = genChatName.choices[0].message.content;

      const chat = await Chat.create({
        userId,
        chatName,
        messages: [
          {
            role: "system",
            content:
              "You are an assistant that only responds to messages related to King Abdulaziz University (KAU)",
          },
          { role: "user", content: initialMessage },
        ],
      });

      const response = await openaiAPI.create({
        model: "gpt-4o-mini",
        messages: chat.messages,
      });

      chat.messages.push({
        role: "assistant",
        content: response.choices[0].message.content,
      });
      await chat.save();

      res.status(201).json({
        message: "Chat created successfully",
        chatId: chat._id,
      });
    } catch (err) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

export default chatRouter;
