const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: true
    },

    name: {
      type: String,
      required: true
    },

    quantity: {
      type: Number,
      required: true,
      min: 1
    },

    category: {
      type: String,
      required: true
    },

    final_sale: {
      type: Boolean,
      default: false
    }
  },
  {
    _id: false
  }
);

const orderSchema = new mongoose.Schema(
  {
    order_id: {
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

    status: {
      type: String,
      required: true
    },

    placed_at: {
      type: Date,
      required: true
    },

    delivered_at: {
      type: Date,
      default: null
    },

    eligible_return_until: {
      type: Date,
      default: null
    },

    total: {
      type: Number,
      required: true,
      min: 0
    },

    currency: {
      type: String,
      required: true
    },

    payment_status: {
      type: String,
      required: true
    },

    tracking_number: {
      type: String,
      default: null
    },

    items: {
      type: [orderItemSchema],
      default: []
    }
  }
);

module.exports = mongoose.model("Order", orderSchema);