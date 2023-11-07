import asyncHanlder from "express-async-handler";
import Cart from "../models/cartModel.js";
import User from "../models/userModel.js";

// @desc Add cart
// router POST /api/cart/:id
// @access Private
const addCart = asyncHanlder(async (req, res) => {
  const cartExists = await Cart.findOne({
    user: req.user._id,
    product: req.params.id,
  });
  if (cartExists) {
    res.status(400);
    throw new Error("Product is already in cart");
  }

  req.body.user = req.user._id;
  req.body.product = req.params.id;

  let cart = await Cart.create(req.body);

  if (cart) {
    res.status(201).json(cart);
  } else {
    res.status(400);
    throw new Error("adding cart failed");
  }
});

// @desc Get cart
// router GET /api/cart/:id
// @access Private
const getCart = asyncHanlder(async (req, res) => {
  let cart = await Cart.find({ user: req.params.id }).populate({
    path: "product",
    populate: {
      path: "category",
      select: "name",
    },
    populate: {
      path: "vendor",
      select: "name",
    },
  });
  if (!cart) {
    res.status(400);
    throw new Error("Cart not found for this user");
  }

  return res.status(200).json(cart);
});

export { getCart, addCart };
