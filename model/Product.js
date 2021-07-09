const mongoose = require("mongoose");

const productChema = new mongoose.Schema({
  categoryId: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  img: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  imgDetail: [],
  infomation: [
    {
      img: {
        type: String,
        required: true,
      },
      des: {
        type: String,
        required: true,
      },
    },
  ],
  tag: {
    type: String,
  },
  preview: {
    type: String,
    required: true,
  },
  features: [
    {
      img: {
        type: String,
        required: true,
      },
      feature: [],
    },
  ],
});

const Product = mongoose.model("Product", productChema);

module.exports = Product;
