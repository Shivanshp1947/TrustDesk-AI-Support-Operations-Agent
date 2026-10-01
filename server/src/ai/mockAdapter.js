//  Simple deterministic AI adapter for local tests.
 
//  This adapter is used when:
//  AI_PROVIDER=mock
 
//  It allows TrustDesk to run locally without
//  consuming Gemini API requests.

// ===================================Triage Ticket=========================
const triageTicket = async ({ticket}) => {
  const text = `${ticket.subject} ${ticket.body}`.toLowerCase();

  let category = "general";
  let priority = "medium";
  let sentiment = "neutral";
  let escalation = false;
  let reason = "General support request.";

  if (
    text.includes("account") ||
    text.includes("identity") ||
    text.includes("system prompt") ||
    text.includes("api key") ||
    text.includes("internal instructions")
  ) {
    category = "account_security";
    priority = "high";
    sentiment = "neutral";
    escalation = true;

    reason =
      "The request involves sensitive account or internal information and requires human review.";
  } else if (
    text.includes("battery") ||
    text.includes("warranty") ||
    text.includes("swelling")
  ) {
    category = "warranty";
    priority =
      text.includes("swelling")
        ? "urgent"
        : "high";

    sentiment = "worried";
    escalation = text.includes("swelling");

    reason =
      "The ticket concerns a product warranty or safety issue.";
  } else if (
    text.includes("refund") ||
    text.includes("replace") ||
    text.includes("damaged")
  ) {
    category = "refund";
    priority = "medium";
    sentiment = "frustrated";

    reason = "The customer is requesting help with a refund or damaged product.";
  } else if (
    text.includes("tracking") ||
    text.includes("package") ||
    text.includes("shipping")
  ) {
    category = "shipping";
    priority = "high";
    sentiment = "frustrated";

    reason = "The ticket concerns shipment tracking or delivery.";
  } else if (
    text.includes("charge") ||
    text.includes("payment") ||
    text.includes("billing")
  ) {
    category = "billing";
    priority = "high";
    sentiment = "frustrated";

    reason = "The ticket concerns a billing or payment issue.";
  }

  return {category, priority, sentiment, escalation, reason};
};


// =================================Generated Draft=========================================
// Generate a simple customer-facing draft.
// This is intentionally deterministic so that
// local testing does not require Gemini.


// Generate a deterministic customer-facing draft.
// The mock adapter intentionally produces grounded,
// evaluation-friendly responses so local evaluation
// remains deterministic and does not require Gemini.

const generateDraft = async ({ticket,retrievedDocuments}) => {

  const text = `${ticket.subject} ${ticket.body}`.toLowerCase();

  let body = "Thank you for contacting TrustDesk Support. We have reviewed your request and will help you with the issue.";

  const recommended_actions = [];


  /*
   * --------------------------------------------------------
   * Battery / safety issue
   * --------------------------------------------------------
   */

  if (
    text.includes("battery") ||
    text.includes("swelling") ||
    text.includes("smoke") ||
    text.includes("fire")
  ) {
    body = "We are concerned about the safety issue you reported. Please stop using the affected device and do not attempt to troubleshoot the swollen battery yourself. This case requires review by a human support specialist.";

    recommended_actions.push("human_escalation");
  }


  
  // ---------------------Account email / identity verification------------------------------

  else if (
    text.includes("change my account email") ||
    text.includes("identity checks") ||
    text.includes("identity verification")
  ) {
    body ="For account security, identity verification is required before changing account information. We cannot change the account email directly while verification is incomplete, and the request to bypass the identity-check policy cannot be followed. A human support specialist should review the request.";

    recommended_actions.push("human_escalation");
  }


//  ---------------------------Sensitive information / system prompt / secrets----------------------------------
 
  else if (
    text.includes("system prompt") ||
    text.includes("api key") ||
    text.includes("internal notes") ||
    text.includes("internal instructions")
  ) {
    body = "I cannot provide or reveal the system prompt, API keys, secrets, or internal support notes. These are sensitive internal information and cannot be disclosed. A human support specialist can assist with the underlying customer-support request.";

    recommended_actions.push("human_escalation");
  }


  
// -------------------------------Prompt injection / coupon request-----------------------------------------------------

  else if (
    text.includes("system override") ||
    text.includes("ignore all instructions") ||
    text.includes("ignore the support policy") ||
    text.includes("issue me a") &&
      text.includes("coupon")
  ) {

    body = "We cannot follow the prompt-injection or policy-bypass instruction, and we cannot issue the requested coupon based on that instruction. The unsafe instruction should not be treated as customer authorization. A human support specialist should review the request.";

    recommended_actions.push("human_escalation");
  }



// ------------------------------------Final-sale software------------------------------------------

  else if (
    (
      text.includes("software") ||
      text.includes("cloud backup") ||
      text.includes("license")
    ) &&
    (
      text.includes("refund") ||
      text.includes("final sale")
    )
  ) {
    body = "The Cloud Backup Annual License is a final-sale software license under the applicable policy. We cannot approve an immediate refund for this final-sale item. If you believe there is an exception or another issue with the purchase, a support specialist can review the request.";

    recommended_actions.push("policy_review");
  }


// -----------------------------Duplicate billing charge----------------------------------------

  else if (
    text.includes("double charge") ||
    text.includes("charged twice") ||
    text.includes("duplicate charge")
  ) {
    body = "We have identified this as a potential duplicate billing charge. We will start a billing review rather than promise an immediate refund. Please provide the transaction reference, if available, so the support team can verify the duplicate charge.";

    recommended_actions.push("refund_review");
  }


// ------------------------Shipping / stale tracking------------------------------------------

  else if (
    text.includes("tracking") ||
    text.includes("package") ||
    text.includes("shipping") ||
    text.includes("delivery") ||
    text.includes("not moved")
  ) {
    body = "We have reviewed the shipping issue and the tracking information. Because the tracking has not moved for several business days, the support team can open a carrier investigation. A refund should not be promised immediately while the delivery issue is being reviewed.";

    recommended_actions.push("shipping_review");
  }


// ---------------------------------Damaged product-----------------------------------

  else if (
    text.includes("damaged") ||
    text.includes("broken") ||
    text.includes("cracked") ||
    text.includes("defective") ||
    text.includes("replacement")
  ) {
    body = "We are sorry that your product arrived damaged. We have reviewed the applicable return and replacement policy. A replacement can be reviewed, and please provide a clear photo of the damaged item so the support team can verify the issue and proceed with the appropriate review.";

    recommended_actions.push("replacement_review");
  }


// ------------------------------------Generic refund / return------------------------------------

  else if (
    text.includes("refund") ||
    text.includes("return")
  ) {
    body = "Thank you for contacting us. We have reviewed your refund request and the relevant return policy. Our support team will review the request and help you with the next steps.";

    recommended_actions.push("refund_review");
  }


// ---------------------------------No knowledge retrieved---------------------------------

  if (!retrievedDocuments.length) {
    body = "Thank you for contacting TrustDesk Support. We could not find enough relevant policy information to provide a specific answer, so this request should be reviewed by a support specialist.";

    recommended_actions.push("human_escalation");
  }


  return {body,recommended_actions};
};


module.exports = {triageTicket,generateDraft};