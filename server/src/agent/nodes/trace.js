const {
  createTrace
} = require(
  "../../services/traceService"
);


/*
 * ============================================================
 * LangGraph Trace Node
 * ============================================================
 *
 * This node runs after action execution.
 *
 * It collects the important state produced by the previous
 * nodes and persists one audit record for the run.
 */


/*
 * ------------------------------------------------------------
 * Persist trace
 * ------------------------------------------------------------
 */

const runTrace =
  async (state) => {

    const {
      runId,
      ticket,
      retrievedDocuments,
      triage,
      draft,
      recommendedAction,
      guardrailResult,
      toolCall,
      approval,
      toolResult,
      finalStatus
    } = state;


    if (!runId) {
      throw new Error(
        "runId is required for tracing"
      );
    }


    const trace =
      await createTrace({

        runId,

        ticket,

        retrievedDocuments,

        triage,

        draft,

        recommendedAction,

        guardrailResult,

        toolCall,

        approval,

        toolResult,

        finalStatus
      });


    return {
      trace
    };
  };


module.exports = {
  runTrace
};