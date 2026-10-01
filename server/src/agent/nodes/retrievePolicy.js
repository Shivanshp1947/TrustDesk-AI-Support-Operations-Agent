const retrievalService = require("../../services/retrievalService");

/**
 * Retrieve knowledge-base documents relevant to the ticket.
 *
 * LangGraph node:
 *
 * loadContext
 *      ↓
 * retrievePolicy
 *      ↓
 * next node
 *
 * This node does NOT make an AI decision.
 *
 * Its only responsibility is:
 *
 * Ticket
 *   ↓
 * search query
 *   ↓
 * knowledge base
 *   ↓
 * retrieved documents
 */
const retrievePolicy = async (state) => {
  const {
    ticket
  } = state;

  if (!ticket) {
    const error = new Error(
      "Ticket context is required before policy retrieval"
    );

    error.statusCode = 400;

    throw error;
  }

  /*
   * ----------------------------------------------------------
   * 1. Build retrieval query
   * ----------------------------------------------------------
   *
   * We use the ticket's subject and body because these
   * contain the customer's actual support problem.
   */

  const retrievalQuery = [
    ticket.subject,
    ticket.body
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  if (!retrievalQuery) {
    const error = new Error(
      "Ticket does not contain enough information for retrieval"
    );

    error.statusCode = 400;

    throw error;
  }

  /*
   * ----------------------------------------------------------
   * 2. Search knowledge base
   * ----------------------------------------------------------
   */

  const retrievedDocuments =
    await retrievalService.searchDocuments(
      retrievalQuery,
      5
    );

  /*
   * ----------------------------------------------------------
   * 3. Return state update
   * ----------------------------------------------------------
   *
   * LangGraph merges this returned value into the
   * graph state.
   */

  return {
    retrievedDocuments
  };
};

module.exports = {
  retrievePolicy
};