const {
  triageFromContext
} = require("../../services/triageService");

/**
 * ============================================================
 * LangGraph Triage Node
 * ============================================================
 *
 * Node name:
 *
 *     runTriage
 *
 * State output:
 *
 *     triage
 *
 * This distinction is intentional.
 *
 * "runTriage" = the operation/node
 * "triage"    = the resulting state attribute
 */
const runTriage = async (state) => {
  const {
    runId,
    ticket,
    customer,
    order,
    retrievedDocuments
  } = state;

  /*
   * ----------------------------------------------------------
   * Validate required state
   * ----------------------------------------------------------
   */

  if (!runId) {
    throw new Error(
      "runId is required before triage"
    );
  }

  if (!ticket) {
    throw new Error(
      "ticket is required before triage"
    );
  }

  if (!Array.isArray(retrievedDocuments)) {
    throw new Error(
      "retrievedDocuments are required before triage"
    );
  }

  /*
   * ----------------------------------------------------------
   * Execute existing TrustDesk triage business logic
   * ----------------------------------------------------------
   */

  const result =
    await triageFromContext({
      ticket,
      customer,
      order,
      retrievedDocuments,
      runId
    });

  /*
   * ----------------------------------------------------------
   * Return state update
   * ----------------------------------------------------------
   *
   * The result is stored in the "triage" state field.
   */

  return {
    triage: result
  };
};

module.exports = {
  runTriage
};