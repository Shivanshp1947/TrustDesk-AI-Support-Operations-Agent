const crypto = require("crypto");

const Ticket = require("../../models/Ticket");
const Customer = require("../../models/Customer");
const Order = require("../../models/Order");

/**
 * Load all business context required by the TrustDesk agent.
 *
 * LangGraph node:
 *
 * START
 *   ↓
 * loadContext
 *   ↓
 * next node
 */
const loadContext = async (state) => {
  const { ticketId } = state;

  if (!ticketId) {
    const error = new Error(
      "ticketId is required to start a TrustDesk agent run"
    );

    error.statusCode = 400;

    throw error;
  }

  /*
   * ----------------------------------------------------------
   * 1. Load ticket
   * ----------------------------------------------------------
   */

  const ticket = await Ticket.findOne({
    ticket_id: ticketId
  }).lean();

  if (!ticket) {
    const error = new Error(
      `Ticket not found: ${ticketId}`
    );

    error.statusCode = 404;

    throw error;
  }

  /*
   * ----------------------------------------------------------
   * 2. Load customer
   * ----------------------------------------------------------
   */

  const customer = await Customer.findOne({
    customer_id: ticket.customer_id
  }).lean();

  /*
   * ----------------------------------------------------------
   * 3. Load order
   * ----------------------------------------------------------
   */

  let order = null;

  if (ticket.order_id) {
    order = await Order.findOne({
      order_id: ticket.order_id
    }).lean();
  }

  /*
   * ----------------------------------------------------------
   * 4. Create agent run ID
   * ----------------------------------------------------------
   */

  const runId = crypto.randomUUID();

  /*
   * ----------------------------------------------------------
   * 5. Return state updates
   * ----------------------------------------------------------
   *
   * Important:
   *
   * A LangGraph node should return the state fields
   * it wants to update.
   */

  return {
    runId,
    ticket,
    customer,
    order
  };
};

module.exports = {loadContext};