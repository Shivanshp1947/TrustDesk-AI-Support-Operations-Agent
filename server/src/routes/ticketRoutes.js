const express = require("express");
const {getTickets,getTicketById} = require("../controllers/ticketController");
const router = express.Router();


// Get all tickets.
router.get("/", getTickets);

// Get one ticket with customer and order context.
router.get("/:ticketId", getTicketById);





module.exports = router;