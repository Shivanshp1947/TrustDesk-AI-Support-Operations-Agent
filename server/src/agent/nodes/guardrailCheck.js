const {
  checkActionGuardrails
} = require(
  "../../services/guardrailService"
);


/*
 * ============================================================
 * LangGraph Guardrail Node
 * ============================================================
 *
 * This node performs deterministic safety validation
 * after action recommendation.
 *
 *
 * Graph:
 *
 * action recommendation
 *          ↓
 *     guardrail check
 *          ↓
 *        END
 *
 *
 * Later we will add:
 *
 * guardrail
 *     ↓
 * approval
 *     ↓
 * execution
 */


const runGuardrailCheck = async (
  state
) => {

  const {
    ticket,
    triage,
    recommendedAction,
    retrievedDocuments
  } = state;


  /*
   * ----------------------------------------------------------
   * Validate required state
   * ----------------------------------------------------------
   */

  if (!ticket) {

    throw new Error(
      "ticket is required before guardrail check"
    );
  }


  if (!triage) {

    throw new Error(
      "triage is required before guardrail check"
    );
  }


  /*
   * ----------------------------------------------------------
   * Normalize triage
   * ----------------------------------------------------------
   *
   * The triage state currently contains:
   *
   * {
   *   ticket_id,
   *   triage: {
   *     category,
   *     priority,
   *     sentiment,
   *     escalation
   *   }
   * }
   */

  const normalizedTriage =
    triage.triage || triage;


  /*
   * ----------------------------------------------------------
   * Run deterministic guardrails
   * ----------------------------------------------------------
   */

  const result =
    await checkActionGuardrails({

      ticket,

      triage:
        normalizedTriage,

      recommendedAction,

      retrievedDocuments

    });


  /*
   * ----------------------------------------------------------
   * Return updated graph state
   * ----------------------------------------------------------
   */

  return {

    guardrailResult:
      result

  };
};


module.exports = {
  runGuardrailCheck
};