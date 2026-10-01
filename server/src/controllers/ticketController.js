const ticketService = require("../services/ticketService");

// =============================GET /tickets=====================================
// ======================Return the ticket queue.=================================

const getTickets = async (req, res, next) => {
  try {
    const tickets = await ticketService.getTickets();

    res.status(200).json({
      success: true,
      count: tickets.length,
      tickets
    });
  } catch (error) {
    next(error);
  }
};


// ====================GET /tickets/:ticketId=============================
// =============Return one ticket with its related customer and order.=======

const getTicketById = async (req, res, next) => {
  try {
    const { ticketId } = req.params;

    const result = await ticketService.getTicketById(ticketId);

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {getTickets,getTicketById};