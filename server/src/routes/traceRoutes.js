const express = require("express");
const {getTrace} = require("../controllers/traceController");
const router = express.Router();


// GET /traces/:runId
// Returns the trace information.
router.get("/:runId", getTrace);






module.exports = router;