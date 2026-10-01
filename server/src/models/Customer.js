const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    customer_id: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },

    tier: {
      type: String,
      required: true
    },

    country: {
      type: String,
      required: true
    },

    created_at: {
      type: Date,
      required: true
    },

    verified: {
      type: Boolean,
      default: false
    },

    tags: {
      type: [String],
      default: []
    }
  }
);

module.exports = mongoose.model("Customer", customerSchema);