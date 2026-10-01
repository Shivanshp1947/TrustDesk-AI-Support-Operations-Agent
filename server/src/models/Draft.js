const mongoose = require("mongoose");

const citationSchema = new mongoose.Schema(
  {
    doc_id: {
      type: String,
      required: true
    },

    title: {
      type: String
    },

    excerpt: {
      type: String
    }
  },
  {
    _id: false
  }
);

const draftSchema = new mongoose.Schema(
  {
    draft_id: {
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

    body: {
      type: String,
      required: true
    },

    citations: {
      type: [citationSchema],
      default: []
    },

    recommended_actions: {
      type: [String],
      default: []
    },

    status: {
      type: String,
      enum: [
        "generated",
        "edited",
        "approved",
        "rejected",
        "sent"
      ],
      default: "generated"
    },

    generated_by: {
      type: String,
      default: "ai"
    },

    run_id: {
      type: String
    },

    created_at: {
      type: Date,
      default: Date.now
    }
  }
);

module.exports = mongoose.model("Draft", draftSchema);