const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
var cors = require("cors");
const port = process.env.PORT || 8080;

const queryString = require("query-string");

const Category = require("./model/Categories");
const Product = require("./model/Product");
const Wishlist = require("./model/Wishlist");
const User = require("./model/User");
const Cart = require("./model/Cart");

const app = express();

app.use(cors());

app.use(express.json());

app.get("/api", (req, res) => {
  res.json({
    message: "hello",
  });
});

app.get("/api/cart", async (req, res) => {
  const cart = await Cart.find()
    .populate([
      {
        path: "items.item",
        model: "Product",
      },
    ])

    .exec(function (err, order) {
      console.log(order);
      res.send({ order: order[0].items, total: order[0].subTotal });
    });
});

app.post("/api/addToCart", verifyToken, async (req, res) => {
  const cart = await Cart.findOne({ userID: req.user });
  const product = await Product.findById(req.body.pId);
  if (req.body.add == true) {
    const item = cart.items.find((el) => el.item == req.body.pId);
    if (item) {
      item.qtn += req.body.qtn;
      cart.items = cart.items.map((el) => {
        if (el.item._id == item._id) {
          return (el.item = item);
        }
        return el;
      });
    } else {
      cart.items = cart.items.concat({
        item: mongoose.Types.ObjectId(req.body.pId),
        size: req.body.size,
        color: req.body.color,
        qtn: req.body.qtn,
      });
    }
    cart.subTotal =
      Number(cart.subTotal) + Number(product.price) * req.body.qtn;
  } else {
    const item = cart.items.find((el) => el.item == req.body.pId);
    if (!item) {
      return res.send(cart);
    }
    if (item.qtn > 1) {
      item.qtn -= 1;
      cart.items = cart.items.map((el) => {
        if (el.item._id == item._id) {
          return (el.item = item);
        }
        return el;
      });
    } else {
      cart.items = cart.items.filter((el) => el._id != item._id);
    }
    cart.subTotal = Number(cart.subTotal) - Number(product.price);
  }
  await cart.save();
  res.send(cart);
});

app.post("/api/login", async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  if (!user) {
    return res.status(401).json({ msg: "Unauthorized" });
  }
  if (user.password != req.body.password) {
    return res.status(401).json({ msg: "Unauthorized" });
  }

  jwt.sign({ _id: user._id }, "secretkey", (err, token) => {
    res.send({
      token,
    });
  });
});

function verifyToken(req, res, next) {
  const bearerHeader = req.headers["authorization"];

  if (typeof bearerHeader !== "undefined") {
    const bearerToken = bearerHeader.split(" ")[1];
    jwt.verify(bearerToken, "secretkey", (err, authData) => {
      if (err) {
        return res.sendStatus(403);
      } else {
        req.user = authData;
        next();
      }
    });
  } else {
    res.sendStatus(403);
  }
}

app.post("/api/category", async (req, res) => {
  const category = await Category(req.body);
  await category.save();
  res.send(category);
});
app.post("/api/product", async (req, res) => {
  const product = await Product(req.body);
  await product.save();
  res.send(product);
});

// app.post('/api/product', async (req, res) => {
//   const product = await Wishlist.find()
// })

app.get("/api/product", async (req, res) => {
  console.log(req.query);
  const queryField = ["categoryId", "color", "size", "page", "limit"];
  if (req.query.category) {
    let value = req.query.category;
    delete req.query.category;
    req.query["categoryId"] = value;
  }
  // if (req.query.name) {
  //   req.query["name"] = { $regex: req.query.name };
  // }
  const queryObj = Object.keys(req.query);
  var query = {};
  queryObj.map((el) => (query[el] = req.query[el].toLocaleLowerCase()));
  const clearQuery = query;
  delete clearQuery.limit;
  delete clearQuery.page;
  console.log("-------");
  if (clearQuery.name) {
    clearQuery["name"] = { $regex: req.query.name };
  }
  console.log(clearQuery);

  if (queryField.includes(Object.keys(req.query)[0])) {
    const result = await Product.find(clearQuery)
      .skip(req.query.page > 1 ? (req.query.page - 1) * req.query.limit : 0)
      .limit(Number(req.query.limit));
    const count = await Product.find(clearQuery);
    return res.send({
      result,
      total: result.length,
      count: count.length,
    });
  }

  if (req.query.price == "") {
    const result = await Product.find({
      price: {
        $gte: req.query.min,
        $lt: req.query.max,
      },
    })
      .skip(req.query.page > 1 ? (req.query.page - 1) * req.query.limit : 0)
      .limit(Number(req.query.limit));
    return res.send({
      result,
      total: result.length,
    });
  }

  const result = await Product.find()
    .skip(req.query.page > 1 ? (req.query.page - 1) * req.query.limit : 0)
    .limit(Number(req.query.limit));
  res.send({
    result,
    total: result.length,
  });
});

app.get("/api/category", async (req, res) => {
  const categories = await Category.find();
  res.send(categories);
});

app.post("/api/productDetail", async (req, res) => {
  const productInfo = await Product.findById(req.body);
  res.send(productInfo);
});

app.post("/api/account", async (req, res) => {
  const user = await User(req.body);
  await user.save();
  const cart = Cart({ userID: user._id });
  await cart.save();
  res.send(user);
});

app.post("/api/wishlist", async (req, res) => {
  if (req.body.id.length === 0) return res.send();
  const wishlistIds = req.body.id;
  const promiseList = wishlistIds.map((el) => Product.findById(el));
  Promise.all(promiseList).then((data) => {
    res.send(data);
  });
});

app.post("/api/updateCart", verifyToken, async (req, res) => {
  const cartid = await Cart.findOne({ userID: req.user })
    .populate([
      {
        path: "items.item",
        model: "Product",
      },
    ])

    .exec(async (err, cart) => {
      console.log(cart);
      if (req.body.add == true) {
        var price = 0;
        cart.items = cart.items.map((el) => {
          if (el._id == req.body.id) {
            el.qtn += 1;
            price = el.item.price;
          }

          return el;
        });
        cart.subTotal += Number(price);
      } else {
        var price = 0;

        cart.items = cart.items.map((el) => {
          if (el._id == req.body.id) {
            if (el.qtn > 1) {
              el.qtn -= 1;
              price = el.item.price;
            }
          }
          return el;
        });
        cart.subTotal -= Number(price);
      }

      await cart.save();
      res.send(cart);
    });
});

app.delete("/api/deleteCart", async (req, res) => {
  const cart = await Cart.find();
  const listItem = cart[0].items;
  const removeData = listItem.filter((el) => el._id != req.body.id);
  cart[0].items = removeData;
  await cart[0].save();
  res.send(cart[0]);
});
app.delete("/api/deleteWishlist", async (req, res) => {
  const cart = await Wishlist.find();
  const listItem = cart[0].items;
  const removeData = listItem.filter((el) => el.item != req.body.id);
  cart[0].items = removeData;
  await cart[0].save();
  res.send(cart[0]);
});

mongoose.connect(
  "mongodb+srv://anhtuan:123@cluster0.vpuly.mongodb.net/myShop?retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => {
    console.log("connect");
  }
);

const connection = mongoose.connection;

connection.once("open", function () {
  console.log("MongoDB database connection established successfully");
});

app.listen(port, () => console.log("running"));
