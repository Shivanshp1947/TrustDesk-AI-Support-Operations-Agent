const express = require("express");
const {runAgent} = require("../controllers/agentRunController");
const router = express.Router();


// Runs the complete TrustDesk LangGraph.
// POST /agent-runs
router.post("/", runAgent);





module.exports = router;