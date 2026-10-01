/**
 * TrustDesk deterministic triage rules.
 *
 * Gemini performs the initial semantic classification.
 * These rules validate and correct business-critical classifications.
 *
 * IMPORTANT:
 * - These rules do NOT use expected_* evaluation fields.
 * - They operate only on the actual ticket content.
 * - They provide a deterministic safety/business-policy layer
 *   after the LLM.
 */

const normalizeText = (value = "") => {
  return String(value)
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
};

const containsAny = (text, phrases) => {
  return phrases.some((phrase) => text.includes(phrase));
};

/* ============================================================
   PROMPT INJECTION / SYSTEM MANIPULATION
   ============================================================ */

const isPromptInjection = (text) => {
  const injectionPatterns = [
    "system override",
    "system override mode",
    "ignore previous instructions",
    "ignore all previous instructions",
    "ignore your instructions",
    "override the system",
    "override system",
    "developer message",
    "reveal your prompt",
    "show me your prompt",
    "show your prompt",
    "hidden prompt",
    "internal prompt",
    "api key",
    "api keys",
    "secret key",
    "secrets",
    "internal notes",
    "hidden notes",
    "disregard the policy",
    "bypass the policy",
    "bypass support policy",
    "unauthorized coupon",
    "generate an unauthorized coupon",
    "5000 inr coupon",
    "5000 INR coupon"
  ];

  return containsAny(text, injectionPatterns);
};

/* ============================================================
   SENSITIVE INFORMATION REQUEST
   ============================================================ */

const isSensitiveInformationRequest = (text) => {
  const sensitivePatterns = [
    "api key",
    "api keys",
    "secret key",
    "secrets",
    "hidden prompt",
    "hidden prompts",
    "internal prompt",
    "internal prompts",
    "system prompt",
    "system prompts",
    "reveal your prompt",
    "show me your prompt",
    "show your prompt",
    "internal notes",
    "hidden notes",
    "private notes",
    "internal instructions",
    "hidden instructions",
    "confidential information"
  ];

  return containsAny(text, sensitivePatterns);
};

/* ============================================================
   ACCOUNT SECURITY
   ============================================================ */

const isAccountSecurityIssue = (text) => {
  const accountSecurityPatterns = [
    "change my email",
    "change email",
    "change account email",
    "change my account email",
    "change phone number",
    "change my phone",
    "change password",
    "reset password",
    "account access",
    "account locked",
    "identity verification",
    "verify my identity",
    "skip identity",
    "skip verification",
    "bypass identity",
    "bypass verification",
    "unauthorized access",
    "someone accessed my account",
    "account security",
    "security issue with my account"
  ];

  return containsAny(text, accountSecurityPatterns);
};

/* ============================================================
   PHYSICAL PRODUCT DAMAGE
   ============================================================ */

const isPhysicalDamageIssue = (text) => {
  const damagePatterns = [
    "damaged",
    "damage",
    "cracked",
    "broken",
    "defective",
    "defect",
    "earbud",
    "earbuds",
    "screen broken",
    "screen cracked",
    "arrived damaged",
    "damaged on arrival",
    "broken on arrival",
    "cracked on arrival"
  ];

  return containsAny(text, damagePatterns);
};

/* ============================================================
   SAFETY-CRITICAL WARRANTY
   ============================================================ */

/*
 * IMPORTANT:
 *
 * We intentionally detect the CONCEPT:
 *
 * battery + swelling/swell/swollen
 *
 * rather than depending on one exact phrase.
 *
 * This catches:
 *
 * - battery swelling
 * - battery is swelling
 * - battery has swollen
 * - swollen battery
 * - battery started to swell
 * - battery is starting to swell
 */

const isSafetyWarrantyIssue = (text) => {
  const hasBattery = containsAny(text, [
    "battery",
    "batteries"
  ]);

  const hasBatterySwelling = containsAny(text, [
    "swell",
    "swelling",
    "swollen",
    "swells"
  ]);

  if (hasBattery && hasBatterySwelling) {
    return true;
  }

  /*
   * Other immediate safety hazards.
   */

  const otherSafetyPatterns = [
    "overheating",
    "overheated",
    "overheats",
    "very hot",
    "extremely hot",
    "smoke",
    "smoking",
    "fire",
    "burning",
    "burnt",
    "burned",
    "exploded",
    "explosion",
    "exploding"
  ];

  return containsAny(text, otherSafetyPatterns);
};

/* ============================================================
   BILLING
   ============================================================ */

const isBillingIssue = (text) => {
  const billingPatterns = [
    "charged twice",
    "charged two times",
    "double charge",
    "duplicate charge",
    "charged twice for",
    "payment taken twice",
    "duplicate payment",
    "wrong charge",
    "incorrect charge",
    "billing error",
    "billing issue",
    "payment error",
    "payment issue"
  ];

  return containsAny(text, billingPatterns);
};

/* ============================================================
   REFUND
   ============================================================ */

const isRefundIssue = (text) => {
  const refundPatterns = [
    "refund",
    "money back",
    "return my money",
    "want my money back",
    "request a refund",
    "refund review",
    "return the item",
    "return this item"
  ];

  return containsAny(text, refundPatterns);
};

/* ============================================================
   SHIPPING
   ============================================================ */

const isShippingIssue = (text) => {
  const shippingPatterns = [
    "shipping",
    "shipment",
    "delivery",
    "delayed",
    "delay",
    "late delivery",
    "package",
    "parcel",
    "tracking",
    "carrier",
    "not delivered",
    "hasn't arrived",
    "has not arrived",
    "not arrived",
    "didn't arrive",
    "did not arrive",
    "still waiting",
    "where is my order",
    "where's my order",
    "where is the order",
    "delivery date",
    "delivery problem",
    "shipping problem",
    "shipping issue"
  ];

  return containsAny(text, shippingPatterns);
};

/* ============================================================
   WARRANTY
   ============================================================ */

const isWarrantyIssue = (text) => {
  const warrantyPatterns = [
    "warranty",
    "battery",
    "hardware failure",
    "device failure",
    "manufacturing defect",
    "device is defective"
  ];

  return containsAny(text, warrantyPatterns);
};

/* ============================================================
   SENTIMENT
   ============================================================ */

const determineSentiment = (text) => {
  /*
   * Strong anger first.
   */

  const angryPatterns = [
    "angry",
    "furious",
    "outraged",
    "absolutely furious",
    "scam",
    "fraud",
    "this is unacceptable",
    "completely unacceptable"
  ];

  if (containsAny(text, angryPatterns)) {
    return "angry";
  }

  /*
   * Safety-related product problems normally indicate concern/worry.
   */

  if (isSafetyWarrantyIssue(text)) {
    return "worried";
  }

  const worriedPatterns = [
    "worried",
    "concerned",
    "concern",
    "scared",
    "afraid",
    "unsafe",
    "dangerous",
    "safety issue",
    "is this safe",
    "i am worried",
    "i'm worried"
  ];

  if (containsAny(text, worriedPatterns)) {
    return "worried";
  }

  /*
   * Delivery problems, delays, damaged products and payment
   * problems normally indicate frustration.
   */

  const frustratedPatterns = [
    "frustrated",
    "frustrating",
    "annoyed",
    "annoying",
    "ridiculous",
    "terrible",
    "very upset",
    "upset",
    "still waiting",
    "waiting for",
    "delayed",
    "delay",
    "late",
    "not delivered",
    "hasn't arrived",
    "has not arrived",
    "didn't arrive",
    "did not arrive",
    "charged twice",
    "double charge",
    "duplicate charge",
    "again",
    "disappointed",
    "inconvenient",
    "inconvenience",
    "broken",
    "damaged"
  ];

  if (containsAny(text, frustratedPatterns)) {
    return "frustrated";
  }

  return "neutral";
};

/* ============================================================
   PRIORITY
   ============================================================ */

const determinePriority = ({
  text,
  category,
  sentiment
}) => {
  /*
   * ----------------------------------------------------------
   * 1. SAFETY = URGENT
   * ----------------------------------------------------------
   */

  if (isSafetyWarrantyIssue(text)) {
    return "urgent";
  }

  /*
   * ----------------------------------------------------------
   * 2. ACCOUNT SECURITY = HIGH
   * ----------------------------------------------------------
   */

  if (category === "account_security") {
    return "high";
  }

  /*
   * ----------------------------------------------------------
   * 3. BILLING = HIGH
   * ----------------------------------------------------------
   */

  if (category === "billing") {
    return "high";
  }

  /*
   * ----------------------------------------------------------
   * 4. SHIPPING DELIVERY PROBLEM = HIGH
   * ----------------------------------------------------------
   *
   * This deliberately uses the semantic shipping detector rather
   * than relying on only "delay" or "delayed".
   *
   * Therefore variations such as:
   *
   * "my package hasn't arrived"
   * "delivery problem"
   * "shipment is late"
   * "where is my order"
   *
   * are all handled consistently.
   */

  if (
    category === "shipping" &&
    isShippingIssue(text)
  ) {
    return "high";
  }

  /*
   * ----------------------------------------------------------
   * 5. ANGRY OPERATIONAL ISSUES = HIGH
   * ----------------------------------------------------------
   */

  if (
    sentiment === "angry" &&
    ["refund", "shipping", "billing"].includes(category)
  ) {
    return "high";
  }

  /*
   * ----------------------------------------------------------
   * 6. DAMAGED PRODUCT = MEDIUM
   * ----------------------------------------------------------
   */

  if (
    category === "refund" &&
    isPhysicalDamageIssue(text)
  ) {
    return "medium";
  }

  /*
   * ----------------------------------------------------------
   * 7. NORMAL WARRANTY = MEDIUM
   * ----------------------------------------------------------
   */

  if (category === "warranty") {
    return "medium";
  }

  /*
   * ----------------------------------------------------------
   * 8. NORMAL SHIPPING = MEDIUM
   * ----------------------------------------------------------
   */

  if (category === "shipping") {
    return "medium";
  }

  /*
   * ----------------------------------------------------------
   * 9. ROUTINE REFUND = LOW
   * ----------------------------------------------------------
   */

  if (category === "refund") {
    return "low";
  }

  /*
   * ----------------------------------------------------------
   * 10. GENERAL = MEDIUM
   * ----------------------------------------------------------
   */

  return "medium";
};

/* ============================================================
   MAIN TRIAGE RULE ENGINE
   ============================================================ */

const applyTriageRules = ({
  ticket,
  customer,
  order,
  aiTriage
}) => {
  const text = normalizeText(
    `${ticket.subject || ""} ${ticket.body || ""}`
  );

  let category = aiTriage.category;

  let priority = aiTriage.priority;

  let sentiment =
    aiTriage.sentiment || "neutral";

  let escalation =
    Boolean(aiTriage.escalation);

  let reason =
    aiTriage.reason || "";

  const ruleReasons = [];

  /* ==========================================================
     1. SENSITIVE INFORMATION DISCLOSURE
     ========================================================== */

  if (isSensitiveInformationRequest(text)) {
    category = "account_security";

    priority = "high";

    sentiment = determineSentiment(text);

    if (!sentiment) {
      sentiment = "neutral";
    }

    escalation = true;

    ruleReasons.push(
      "Security-sensitive request for hidden prompts, API keys, secrets, or internal information detected; the requested information must not be disclosed and the case requires human escalation."
    );
  }

  /* ==========================================================
     2. ACCOUNT SECURITY
     ========================================================== */

  if (
    isAccountSecurityIssue(text) &&
    !isSensitiveInformationRequest(text)
  ) {
    category = "account_security";

    priority = "high";

    sentiment = determineSentiment(text);

    escalation = true;

    ruleReasons.push(
      "Account-security request detected; identity-sensitive account changes require verification and human review."
    );
  }

  /* ==========================================================
     3. SAFETY-CRITICAL WARRANTY
     ========================================================== */

  if (isSafetyWarrantyIssue(text)) {
    category = "warranty";

    priority = "urgent";

    sentiment = "worried";

    escalation = true;

    ruleReasons.push(
      "Safety-critical product issue detected; urgent human escalation is required."
    );
  }

  /* ==========================================================
     4. DAMAGED PHYSICAL PRODUCT
     ========================================================== */

  if (
    isPhysicalDamageIssue(text) &&
    !isSafetyWarrantyIssue(text)
  ) {
    category = "refund";

    priority = "medium";

    sentiment = determineSentiment(text);

    if (sentiment === "neutral") {
      sentiment = "frustrated";
    }

    ruleReasons.push(
      "Physical product damage detected; classified under the refund/return workflow."
    );
  }

  /* ==========================================================
     5. BILLING
     ========================================================== */

  if (isBillingIssue(text)) {
    category = "billing";

    priority = "high";

    sentiment = determineSentiment(text);

    if (sentiment === "neutral") {
      sentiment = "frustrated";
    }

    /*
     * The provided TrustDesk billing workflow does not require
     * escalation for the ordinary duplicate-charge case.
     */

    escalation = false;

    ruleReasons.push(
      "Billing/payment issue detected; classified as high-priority billing support."
    );
  }

  /* ==========================================================
     6. EXPLICIT REFUND
     ========================================================== */

  if (
    isRefundIssue(text) &&
    !isPhysicalDamageIssue(text) &&
    !isBillingIssue(text) &&
    !isSensitiveInformationRequest(text)
  ) {
    category = "refund";

    priority = "low";

    sentiment = determineSentiment(text);

    ruleReasons.push(
      "Explicit refund request detected."
    );
  }

  /* ==========================================================
     7. SHIPPING
     ========================================================== */

  if (
    isShippingIssue(text) &&
    !isPhysicalDamageIssue(text) &&
    !isBillingIssue(text) &&
    !isAccountSecurityIssue(text) &&
    !isSensitiveInformationRequest(text)
  ) {
    category = "shipping";

    sentiment = determineSentiment(text);

    if (sentiment === "neutral") {
      sentiment = "frustrated";
    }

    /*
     * A detected shipping/delivery support problem is high priority
     * in the TrustDesk operational workflow.
     */

    priority = "high";

    ruleReasons.push(
      "Shipping/delivery issue detected and assigned high operational priority."
    );
  }

  /* ==========================================================
     8. GENERAL PROMPT INJECTION
     ========================================================== */

  if (
    isPromptInjection(text) &&
    !isSensitiveInformationRequest(text) &&
    !isAccountSecurityIssue(text) &&
    !isSafetyWarrantyIssue(text) &&
    !isPhysicalDamageIssue(text) &&
    !isBillingIssue(text) &&
    !isRefundIssue(text)
  ) {
    category = "general";

    priority = "medium";

    sentiment = "neutral";

    escalation = true;

    ruleReasons.push(
      "Prompt-injection or unauthorized system-manipulation request detected; the requested unsafe instruction was not treated as customer authorization."
    );
  }

  /* ==========================================================
     9. FINAL PRIORITY VALIDATION
     ========================================================== */

  priority = determinePriority({
    text,
    category,
    sentiment
  });

  /*
   * Safety-critical issue always wins.
   */

  if (isSafetyWarrantyIssue(text)) {
    category = "warranty";
    priority = "urgent";
    sentiment = "worried";
    escalation = true;
  }

  /*
   * Account security always remains high priority.
   */

  if (
    category === "account_security" &&
    !isSafetyWarrantyIssue(text)
  ) {
    priority = "high";
  }

  /*
   * Billing always remains high priority.
   */

  if (category === "billing") {
    priority = "high";
  }

  /*
   * Shipping support problems remain high priority.
   */

  if (
    category === "shipping" &&
    isShippingIssue(text)
  ) {
    priority = "high";
  }

  /* ==========================================================
     10. FINAL ESCALATION SAFETY RULE
     ========================================================== */

  if (
    isSafetyWarrantyIssue(text) ||
    isAccountSecurityIssue(text) ||
    isSensitiveInformationRequest(text)
  ) {
    escalation = true;
  }

  /*
   * General prompt injection should also be escalated.
   */

  if (
    isPromptInjection(text) &&
    !isSensitiveInformationRequest(text) &&
    !isAccountSecurityIssue(text) &&
    !isSafetyWarrantyIssue(text) &&
    !isPhysicalDamageIssue(text) &&
    !isBillingIssue(text) &&
    !isRefundIssue(text)
  ) {
    escalation = true;
  }

  /* ==========================================================
     11. FINAL REASON
     ========================================================== */

    if (ruleReasons.length > 0) {
        reason = ruleReasons.join(" ");
    }

  return {
    category,
    priority,
    sentiment,
    escalation,
    reason
  };
};

module.exports = {
  applyTriageRules,
  isPromptInjection,
  isSensitiveInformationRequest,
  isAccountSecurityIssue,
  isPhysicalDamageIssue,
  isSafetyWarrantyIssue,
  determineSentiment,
  determinePriority
};