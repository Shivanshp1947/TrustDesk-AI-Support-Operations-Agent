const mongoose = require("mongoose");

const traceSchema = new mongoose.Schema(
  {
    run_id: {
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

    run_type: {
      type: String,
      enum: [
        "agent_run",
        "triage",
        "draft_reply",
        "tool_recommendation",
        "eval_case"
      ],
      required: true
    },

    status: {
      type: String,
      enum: [
        "started",
        "running",
        "completed",
        "failed"
      ],
      default: "started"
    },

    retrieved_doc_ids: {
      type: [String],
      default: []
    },

    tool_calls: {
      type: [mongoose.Schema.Types.Mixed],
      default: []
    },

    guardrail_results: {
      type: [mongoose.Schema.Types.Mixed],
      default: []
    },

    final_status: {
      type: String
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },

    created_at: {
      type: Date,
      default: Date.now
    },

    completed_at: {
      type: Date
    }
  }
);

module.exports = mongoose.model("Trace", traceSchema);