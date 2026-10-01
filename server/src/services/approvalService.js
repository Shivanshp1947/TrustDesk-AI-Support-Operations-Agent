const crypto = require("crypto");

const Approval = require("../models/Approval");
const ToolCall = require("../models/ToolCall");
const Ticket = require("../models/Ticket");

const {
  executeToolCall
} = require("./toolExecutionService");


/*
 * ============================================================
 * TrustDesk Approval Service
 * ============================================================
 *
 * Responsibility:
 *
 * 1. Create approval records.
 * 2. Approve or reject ToolCalls.
 * 3. Execute approved ToolCalls.
 * 4. Preserve idempotent behavior.
 */


/*
 * ------------------------------------------------------------
 * Approve an action
 * ------------------------------------------------------------
 */

const approveAction =async ({actionId,reviewerId,reason}) => {

    if (!actionId) {
      throw new Error("actionId is required");
    }


    if (!reviewerId) {
      throw new Error("reviewerId is required");
    }


    const toolCall = await ToolCall.findOne({action_id:actionId});


    if (!toolCall) {
      throw new Error(`ToolCall not found: ${actionId}`);
    }

    if (toolCall.requires_human_approval !== true) {
        throw new Error("This ToolCall does not require human approval.");
    }


    /*
     * --------------------------------------------------------
     * Idempotent approval
     * --------------------------------------------------------
     */

    const existingApproval =
      await Approval.findOne({
        action_id:
          actionId
      });


    if (existingApproval) {

      if (
        existingApproval.decision ===
        "approved"
      ) {

        const execution =
          await executeToolCall({
            actionId
          });

        return {
          approval:
            existingApproval,

          ...execution
        };
      }


      return {
        approval:
          existingApproval,

        toolCall,

        result:
          null
      };
    }


    /*
     * --------------------------------------------------------
     * Validate ToolCall state
     * --------------------------------------------------------
     */

    if (
      toolCall.status !==
      "approval_required"
    ) {

      throw new Error(
        `ToolCall is not waiting for approval. Current status: ${toolCall.status}`
      );
    }


    /*
     * --------------------------------------------------------
     * Create approval record
     * --------------------------------------------------------
     */

    const approval =
      await Approval.create({
        approval_id:
          crypto.randomUUID(),

        action_id:
          actionId,

        draft_id:
          null,

        reviewer_id:
          reviewerId,

        decision:
          "approved",

        reason:
          reason ||
          "Action approved by reviewer."
      });


    /*
     * --------------------------------------------------------
     * Update ToolCall
     * --------------------------------------------------------
     */

    toolCall.status =
      "approved";

    await toolCall.save();


    /*
     * --------------------------------------------------------
     * Execute approved action
     * --------------------------------------------------------
     */

    const execution =
      await executeToolCall({
        actionId
      });


    return {
      approval,

      ...execution
    };
  };


/*
 * ------------------------------------------------------------
 * Reject an action
 * ------------------------------------------------------------
 */

const rejectAction =async ({actionId, reviewerId, reason}) => {

    if (!actionId) {
      throw new Error("actionId is required");
    }

    if (!reviewerId) {
      throw new Error("reviewerId is required");
    }

    const toolCall = await ToolCall.findOne({action_id:actionId});
    
    if (!toolCall) {
        throw new Error(`ToolCall not found: ${actionId}`);
    }

    if (toolCall.requires_human_approval !== true) {
        throw new Error("This ToolCall does not require human approval.");
    }




    const existingApproval =
      await Approval.findOne({
        action_id:
          actionId
      });


    if (existingApproval) {

      return {
        approval:
          existingApproval,

        toolCall
      };
    }


    if (
      toolCall.status !==
      "approval_required"
    ) {

      throw new Error(
        `ToolCall is not waiting for approval. Current status: ${toolCall.status}`
      );
    }



    const approval =
      await Approval.create({
        approval_id:
          crypto.randomUUID(),

        action_id:
          actionId,

        draft_id:
          null,

        reviewer_id:
          reviewerId,

        decision:
          "rejected",

        reason:
          reason ||
          "Action rejected by reviewer."
      });


      toolCall.status = "rejected";

      toolCall.error =
        reason ||
        "Action rejected by reviewer.";

      await toolCall.save();

      /*
      * Keep the ticket status synchronized with
      * the rejected operational decision.
      */
      // const Ticket = require("../models/Ticket");

      await Ticket.updateOne(
        {
          ticket_id: toolCall.ticket_id
        },
        {
          $set: {
            status: "action_rejected"
          }
        }
      );


    return {
      approval,

      toolCall
    };
  };


module.exports = {
  approveAction,
  rejectAction
};