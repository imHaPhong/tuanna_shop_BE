const mongoose = require("mongoose");

const colorChema = new mongoose.Schema({
  color: {
    type: String,
    required: true,
  },
});

const Color = mongoose.model("Color", colorChema);

module.exports = Color;
