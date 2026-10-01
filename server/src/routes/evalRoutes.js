const express = require("express");
const {startEval,getEval} = require("../controllers/evalController");
const router = express.Router();


// POST /eval/run
// Starts a new evaluation run.
router.post("/run", startEval);


// GET /eval/:evalRunId
// Returns the evaluation status/result.
router.get("/:evalRunId", getEval);




module.exports = router;