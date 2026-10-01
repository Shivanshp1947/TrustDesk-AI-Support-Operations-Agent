const mongoose = require("mongoose");

const triageSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: [
        "shipping",
        "refund",
        "warranty",
        "billing",
        "account_security",
        "general"
      ]
    },

    priority: {
      type: String,
      enum: [
        "low",
        "medium",
        "high",
        "urgent"
      ]
    },

    sentiment: {
      type: String
    },

    escalation: {
      type: Boolean,
      default: false
    },

    reason: {
      type: String
    },

    generated_at: {
      type: Date
    },

    run_id: {
      type: String
    }
  },
  {
    _id: false
  }
);

const ticketSchema = new mongoose.Schema(
  {
    ticket_id: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    customer_id: {
      type: String,
      required: true,
      index: true
    },

    order_id: {
      type: String,
      default: null,
      index: true
    },

    channel: {
      type: String,
      required: true
    },

    subject: {
      type: String,
      required: true,
      trim: true
    },

    body: {
      type: String,
      required: true
    },

    created_at: {
      type: Date,
      required: true,
      index: true
    },

    status: {
      type: String,
      default: "open"
    },

    triage: {
      type: triageSchema,
      default: null
    },
    // Evaluation-only fields
    // DO NOT use these fields in production agent logic.
    expected_category: {
      type: String
    },

    expected_priority: {
      type: String
    },

    expected_sentiment: {
      type: String
    },

    expected_escalation: {
      type: Boolean
    },

    expected_actions: {
      type: [String],
      default: []
    }
  }
);

module.exports = mongoose.model("Ticket", ticketSchema);