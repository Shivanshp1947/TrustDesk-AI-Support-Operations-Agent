const {Annotation} = require("@langchain/langgraph");

/*
 * ============================================================
 * TrustDesk Agent State
 * ============================================================
 *
 * This is the shared state passed between LangGraph nodes.
 *
 * Today's graph only uses:
 *
 * ticketId
 * runId
 * ticket
 * customer
 * order
 *
 * The remaining fields are defined now because later nodes
 * will use the same state:
 *
 * retrieval
 * triage
 * draft
 * action
 * guardrails
 * approval
 * tool execution
 * trace
 */

const TrustDeskState = Annotation.Root({
  /*
   * ----------------------------------------------------------
   * Input
   * ----------------------------------------------------------
   */

  ticketId: Annotation(),

  /*
   * ----------------------------------------------------------
   * Execution information
   * ----------------------------------------------------------
   */

  runId: Annotation(),

  /*
   * ----------------------------------------------------------
   * Ticket context
   * ----------------------------------------------------------
   */

  ticket: Annotation(),

  customer: Annotation(),

  order: Annotation(),

  /*
   * ----------------------------------------------------------
   * Retrieval
   * ----------------------------------------------------------
   *
   * Will be populated on 20 September.
   */

  retrievedDocuments: Annotation(),

  /*
   * ----------------------------------------------------------
   * AI Triage
   * ----------------------------------------------------------
   *
   * Will be populated on 20 September.
   */

  triage: Annotation(),

  /*
   * ----------------------------------------------------------
   * Grounded Draft
   * ----------------------------------------------------------
   *
   * Will be populated on 20 September.
   */

  draft: Annotation(),

  /*
   * ----------------------------------------------------------
   * Agent Action
   * ----------------------------------------------------------
   */

  recommendedAction: Annotation(),

  /*
   * ----------------------------------------------------------
   * Safety / Guardrails
   * ----------------------------------------------------------
   */

  guardrailResult: Annotation(),

  /*
   * ----------------------------------------------------------
   * Tool / Approval
   * ----------------------------------------------------------
   */

  toolCall: Annotation(),

  approval: Annotation(),

  toolResult: Annotation(),

  /*
   * ----------------------------------------------------------
   * Trace
   * ----------------------------------------------------------
   */

  trace: Annotation(),

  /*
   * ----------------------------------------------------------
   * Final status
   * ----------------------------------------------------------
   */

  finalStatus: Annotation()
});

module.exports = {TrustDeskState};