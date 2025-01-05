import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "./db";

export const auth = betterAuth({
  appName: "AzizChatbot",
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.UNI_CID as string,
      clientSecret: process.env.UNI_SECRET as string,
      hd: "stu.kau.edu.sa",
    },
  },
  advanced: {
    generateId: false,
  },
  trustedOrigins: [process.env.BETTER_AUTH_URL as string],
});
