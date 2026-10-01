const env = require("../config/env");

const openaiAdapter = require("./openaiAdapter");
const geminiAdapter = require("./geminiAdapter");
const mockAdapter = require("./mockAdapter");

const getAIProvider = () => {
  switch (env.aiProvider) {
    case "openai":
      return openaiAdapter;

    case "gemini":
      return geminiAdapter;

    case "mock":
    default:
      return mockAdapter;
  }
};

module.exports = {
  getAIProvider
};