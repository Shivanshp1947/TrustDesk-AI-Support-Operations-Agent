const crypto = require("crypto");

const Ticket = require("../models/Ticket");
const Customer = require("../models/Customer");
const Order = require("../models/Order");

const retrievalService = require("./retrievalService");
const { getAIProvider } = require("../ai/aiProvider");

const {
  applyTriageRules
} = require("../utils/triageRules");

const ALLOWED_CATEGORIES = [
  "shipping",
  "refund",
  "warranty",
  "billing",
  "account_security",
  "general"
];

const ALLOWED_PRIORITIES = [
  "low",
  "medium",
  "high",
  "urgent"
];

const ALLOWED_SENTIMENTS = [
  "neutral",
  "frustrated",
  "worried",
  "angry"
];

/**
 * Validate the AI triage response.
 */
const validateTriage = (triage) => {
  if (
    !ALLOWED_CATEGORIES.includes(
      triage.category
    )
  ) {
    const error = new Error(
      `AI returned invalid category: ${triage.category}`
    );

    error.statusCode = 502;

    throw error;
  }

  if (
    !ALLOWED_PRIORITIES.includes(
      triage.priority
    )
  ) {
    const error = new Error(
      `AI returned invalid priority: ${triage.priority}`
    );

    error.statusCode = 502;

    throw error;
  }

  if (
    !ALLOWED_SENTIMENTS.includes(
      triage.sentiment
    )
  ) {
    const error = new Error(
      `AI returned invalid sentiment: ${triage.sentiment}`
    );

    error.statusCode = 502;

    throw error;
  }

  if (
    typeof triage.escalation !== "boolean"
  ) {
    const error = new Error(
      "AI returned an invalid escalation value"
    );

    error.statusCode = 502;

    throw error;
  }
};

/**
 * Perform AI triage using context that has already been loaded
 * by the LangGraph workflow.
 *
 * This function deliberately does NOT load the ticket,
 * customer, order, or documents again.
 */
const triageFromContext = async ({
  ticket,
  customer,
  order,
  retrievedDocuments,
  runId
}) => {
  if (!ticket) {
    const error = new Error(
      "Ticket context is required for triage"
    );

    error.statusCode = 400;

    throw error;
  }

  if (!Array.isArray(retrievedDocuments)) {
    const error = new Error(
      "Retrieved documents are required for triage"
    );

    error.statusCode = 400;

    throw error;
  }

  /*
   * ----------------------------------------------------------
   * 1. Get configured AI provider
   * ----------------------------------------------------------
   */

  const aiProvider = getAIProvider();

  /*
   * ----------------------------------------------------------
   * 2. Ask AI for initial classification
   * ----------------------------------------------------------
   */

  const aiTriage =
    await aiProvider.triageTicket({
      ticket,
      customer,
      order,
      retrievedDocuments
    });

  /*
   * ----------------------------------------------------------
   * 3. Validate AI response
   * ----------------------------------------------------------
   */

  validateTriage(aiTriage);

  /*
   * ----------------------------------------------------------
   * 4. Apply deterministic business/safety rules
   * ----------------------------------------------------------
   */

  const finalTriage =
    applyTriageRules({
      ticket,
      customer,
      order,
      aiTriage
    });

  /*
   * ----------------------------------------------------------
   * 5. Validate final result
   * ----------------------------------------------------------
   */

  validateTriage(finalTriage);

  /*
   * ----------------------------------------------------------
   * 6. Save triage to ticket
   * ----------------------------------------------------------
   */

  const triageData = {
    category: finalTriage.category,
    priority: finalTriage.priority,
    sentiment: finalTriage.sentiment,
    escalation: finalTriage.escalation,
    reason: finalTriage.reason,
    generated_at: new Date(),
    run_id: runId
  };

  await Ticket.updateOne(
    {
      ticket_id: ticket.ticket_id
    },
    {
      $set: {
        triage: triageData
      }
    }
  );

  /*
   * ----------------------------------------------------------
   * 7. Return graph-friendly result
   * ----------------------------------------------------------
   */

  return {
    ticket_id: ticket.ticket_id,

    triage: triageData,

    retrieved_doc_ids:
      retrievedDocuments.map(
        (document) => document.doc_id
      ),

    ai_provider:
      require("../config/env").aiProvider
  };
};

/**
 * Existing REST-service entry point.
 *
 * This keeps the existing API behavior intact.
 *
 * It loads everything itself and then delegates the actual
 * triage logic to triageFromContext().
 */
const triageTicket = async (ticketId) => {
  /*
   * ----------------------------------------------------------
   * 1. Load ticket
   * ----------------------------------------------------------
   */

  const ticket = await Ticket.findOne({
    ticket_id: ticketId
  });

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

  const order = ticket.order_id
    ? await Order.findOne({
        order_id: ticket.order_id
      }).lean()
    : null;

  /*
   * ----------------------------------------------------------
   * 4. Retrieve relevant knowledge
   * ----------------------------------------------------------
   */

  const retrievalQuery = [
    ticket.subject,
    ticket.body
  ].join(" ");

  const retrievedDocuments =
    await retrievalService.searchDocuments(
      retrievalQuery,
      5
    );

  /*
   * ----------------------------------------------------------
   * 5. Create run ID
   * ----------------------------------------------------------
   */

  const runId = crypto.randomUUID();

  /*
   * ----------------------------------------------------------
   * 6. Delegate to reusable triage engine
   * ----------------------------------------------------------
   */

  return triageFromContext({
    ticket: ticket.toObject(),
    customer,
    order,
    retrievedDocuments,
    runId
  });
};

module.exports = {
  triageTicket,
  triageFromContext
};