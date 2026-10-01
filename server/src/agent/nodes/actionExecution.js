const crypto = require("crypto");

const ToolCall = require("../../models/ToolCall");

const {
  findExistingToolCall,
  executeToolCall
} = require("../../services/toolExecutionService");


/*
 * ============================================================
 * LangGraph Action Execution Node
 * ============================================================
 *
 * Flow:
 *
 * recommended action
 *        ↓
 * guardrail
 *        ↓
 * ToolCall
 *        ↓
 * approval required?
 *      ↙       ↘
 *    YES        NO
 *     ↓          ↓
 *   WAIT       EXECUTE
 */


/*
 * ------------------------------------------------------------
 * Create ToolCall / execute action
 * ------------------------------------------------------------
 */

const runActionExecution =
  async (state) => {

    const {
      runId,
      ticket,
      recommendedAction,
      guardrailResult
    } = state;


    /*
     * --------------------------------------------------------
     * No action
     * --------------------------------------------------------
     */

    if (
      !recommendedAction ||
      recommendedAction.action_required !==
        true ||
      !recommendedAction.action
    ) {

      return {
        toolCall:
          null,

        toolResult:
          null,

        finalStatus:
          "no_action"
      };
    }


    /*
     * --------------------------------------------------------
     * Guardrail protection
     * --------------------------------------------------------
     */

    if (
      !guardrailResult ||
      guardrailResult.action_allowed !==
        true
    ) {

      return {
        toolCall:
          null,

        toolResult:
          null,

        finalStatus:
          "blocked"
      };
    }


    const action =
      recommendedAction.action;


    const payload =
      action.payload || {};


    const idempotencyKey =
      payload.idempotency_key;


    if (!idempotencyKey) {
      throw new Error(
        "Action is missing idempotency_key"
      );
    }


    /*
     * --------------------------------------------------------
     * Check whether this action already exists
     * --------------------------------------------------------
     */

    let toolCall =
      await findExistingToolCall(
        idempotencyKey
      );


    /*
     * --------------------------------------------------------
     * Existing ToolCall
     * --------------------------------------------------------
     */

    if (toolCall) {

      if (
        toolCall.status ===
        "executed"
      ) {

        return {
          toolCall,

          toolResult:
            toolCall.result,

          finalStatus:
            "executed"
        };
      }


      if (
        toolCall.status ===
        "approval_required"
      ) {

        return {
          toolCall,

          toolResult:
            null,

          finalStatus:
            "approval_required"
        };
      }
    }


    /*
     * --------------------------------------------------------
     * Create a new ToolCall
     * --------------------------------------------------------
     */

    if (!toolCall) {

      try {

        toolCall =
          await ToolCall.create({

            action_id:
              crypto.randomUUID(),

            ticket_id:
              ticket.ticket_id,

            tool_name:
              action.tool_name,

            payload,

            risk_level:
              action.risk_level,

            requires_human_approval:
              action.requires_human_approval,

            status:
              action.requires_human_approval
                ? "approval_required"
                : "requested",

            idempotency_key:idempotencyKey

          });

      } catch (error) {

        /*
         * ----------------------------------------------------
         * Race-condition protection.
         *
         * If another request created the same
         * idempotency key first, retrieve it.
         * ----------------------------------------------------
         */

        if (
          error.code ===
          11000
        ) {

          toolCall =
            await findExistingToolCall(
              idempotencyKey
            );

        } else {

          throw error;
        }
      }
    }


    /*
     * --------------------------------------------------------
     * Human approval required
     * --------------------------------------------------------
     */

    if (
      toolCall.requires_human_approval
    ) {

      return {
        toolCall,

        toolResult:
          null,

        finalStatus:
          "approval_required"
      };
    }


    /*
     * --------------------------------------------------------
     * No approval required.
     *
     * Execute immediately.
     * --------------------------------------------------------
     */

    const execution =
      await executeToolCall({
        actionId:
          toolCall.action_id
      });


    const wasUnsafeRequestEscalated =
      guardrailResult?.request_blocked === true &&
      action.tool_name === "escalate_to_human";

    return {
      toolCall:
        execution.toolCall,

      toolResult:
        execution.result,

      finalStatus:
        wasUnsafeRequestEscalated
          ? "blocked_and_escalated"
          : "executed"
    };
  };


module.exports = {
  runActionExecution
};