const mongoose = require("mongoose");

const cartChema = new mongoose.Schema({
  userID: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "users",
  },
  items: [
    {
      item: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "products",
      },
      qtn: {
        type: Number,
        default: 1,
      },
      size: {
        type: String,
        required: true,
      },
      color: {
        type: String,
        required: true,
      },
    },
  ],
  subTotal: {
    type: Number,
    default: 0,
  },
});

const Cart = mongoose.model("Cart", cartChema);

module.exports = Cart;
