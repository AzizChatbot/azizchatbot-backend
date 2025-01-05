import { Router, Request, Response } from "express";

import openaiAPI from "../utils/openai";

import { db } from "../utils/db";

import { validateData } from "../middleware/validationMiddleware";
import {
  createChatSchema,
  getChatSchema,
  sendMessageSchema,
} from "../schemas/chatSchema";

import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../utils/auth";

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

      await db.message.create({
        data: {
          chatId: chat.id,
          role: "user",
          content: userMessage,
        },
      });

      const dbMessages = await db.message.findMany({
        where: {
          chatId: chat.id,
        },
        orderBy: {
          timestamp: "asc",
        },
      });

      const response = await openaiAPI.create({
        model: "gpt-4o-mini",
        messages: dbMessages,
      });

      const assistantMessage = response.choices[0].message.content;
      await db.message.create({
        data: {
          chatId: chat.id,
          role: "assistant",
          content: assistantMessage as string,
        },
      });

      return res.json({ assistantMessage });
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

      const genChatName = await openaiAPI.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are an AI assistant that generates creative and contextually relevant chat names. Based on the given context, provide a short and catchy name for the chat that reflects its purpose or participants. If the context includes themes, key topics, or unique characteristics, incorporate them into the name. Ensure the name is appropriate, clear, and easy to remember, also, avoid using any personal information or sensitive data in the name, and don't include double quotes in the name.",
          },
          { role: "user", content: initialMessage },
        ],
      });
      const chatName = genChatName.choices[0].message.content as string;

      const chat = await db.chat.create({
        data: {
          chatName,
          userId: session.user.id,
        },
      });

      const systemMessage = await db.message.create({
        data: {
          chatId: chat.id,
          role: "system",
          content:
            "You are an AI assistant that answers user questions related to King Abdulaziz University (KAU), try your best to provide accurate and helpful responses.",
        },
      });

      const userMessage = await db.message.create({
        data: {
          chatId: chat.id,
          role: "user",
          content: initialMessage,
        },
      });

      const response = await openaiAPI.create({
        model: "gpt-4o-mini",
        messages: [systemMessage, userMessage],
      });

      const assistantMessage = response.choices[0].message.content;
      await db.message.create({
        data: {
          chatId: chat.id,
          role: "assistant",
          content: assistantMessage as string,
        },
      });

      res.status(201).json({
        message: "Chat created successfully",
        chatId: chat.id,
      });
    } catch (err) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

export default chatRouter;
