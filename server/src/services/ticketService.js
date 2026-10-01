const Ticket = require("../models/Ticket");
const Customer = require("../models/Customer");
const Order = require("../models/Order");

/**
 * Get all tickets.
 *
 * Returns the ticket queue.
 */
const getTickets = async () => {
  const tickets = await Ticket.find({})
    .sort({ created_at: -1 })
    .lean();

  return tickets;
};

/**
 * Get one ticket with its related customer and order.
 *
 * ticket_id is the official TrustDesk ticket identifier,
 * for example: tkt_9001.
 */

//  
const getTicketById = async (ticketId) => {
  const ticket = await Ticket.findOne({
    ticket_id: ticketId
  }).lean();

  if (!ticket) {
    const error = new Error(`Ticket not found: ${ticketId}`);
    error.statusCode = 404;
    throw error;
  }

  const customer = ticket.customer_id
    ? await Customer.findOne({
        customer_id: ticket.customer_id
      }).lean()
    : null;

  const order = ticket.order_id
    ? await Order.findOne({
        order_id: ticket.order_id
      }).lean()
    : null;

  return {
    ticket,
    customer,
    order
  };
};
// this is the module exports  

module.exports = {getTickets,getTicketById};