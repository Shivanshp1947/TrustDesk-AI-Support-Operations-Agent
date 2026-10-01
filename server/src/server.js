const app = require("./app");
const connectDatabase = require("./config/db");
const env = require("./config/env");

const startServer = async () => {
  try {
    // Connect to MongoDB before accepting requests.
    await connectDatabase();

    app.listen(env.port, () => {
      console.log(`TrustDesk server running on port ${env.port}`);
    });
  } catch (error) {
    console.error("Failed to start TrustDesk server:", error.message);
    process.exit(1);
  }
};

startServer();