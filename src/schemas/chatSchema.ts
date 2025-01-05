import { z } from "zod";

export const createChatSchema = z.object({
  initialMessage: z.string(),
});

export const sendMessageSchema = z.object({
  chatId: z.string().uuid(),
  userMessage: z.string(),
});

export const getChatSchema = z.object({
  chatId: z.string().uuid(),
});
