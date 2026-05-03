const { Schema, model } = require("mongoose");

const orderItemSchema = new Schema(
  {
    productId: String,
    title: String,
    image: String,
    desc: String,
    price: Number,
    qty: Number,
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    orderNo: {
      type: String,
      default: () => `KGF-${Date.now()}`,
      unique: true,
    },
    userId: String,
    userName: String,
    userMobile: String,
    items: [orderItemSchema],
    totalItems: Number,
    totalPrice: Number,
    paymentMethod: {
      type: String,
      default: "Card",
    },
    status: {
      type: String,
      default: "Placed",
    },
  },
  {
    timestamps: true,
  }
);

const Order = model("order", orderSchema);

module.exports = Order;
