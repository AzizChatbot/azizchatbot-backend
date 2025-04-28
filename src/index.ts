import express from "express";
import cors from "cors";
import helmet from "helmet";

import "dotenv/config";

import { toNodeHandler } from "better-auth/node";
import { auth } from "./utils/auth";

import chatRouter from "./routes/chat";

import { initRedis } from "./utils/redis";

const port = process.env.PORT || 4000;
const app = express();
app.use(
  cors({
    origin: process.env.BETTER_AUTH_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(helmet());
app.all("/auth/*", toNodeHandler(auth));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/chat", chatRouter);

async function main() {
  await initRedis();
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

main();
