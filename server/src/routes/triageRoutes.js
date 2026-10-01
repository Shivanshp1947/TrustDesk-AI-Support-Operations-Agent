const express = require("express");
const {triageTicket} = require("../controllers/triageController");
const router = express.Router();


// -------------------Run AI triage for a ticket.--------------------
router.post("/tickets/:ticketId/triage",triageTicket);




module.exports = router;