const mongoose = require("mongoose");

const toolCallSchema = new mongoose.Schema(
  {
    action_id: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    ticket_id: {
      type: String,
      required: true,
      index: true
    },

    tool_name: {
      type: String,
      required: true,
      index: true
    },

    payload: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },

    risk_level: {
      type: String,
      enum: [
        "low",
        "medium",
        "high"
      ],
      required: true
    },

    requires_human_approval: {
      type: Boolean,
      default: true
    },

    status: {
      type: String,
      enum: [
        "requested",
        "approval_required",
        "approved",
        "rejected",
        "executed",
        "failed",
        "cancelled"
      ],
      default: "requested"
    },

    idempotency_key: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    result: {
      type: mongoose.Schema.Types.Mixed
    },

    error: {
      type: String
    },

    created_at: {
      type: Date,
      default: Date.now
    },

    executed_at: {
      type: Date
    }
  }
);

module.exports = mongoose.model("ToolCall", toolCallSchema);