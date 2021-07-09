const mongoose = require("mongoose");

const sizeChema = new mongoose.Schema({
  size: {
    type: String,
    required: true,
  },
});

const Size = mongoose.model("Size", sizeChema);

module.exports = Size;
