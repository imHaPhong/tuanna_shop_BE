const mongoose = require("mongoose");

const userChema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  shoppingCart: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "Cart",
  },
});

const User = mongoose.model("User", userChema);

module.exports = User;
