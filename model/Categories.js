const mongoose = require("mongoose");

const categoryChema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

const Category = mongoose.model("Category", categoryChema);

module.exports = Category;
