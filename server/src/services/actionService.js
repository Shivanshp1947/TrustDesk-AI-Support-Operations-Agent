const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

/*
 * ============================================================
 * TrustDesk Action Service
 * ============================================================
 *
 * Responsibility:
 *
 * 1. Load the canonical tool catalog.
 * 2. Decide whether the ticket needs an operational action.
 * 3. Select ONE appropriate action.
 * 4. Build the proposed action payload.
 *
 * IMPORTANT:
 *
 * This service DOES NOT execute the action.
 *
 * Execution will happen later only after:
 * recommendation-> guardrail check-> human approval-> tool execution
 * 
 * This separation is important for safety.
 */


/*
 * ------------------------------------------------------------
 * Tool catalog
 * ------------------------------------------------------------
 *
 * The canonical catalog is:
 *
 * /data/tool_actions.json
 *
 * We are not hard-coding tool definitions here.
 */

const TOOL_CATALOG_PATH =path.resolve(__dirname,"../../../data/tool_actions.json");


// Load the canonical TrustDesk tool catalog.
const loadToolCatalog = () => {
  if (!fs.existsSync(TOOL_CATALOG_PATH)) {
    throw new Error(`Tool catalog not found: ${TOOL_CATALOG_PATH}`);
  }

  const content = fs.readFileSync(TOOL_CATALOG_PATH,"utf8");

  const tools = JSON.parse(content);

  if (!Array.isArray(tools)) {
    throw new Error("tool_actions.json must contain an array");
  }

  return tools;
};



// Find a tool by its name.
const getToolDefinition = (tools, toolName) => {
  const tool =tools.find((item) =>item.tool_name === toolName);

  if (!tool) {
    throw new Error(`Tool not found in catalog: ${toolName}`);
  }

  return tool;
};



// Check whether text contains at least
// one of the supplied keywords.
const containsAny = (text,keywords) => {
  const normalized = String(text || "").toLowerCase();

  return keywords.some((keyword) =>
      normalized.includes(keyword)
  );
};


/**
 * Build a stable idempotency key for
 * the proposed action.
 *
 * The actual ToolCall will be created
 * later during the approval workflow.
 */
const createIdempotencyKey = ({ticketId, toolName}) => {

  return [
    "trustdesk",
    ticketId,
    toolName,
  ].join(":");
};


/**
 * Select the appropriate action.
 *
 * IMPORTANT:
 *
 * We deliberately do NOT use:
 *
 * ticket.expected_actions
 *
 * because those fields are evaluation-only.
 *
 * The recommendation must come from
 * actual ticket context + triage + draft.
 */
const selectAction = ({
  ticket,
  triage,
  draft,
  order,
  customer,
  tools,
  runId
}) => {

  if (!ticket) {
    throw new Error("Ticket is required for action recommendation");
  }

  if (!triage) {
    throw new Error("Triage result is required for action recommendation");
  }



  // ====================Extract useful information=========================

  const subject =
    ticket.subject || "";

  const body =
    ticket.body || "";

  const combinedText =
    `${subject} ${body}`;


  /*
   * Draft structure:
   *
   * result.draft.draft.recommended_actions
   *
   * depending on where it came from.
   *
   * We safely handle both forms.
   */

  const recommendedActions =
    draft?.draft?.recommended_actions ||
    draft?.recommended_actions ||
    [];


  const draftActionText =
    recommendedActions.join(" ");


  const combinedActionText =
    `${combinedText} ${draftActionText}`;


  /*
   * ----------------------------------------------------------
   * Safety-first rule
   * ----------------------------------------------------------
   *
   * If triage says escalation is required,
   * route to a human instead of attempting
   * an operational action.
   */

  if (triage.escalation === true) {

    const tool =
      getToolDefinition(
        tools,
        "escalate_to_human"
      );

    return {
      tool_name:
        tool.tool_name,

      description:
        tool.description,

      risk_level:
        tool.risk_level,

      requires_human_approval:
        tool.requires_human_approval,

      payload: {
        ticket_id:
          ticket.ticket_id,

        reason:
          triage.reason ||
          "Ticket requires human escalation",

        queue:
          "support_specialist",

        idempotency_key:
          createIdempotencyKey({
            ticketId:
              ticket.ticket_id,
            toolName:
              tool.tool_name
          })
      },

      reason:
        "Triage marked this ticket for human escalation."
    };
  }


  /*
   * ----------------------------------------------------------
   * Replacement order
   * ----------------------------------------------------------
   *
   * Example:
   *
   * tkt_9001
   *
   * "left earbud cracked"
   * "Can I get a replacement?"
   */

  const replacementRequested =
    containsAny(
      combinedActionText,
      [
        "replacement",
        "replace",
        "damaged",
        "cracked",
        "defective"
      ]
    );


  if (
    replacementRequested &&
    (
      triage.category === "refund" ||
      triage.category === "warranty"
    )
  ) {

    const tool =
      getToolDefinition(
        tools,
        "create_replacement_order"
      );

    const firstItem =
      order?.items?.[0];


    return {
      tool_name:
        tool.tool_name,

      description:
        tool.description,

      risk_level:
        tool.risk_level,

      requires_human_approval:
        tool.requires_human_approval,

      payload: {
        order_id:
          order?.order_id || null,

        sku:
          firstItem?.sku || null,

        reason:
          ticket.subject,

        idempotency_key:
          createIdempotencyKey({
            ticketId:
              ticket.ticket_id,
            toolName:
              tool.tool_name
          })
      },

      reason:
        "Ticket indicates a damaged or defective physical product and the draft recommends a replacement workflow."
    };
  }

  /*
  * ----------------------------------------------------------
  * Final-sale software protection
  * ----------------------------------------------------------
  *
  * Final-sale software licenses must not enter the
  * refund-review workflow merely because the customer
  * mentions the word "refund".
  */

  const finalSaleSoftware =
    Boolean(
      order?.items?.some(
        (item) =>
          item.final_sale === true &&
          (
            item.category ===
              "software" ||
            containsAny(
              item.name,
              [
                "software",
                "license"
              ]
            )
          )
      )
    ) ||
    (
      triage.category ===
        "refund" &&
      containsAny(
        combinedText,
        [
          "final sale",
          "final-sale",
          "software license",
          "software",
          "cloud backup"
        ]
      )
    );
  if (finalSaleSoftware) {
    return null;
  }


  /*
   * ----------------------------------------------------------
   * Refund review
   * ----------------------------------------------------------
   *
   * This does NOT immediately refund money.
   *
   * It only starts a human-reviewed
   * refund workflow.
   */

  

  const refundRequested =
    containsAny(
      combinedActionText,
      [
        "refund",
        "refund review",
        "double charge",
        "charged twice",
        "duplicate charge"
      ]
    );


  if (
    refundRequested &&
    (
      triage.category === "refund" ||
      triage.category === "billing"
    )
  ) {

    const tool =
      getToolDefinition(
        tools,
        "start_refund_review"
      );


    return {
      tool_name:
        tool.tool_name,

      description:
        tool.description,

      risk_level:
        tool.risk_level,

      requires_human_approval:
        tool.requires_human_approval,

      payload: {
        order_id:
          order?.order_id || null,

        reason:
          ticket.subject,

        amount:
          order?.total || 0,

        idempotency_key:
          createIdempotencyKey({
            ticketId:
              ticket.ticket_id,
            toolName:
              tool.tool_name
          })
      },

      reason:
        "Ticket indicates a refund or billing issue that should enter the human-reviewed refund workflow."
    };
  }


  /*
   * ----------------------------------------------------------
   * Shipping investigation
   * ----------------------------------------------------------
   */

  const shippingIssue =
    containsAny(
      combinedText,
      [
        "tracking",
        "not moved",
        "no movement",
        "stale",
        "lost package",
        "delivery delay"
      ]
    );


  if (
    shippingIssue &&
    triage.category === "shipping"
  ) {

    const tool =
      getToolDefinition(
        tools,
        "open_carrier_investigation"
      );


    return {
      tool_name:
        tool.tool_name,

      description:
        tool.description,

      risk_level:
        tool.risk_level,

      requires_human_approval:
        tool.requires_human_approval,

      payload: {
        order_id:
          order?.order_id || null,

        tracking_number:
          order?.tracking_number || null,

        reason:
          ticket.subject,

        idempotency_key:
          createIdempotencyKey({
            ticketId:
              ticket.ticket_id,
            toolName:
              tool.tool_name
          })
      },

      reason:
        "Ticket indicates a shipping or tracking problem."
    };
  }


  /*
   * ----------------------------------------------------------
   * No operational action
   * ----------------------------------------------------------
   */

  return null;
};


/**
 * Main action recommendation function.
 */
const recommendAction = async ({
  ticket,
  customer,
  order,
  triage,
  draft,
  retrievedDocuments,
  runId
}) => {

  if (!ticket) {
    throw new Error(
      "Ticket context is required"
    );
  }

  if (!triage) {
    throw new Error(
      "Triage result is required"
    );
  }

  if (!runId) {
    throw new Error(
      "runId is required"
    );
  }


  /*
   * Load the canonical tool catalog.
   */

  const tools =
    loadToolCatalog();


  /*
   * Select the appropriate action.
   */

  const action =
    selectAction({
      ticket,
      customer,
      order,
      triage,
      draft,
      retrievedDocuments,
      tools,
      runId
    });


  /*
   * No action required.
   */

  if (!action) {
    return {
      ticket_id:
        ticket.ticket_id,

      action_required:
        false,

      action:
        null,

      run_id:
        runId
    };
  }


  /*
   * Action recommendation exists.
   *
   * IMPORTANT:
   *
   * We are NOT creating a ToolCall
   * yet.
   *
   * That will happen later when we
   * implement the approval workflow.
   */

  return {
    ticket_id:
      ticket.ticket_id,

    action_required:
      true,

    action: {
      ...action,

      status:
        "recommended"
    },

    run_id:
      runId
  };
};


module.exports = {
  recommendAction,
  loadToolCatalog
};