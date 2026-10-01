const mongoose = require("mongoose");

const evalCaseResultSchema = new mongoose.Schema(
  {
    case_id: {
      type: String,
      required: true
    },

    passed: {
      type: Boolean,
      default: false
    },

    expected: {
      type: mongoose.Schema.Types.Mixed
    },

    actual: {
      type: mongoose.Schema.Types.Mixed
    },

    reason: {
      type: String
    },
    checks: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    answer_requirements: {
      type: mongoose.Schema.Types.Mixed,
      default: []
    }
  },
  {
    _id: false
  }
);

const evalRunSchema = new mongoose.Schema(
  {
    eval_run_id: {
      type: String,
      required: true,
      unique: true,
      index: true
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

    total_cases: {
      type: Number,
      default: 0
    },

    passed_cases: {
      type: Number,
      default: 0
    },

    metrics: {
      triage_accuracy: {
        type: Number,
        default: 0
      },

      priority_accuracy: {
        type: Number,
        default: 0
      },

      citation_coverage: {
        type: Number,
        default: 0
      },

      unsafe_action_block_rate: {
        type: Number,
        default: 0
      },

      allowed_action_recall: {
        type: Number,
        default: 0
      },

      escalation_accuracy: {
        type: Number,
        default: 0
      },

      answer_requirement_coverage: {
        type: Number,
        default: 0
      }
    },

    case_results: {
      type: [evalCaseResultSchema],
      default: []
    },

    started_at: {
      type: Date,
      default: Date.now
    },

    completed_at: {
      type: Date
    }
  }
);

module.exports = mongoose.model("EvalRun", evalRunSchema);