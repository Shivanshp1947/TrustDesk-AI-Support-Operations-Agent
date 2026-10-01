const express = require("express");
const {getAction, approve, reject} = require("../controllers/actionController");
const router = express.Router();




// Get ToolCall / action status
// GET /actions/:actionId
router.get("/:actionId",getAction);

// Approve and execute action
// POST /actions/:actionId/approve
router.post("/:actionId/approve", approve);



// Reject action
// POST /actions/:actionId/reject
router.post("/:actionId/reject", reject);

module.exports = router;