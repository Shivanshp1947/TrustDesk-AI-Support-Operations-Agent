const {
  generateDraftFromContext
} = require("../../services/draftService");


/**
 * ============================================================
 * LangGraph Draft Generation Node
 * ============================================================
 *
 * Node:
 *
 *     runDraftGeneration
 *
 * State output:
 *
 *     draft
 *
 * The node uses context already prepared by previous nodes.
 */
const runDraftGeneration = async (
  state
) => {

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
      "runId is required before draft generation"
    );
  }

  if (!ticket) {
    throw new Error(
      "ticket is required before draft generation"
    );
  }

  if (!Array.isArray(retrievedDocuments)) {
    throw new Error(
      "retrievedDocuments are required before draft generation"
    );
  }


  /*
   * ----------------------------------------------------------
   * Generate grounded draft
   * ----------------------------------------------------------
   */

  const result =
    await generateDraftFromContext({

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
   * Node name:
   *
   *     runDraftGeneration
   *
   * State field:
   *
   *     draft
   */

  return {
    draft: result
  };
};


module.exports = {
  runDraftGeneration
};