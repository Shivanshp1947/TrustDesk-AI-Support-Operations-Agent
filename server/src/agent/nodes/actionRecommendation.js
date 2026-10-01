const {
  recommendAction
} = require("../../services/actionService");


/*
 * ============================================================
 * LangGraph Action Recommendation Node
 * ============================================================
 *
 * This node converts the results of:
 *
 *     Triage
 *     Draft Generation
 *
 * into a proposed operational action.
 *
 * IMPORTANT:
 *
 * This node DOES NOT execute the action.
 *
 * It only recommends an action.
 *
 * Later workflow:
 *
 * recommendation
 *      ↓
 * guardrail
 *      ↓
 * human approval
 *      ↓
 * tool execution
 */


const runActionRecommendation = async (
  state
) => {

  const {
    runId,
    ticket,
    customer,
    order,
    triage,
    draft,
    retrievedDocuments
  } = state;


  /*
   * ----------------------------------------------------------
   * Validate required state
   * ----------------------------------------------------------
   */

  if (!runId) {
    throw new Error(
      "runId is required before action recommendation"
    );
  }


  if (!ticket) {
    throw new Error(
      "ticket is required before action recommendation"
    );
  }


  if (!triage) {
    throw new Error(
      "triage is required before action recommendation"
    );
  }


  /*
   * ----------------------------------------------------------
   * IMPORTANT:
   *
   * runTriage currently returns:
   *
   * {
   *   ticket_id,
   *   triage: {
   *     category,
   *     priority,
   *     sentiment,
   *     escalation,
   *     reason
   *   }
   * }
   *
   * The action service expects the actual
   * triage object.
   *
   * Therefore unwrap it here.
   * ----------------------------------------------------------
   */

  const normalizedTriage =
    triage.triage || triage;


  /*
   * ----------------------------------------------------------
   * Generate action recommendation
   * ----------------------------------------------------------
   */

  const result =
    await recommendAction({

      ticket,

      customer,

      order,

      triage:
        normalizedTriage,

      draft,

      retrievedDocuments,

      runId

    });


  /*
   * ----------------------------------------------------------
   * Return updated LangGraph state
   * ----------------------------------------------------------
   */

  return {
    recommendedAction:
      result
  };
};


module.exports = {
  runActionRecommendation
};