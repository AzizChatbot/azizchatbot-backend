import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "./db";

export const auth = betterAuth({
  appName: "AzizChatbot",
  basePath: process.env.NODE_ENV == "production" ? "/auth" : "/api/auth",
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
      redirectURI: `${process.env.BETTER_AUTH_URL}/api/auth/callback/google`,
    },
  },
  advanced: {
    generateId: false,
  },
  trustedOrigins: [process.env.BETTER_AUTH_URL as string],
});
