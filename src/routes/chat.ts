import { Router, Request, Response } from "express";

import { db } from "../utils/db";

import { validateData } from "../middleware/validationMiddleware";
import {
  createChatSchema,
  getChatSchema,
  sendMessageSchema,
} from "../schemas/chatSchema";

import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../utils/auth";

import axios from "axios";

interface AIResponse {
  answer: string;
  score: number;
}

interface KeywordResponse {
  keywords: string;
}

const chatRouter: Router = Router();

chatRouter.post(
  "/:chatId/messages",
  validateData(sendMessageSchema),
  async (req: Request, res: Response) => {
    try {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
      });
      if (!session) {
        return res.status(401).json({ message: "Unauthorized." });
      }
      const { userMessage } = req.body;
      const { chatId } = req.params;

      const chat = await db.chat.findFirst({
        where: {
          id: chatId,
          userId: session.user.id,
        },
      });
      if (!chat) {
        return res.status(404).json({ message: "Chat not found." });
      }

      const assistantMessageReq = await axios.post(
        `${process.env.AI_URL}/ask`,
        { question: userMessage }
      );

      if (assistantMessageReq.status !== 200) {
        return res.status(500).json({ message: "AI service error." });
      }

      const assistantMessageRes: AIResponse = assistantMessageReq.data;

      // Save the user message to the database
      await db.message.create({
        data: {
          chatId: chat.id,
          role: "user",
          content: userMessage,
        },
      });

      // Save the assistant message to the database
      await db.message.create({
        data: {
          chatId: chat.id,
          role: "assistant",
          content: assistantMessageRes.answer,
        },
      });

      return res.json({ assistantMessage: assistantMessageRes.answer });
    } catch (err) {
      return res.status(500).json({ message: "Internal Server Error." });
    }
  }
);

chatRouter.get(
  "/:chatId/messages",
  validateData(getChatSchema),
  async (req: Request, res: Response) => {
    try {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
      });
      if (!session) {
        return res.status(401).json({ message: "Unauthorized." });
      }
      const { chatId } = req.params;
      const chat = await db.chat.findFirst({
        where: {
          id: chatId,
          userId: session.user.id,
        },
      });
      if (!chat) {
        return res.status(404).json({ message: "Chat not found." });
      }
      const dbMessages = await db.message.findMany({
        where: {
          chatId: chat.id,
        },
        orderBy: {
          timestamp: "asc",
        },
      });
      // Filter out messages with role: 'system'
      const filteredMessages = dbMessages.filter(
        (message) => message.role !== "system"
      );
      return res.json(filteredMessages);
    } catch (err) {
      return res.status(500).json({ message: "Internal Server Error." });
    }
  }
);

chatRouter.get("/", async (req: Request, res: Response) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    if (!session) {
      return res.status(401).json({ message: "Unauthorized." });
    }
    const chats = await db.chat.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        chatName: true,
      },
    });
    if (!chats) {
      return res.status(404).json({ message: "No chats found." });
    }
    return res.json(chats);
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error." });
  }
});

chatRouter.post(
  "/",
  validateData(createChatSchema),
  async (req: Request, res: Response) => {
    try {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
      });
      if (!session) {
        return res.status(401).json({ message: "Unauthorized." });
      }
      const { initialMessage } = req.body;

      const genChatName = await axios.post(`${process.env.AI_URL}/keywords`, {
        question: initialMessage,
      });
      if (genChatName.status !== 200) {
        return res.status(500).json({ message: "AI service error." });
      }
      const genChatNameRes: KeywordResponse = genChatName.data;

      const chat = await db.chat.create({
        data: {
          chatName: genChatNameRes.keywords,
          userId: session.user.id,
        },
      });

      const assistantMessageReq = await axios.post(
        `${process.env.AI_URL}/ask`,
        { question: initialMessage }
      );

      if (assistantMessageReq.status !== 200) {
        return res.status(500).json({ message: "AI service error." });
      }

      // Save the user message to the database
      await db.message.create({
        data: {
          chatId: chat.id,
          role: "user",
          content: initialMessage,
        },
      });

      const assistantMessageRes: AIResponse = assistantMessageReq.data;

      // Save the assistant message to the database
      await db.message.create({
        data: {
          chatId: chat.id,
          role: "assistant",
          content: assistantMessageRes.answer,
        },
      });

      res.status(201).json({
        message: "Chat created successfully",
        chatId: chat.id,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

export default chatRouter;
