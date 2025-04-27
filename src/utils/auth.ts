import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { mail, emailVerificationTemplate } from "./mail";
import { db } from "./db";

export const auth = betterAuth({
  appName: "AzizChatbot",
  basePath: "/auth",
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    autoSignInAfterVerification: true,
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      await mail.sendMail({
        to: user.email,
        from: process.env.MAIL_SENDER,
        subject: "تأكيد البريد الإلكتروني بعزيز المساعد الذكي",
        html: emailVerificationTemplate(user.name, url),
      });
    },
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
