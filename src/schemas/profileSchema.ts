import { z } from "zod";

export const updateUserInfoSchema = z
  .object({
    name: z.string().optional(),
    email: z.string().email().optional(),
  })
  .refine((data) => data.name !== undefined || data.email !== undefined, {
    message: "At least one of 'name' or 'email' must be provided",
    path: ["name", "email"],
  });
