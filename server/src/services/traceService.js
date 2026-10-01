const Trace = require("../models/Trace");


/*
 * ============================================================
 * TrustDesk Trace Service
 * ============================================================
 *
 * Responsibility:
 *
 * 1. Persist the important events from one agent run.
 * 2. Keep the trace linked to run_id and ticket_id.
 * 3. Store retrieved documents.
 * 4. Store guardrail results.
 * 5. Store ToolCall information.
 * 6. Store the final execution status.
 * 7. Update the trace later when human approval happens.
 */


/*
 * ------------------------------------------------------------
 * Convert a Mongoose document / plain object safely
 * ------------------------------------------------------------
 */

const toPlainObject = (value) => {

  if (!value) {
    return value;
  }

  if (
    typeof value.toObject ===
    "function"
  ) {
    return value.toObject();
  }

  return value;
};


/*
 * ------------------------------------------------------------
 * Build minimal trace metadata
 * ------------------------------------------------------------
 *
 * We deliberately do NOT store the entire ticket/customer
 * object here.
 *
 * The trace should remain useful without becoming a dump
 * of potentially sensitive business data.
 * ------------------------------------------------------------
 */

const buildMetadata = ({
  triage,
  draft,
  recommendedAction,
  approval,
  toolResult
}) => {

  return {

    triage:
      triage?.triage || triage || null,

    draft: draft
      ? {
          draft_id:
            draft.draft?.draft_id ||
            draft.draft_id ||
            null,

          status:
            draft.draft?.status ||
            draft.status ||
            null,

          citation_doc_ids:
            Array.isArray(
              draft.draft?.citations
            )
              ? draft.draft.citations.map(
                  (citation) =>
                    citation.doc_id
                )
              : []
        }
      : null,

    recommended_action:
      recommendedAction?.action || null,

    approval:
      approval || null,

    tool_result:
      toolResult || null
  };
};


/*
 * ------------------------------------------------------------
 * Create / update trace for an agent run
 * ------------------------------------------------------------
 */

const createTrace = async ({
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
}) => {

  if (!runId) {
    throw new Error(
      "runId is required to create a trace"
    );
  }


  if (!ticket?.ticket_id) {
    throw new Error(
      "ticket_id is required to create a trace"
    );
  }


  const traceData = {

    run_id:
      runId,

    ticket_id:
      ticket.ticket_id,

    run_type:
      "agent_run",

    status:
      "completed",

    retrieved_doc_ids:
      Array.isArray(
        retrievedDocuments
      )
        ? retrievedDocuments.map(
            (document) =>
              document.doc_id
          )
        : [],

    tool_calls:
      toolCall
        ? [
            toPlainObject(
              toolCall
            )
          ]
        : [],

    guardrail_results:
      guardrailResult
        ? [
            toPlainObject(
              guardrailResult
            )
          ]
        : [],

    final_status:
      finalStatus ||
      "unknown",

    metadata:
      buildMetadata({
        triage,
        draft,
        recommendedAction,
        approval,
        toolResult
      }),

    completed_at:
      new Date()
  };


  const trace =
    await Trace.findOneAndUpdate(
      {
        run_id:
          runId
      },

      {
        $set:
          traceData
      },

      {
        returnDocument: "after",

        upsert: true,

        setDefaultsOnInsert:
          true
      }
    );


  return trace;
};


/*
 * ------------------------------------------------------------
 * Update trace after approval/execution
 * ------------------------------------------------------------
 *
 * The approval happens through the REST API after the
 * LangGraph run has already reached approval_required.
 *
 * Therefore we update the existing trace here.
 * ------------------------------------------------------------
 */

const updateTraceAfterAction =
  async ({
    actionId,
    approval,
    toolCall,
    toolResult
  }) => {

    if (!actionId) {
      throw new Error(
        "actionId is required to update a trace"
      );
    }


    const trace =
      await Trace.findOne({
        "tool_calls.action_id":
          actionId
      });


    if (!trace) {

      /*
       * This can happen if an older ToolCall was created
       * before tracing was implemented.
       *
       * We do not crash the approval operation.
       */

      return null;
    }


    const existingMetadata =
      trace.metadata || {};


    trace.tool_calls =
      toolCall
        ? [
            toPlainObject(
              toolCall
            )
          ]
        : trace.tool_calls;


    trace.metadata = {

      ...existingMetadata,

      approval:
        approval
          ? toPlainObject(
              approval
            )
          : existingMetadata.approval,

      tool_result:
        toolResult ||
        existingMetadata.tool_result
    };


    trace.final_status =
      toolCall?.status ===
        "executed"

        ? "executed"

        : toolCall?.status ===
            "rejected"

          ? "rejected"

          : trace.final_status;


    trace.completed_at =
      new Date();


    await trace.save();


    return trace;
  };


/*
 * ------------------------------------------------------------
 * Get trace by run ID
 * ------------------------------------------------------------
 */

const getTraceByRunId =
  async (runId) => {

    const trace =
      await Trace.findOne({
        run_id:
          runId
      }).lean();


    if (!trace) {

      const error =
        new Error(
          `Trace not found for run: ${runId}`
        );

      error.statusCode =
        404;

      throw error;
    }


    return trace;
  };


module.exports = {
  createTrace,
  updateTraceAfterAction,
  getTraceByRunId
};