const express = require("express");
const cors = require("cors");
const env = require("./config/env");

const {requireAuth} = require("./middleware/auth");
const ticketRoutes = require("./routes/ticketRoutes");
const documentRoutes = require("./routes/documentRoutes");
const triageRoutes = require("./routes/triageRoutes");
const draftRoutes = require("./routes/draftRoutes");
const actionRoutes = require("./routes/actionRoutes");
const traceRoutes = require("./routes/traceRoutes");
const evalRoutes = require("./routes/evalRoutes");
const agentRunRoutes = require("./routes/agentRunRoutes");

const app = express();



// ========================== Middleware ==========================
app.use(cors({origin: env.clientUrl}));

app.use(express.json({limit: "100kb"}));

// =========================== Health check ===========================
// Health remains public so Docker/orchestration systems
// can check whether the server is alive.
app.get("/health",(req, res) => {
    res.status(200).json({
      success: true,
      message:
        "TrustDesk API is running"
    });
  }
);


// ========================= Authentication ==================
// All application APIs below this point require
// the demo authentication token.
app.use(requireAuth);


// =========================== Routes ===========================
app.use("/tickets", ticketRoutes);
app.use("/documents", documentRoutes);
app.use("/", triageRoutes);
app.use("/", draftRoutes);
app.use("/actions", actionRoutes);
app.use("/traces", traceRoutes);
app.use("/eval",evalRoutes);
app.use("/agent-runs", agentRunRoutes);  



// ======================= 404 handler ===========================
app.use((req, res) => {
    res.status(404).json({
      success: false,
      message:
        "Route not found"
    });
  }
);


// ========================== Error handler =========================
app.use((error,req,res,next) => {

    console.error("API Error:", error);
    const statusCode = error.statusCode || 500;

    res.status(statusCode).json({
      success: false,
      message:
        error.message ||
        "Internal server error"
    });
  }
);


module.exports = app;