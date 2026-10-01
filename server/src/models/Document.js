const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    doc_id: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    title: {
      type: String,
      required: true,
      trim: true
    },

    content: {
      type: String,
      required: true
    },

    source_path: {
      type: String,
      required: true
    },

    version: {
      type: String,
      default: "1.0"
    },

    audience: {
      type: String,
      default: "support"
    },

    updated_at: {
      type: Date,
      default: Date.now
    },

    chunks: {
      type: [String],
      default: []
    },

    search_terms: {
      type: [String],
      default: []
    },

    checksum: {
      type: String
    },

    active: {
      type: Boolean,
      default: true
    }
  }
);

documentSchema.index({
  title: "text",
  content: "text"
});

module.exports = mongoose.model("Document", documentSchema);