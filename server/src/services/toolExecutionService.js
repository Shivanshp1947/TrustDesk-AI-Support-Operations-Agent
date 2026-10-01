const fs = require("fs");
const path = require("path");


const Ticket = require("../models/Ticket");
const ToolCall = require("../models/ToolCall");

const toolCatalogPath =
  path.resolve(
    __dirname,
    "../../..",
    "data",
    "tool_actions.json"
  );


const loadToolCatalog = () => {

  const raw =
    fs.readFileSync(
      toolCatalogPath,
      "utf8"
    );

  return JSON.parse(raw);
};


const findToolDefinition =
  (toolName) => {

    const catalog =
      loadToolCatalog();

    return catalog.find(
      (tool) =>
        tool.tool_name ===
        toolName
    );
  };


/*
 * ============================================================
 * TrustDesk Tool Execution Service
 * ============================================================
 *
 * Responsibility:
 *
 * 1. Execute approved tool calls.
 * 2. Perform the actual domain-side operation.
 * 3. Enforce idempotency.
 * 4. Store the execution result.
 *
 * IMPORTANT:
 *
 * This is a controlled internal tool executor.
 *
 * It does NOT call an external payment,
 * shipping, or order-management system.
 *
 * For the capstone, the execution is represented
 * through MongoDB state changes and a persisted result.
 */


/*
 * ------------------------------------------------------------
 * Find existing ToolCall by idempotency key
 * ------------------------------------------------------------
 */

const findExistingToolCall =
  async (idempotencyKey) => {

    return ToolCall.findOne({
      idempotency_key:
        idempotencyKey
    });
  };


/*
 * ------------------------------------------------------------
 * Execute the domain action
 * ------------------------------------------------------------
 */

const executeDomainAction =
  async (toolCall) => {

    const {
      tool_name,
      payload,
      ticket_id
    } = toolCall;

    const toolDefinition = findToolDefinition(tool_name);


    if (!toolDefinition) {
        throw new Error(`Unknown tool: ${tool_name}`);
    }


    if (toolDefinition.requires_human_approval === true && toolCall.requires_human_approval !== true) {
        throw new Error(`Approval configuration mismatch for tool: ${tool_name}`);
    }


    /*
     * --------------------------------------------------------
     * Create replacement order
     * --------------------------------------------------------
     */

    if (
      tool_name ===
      "create_replacement_order"
    ) {

      const replacementOrderId =
        `replacement_${toolCall.action_id}`;


      await Ticket.updateOne(
        {
          ticket_id
        },
        {
          $set: {
            status:
              "replacement_created"
          }
        }
      );


      return {
        success: true,

        tool_name,

        replacement_order_id:
          replacementOrderId,

        original_order_id:
          payload.order_id,

        sku:
          payload.sku,

        message:
          "Replacement order created successfully."
      };
    }


    /*
     * --------------------------------------------------------
     * Escalate to human
     * --------------------------------------------------------
     */

    if (
      tool_name ===
      "escalate_to_human"
    ) {

      await Ticket.updateOne(
        {
          ticket_id
        },
        {
          $set: {
            status:
              "escalated"
          }
        }
      );


      return {
        success: true,

        tool_name,

        ticket_id,

        queue:
          payload.queue,

        message:
          "Ticket escalated to a human support specialist."
      };
    }


    /*
     * --------------------------------------------------------
     * Start refund review
     * --------------------------------------------------------
     */

    if (
      tool_name ===
      "start_refund_review"
    ) {

      await Ticket.updateOne(
        {
          ticket_id
        },
        {
          $set: {
            status:
              "refund_review_started"
          }
        }
      );


      return {
        success: true,

        tool_name,

        ticket_id,

        order_id:
          payload.order_id,

        amount:
          payload.amount,

        message:
          "Human-reviewed refund workflow started."
      };
    }


    /*
     * --------------------------------------------------------
     * Open carrier investigation
     * --------------------------------------------------------
     */

    if (
      tool_name ===
      "open_carrier_investigation"
    ) {

      await Ticket.updateOne(
        {
          ticket_id
        },
        {
          $set: {
            status:
              "carrier_investigation_opened"
          }
        }
      );


      return {
        success: true,

        tool_name,

        ticket_id,

        order_id:
          payload.order_id,

        tracking_number:
          payload.tracking_number,

        message:
          "Carrier investigation opened."
      };
    }


    /*
     * --------------------------------------------------------
     * Issue coupon
     * --------------------------------------------------------
     */

    if (
      tool_name ===
      "issue_coupon"
    ) {

      await Ticket.updateOne(
        {
          ticket_id
        },
        {
          $set: {
            status:
              "coupon_issued"
          }
        }
      );


      return {
        success: true,

        tool_name,

        ticket_id,

        customer_id:
          payload.customer_id,

        amount:
          payload.amount,

        message:
          "Goodwill coupon issued."
      };
    }


    /*
     * --------------------------------------------------------
     * Lock account
     * --------------------------------------------------------
     */

    if (
      tool_name ===
      "lock_account"
    ) {

      await Ticket.updateOne(
        {
          ticket_id
        },
        {
          $set: {
            status:
              "account_locked"
          }
        }
      );


      return {
        success: true,

        tool_name,

        ticket_id,

        customer_id:
          payload.customer_id,

        message:
          "Account security action completed."
      };
    }


    throw new Error(
      `Unsupported tool: ${tool_name}`
    );
  };


/*
 * ------------------------------------------------------------
 * Execute ToolCall
 * ------------------------------------------------------------
 */

const executeToolCall =
  async ({
    actionId
  }) => {

    const toolCall =
      await ToolCall.findOne({
        action_id:
          actionId
      });


    if (!toolCall) {
      throw new Error(
        `ToolCall not found: ${actionId}`
      );
    }


    /*
     * --------------------------------------------------------
     * Idempotency protection
     * --------------------------------------------------------
     *
     * If this action has already executed,
     * return the stored result.
     */

    if (
      toolCall.status ===
        "executed" &&
      toolCall.result
    ) {

      return {
        toolCall,

        result:
          toolCall.result,

        alreadyExecuted:
          true
      };
    }


    /*
     * Only approved or non-approval actions
     * may execute.
     */

    if (
      toolCall.status !==
        "approved" &&
      !(
        toolCall.status ===
          "requested" &&
        !toolCall.requires_human_approval
      )
    ) {

      throw new Error(
        `ToolCall cannot execute from status: ${toolCall.status}`
      );
    }


    try {

      const result =
        await executeDomainAction(
          toolCall
        );


      toolCall.status =
        "executed";

      toolCall.result =
        result;

      toolCall.executed_at =
        new Date();

      toolCall.error =
        undefined;


      await toolCall.save();


      return {
        toolCall,

        result,

        alreadyExecuted:
          false
      };

    } catch (error) {

      toolCall.status =
        "failed";

      toolCall.error =
        error.message;

      await toolCall.save();

      throw error;
    }
  };


module.exports = {
  findExistingToolCall,
  executeToolCall
};