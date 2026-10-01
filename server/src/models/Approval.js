const mongoose = require("mongoose");

const approvalSchema = new mongoose.Schema(
  {
    approval_id: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    action_id: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    draft_id: {
      type: String,
      default: null
    },

    reviewer_id: {
      type: String,
      required: true
    },

    decision: {
      type: String,
      enum: [
        "approved",
        "rejected",
        "needs_changes"
      ],
      required: true
    },

    reason: {
      type: String
    },

    created_at: {
      type: Date,
      default: Date.now
    }
  }
);

module.exports = mongoose.model("Approval", approvalSchema);