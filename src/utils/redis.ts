import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on("error", (err) => console.log("Redis Client Error", err));

async function initRedis() {
  await redisClient.connect();
}

process.on("SIGINT", async () => {
  await redisClient.disconnect();
  process.exit(0);
});

export { redisClient, initRedis };
