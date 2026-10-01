const express = require("express");
const {generateDraft} = require("../controllers/draftController");
const router = express.Router();


// ------------------------------------------------------------
// Generate AI draft reply for a ticket
// POST /tickets/:ticketId/draft
// ------------------------------------------------------------

router.post("/tickets/:ticketId/draft", generateDraft);





module.exports = router;