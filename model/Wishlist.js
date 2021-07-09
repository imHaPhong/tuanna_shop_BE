const mongoose = require("mongoose");

const wishlistChema = new mongoose.Schema({
  items: [
    {
      item: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
      },
    },
  ],
});

const Wishlist = mongoose.model("Wishlist", wishlistChema);

module.exports = Wishlist;
