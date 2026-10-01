const dotenv = require("dotenv");

dotenv.config({
  path: require("path").resolve(__dirname, "../../../.env")
});

const env = {
  port: process.env.PORT || 5000,
  mongodbUrl: process.env.MONGODB_URI,
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  demoToken: process.env.DEMO_TOKEN,
  aiProvider: process.env.AI_PROVIDER || "mock",
  geminiApiKey: process.env.GEMINI_API_KEY,
  geminiModel: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  openaiApiKey:process.env.OPENAI_API_KEY,
  openaiModel:process.env.OPENAI_MODEL || "gpt-5.5"
};

module.exports = env;