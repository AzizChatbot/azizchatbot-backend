import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});
const openaiAPI = openai.chat.completions;

export default openaiAPI;
