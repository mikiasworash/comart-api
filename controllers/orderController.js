import asyncHandler from "express-async-handler";
import Order from "../models/orderModel.js";
import Cart from "../models/cartModel.js";
import Product from "../models/productModel.js";
import crypto from "crypto";

// @desc Get Orders
// router GET /api/orders
// @access Private
const getOrders = asyncHandler(async (req, res) => {
  const page = req.query.page ? parseInt(req.query.page, 10) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 5;
  const offset = (page - 1) * limit;

  const orders = await Order.find()
    .populate({
      path: "buyer",
      select: "name photo",
    })
    .populate({
      path: "products.product",
      select: "name photo vendor",
      populate: {
        path: "vendor",
        select: "name photo",
      },
    })
    .skip(offset)
    .limit(limit);

  const totalOrders = await Order.countDocuments();

  res.status(200).json({ orders, totalOrders });
});

// @desc Get Orders by Vendor
// router GET /api/orders/:vendorId
// @access Private
const getOrdersByVendor = asyncHandler(async (req, res) => {
  const page = req.query.page ? parseInt(req.query.page, 10) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 5;
  const offset = (page - 1) * limit;

  const vendorId = req.params.vendorId;

  let orders = await Order.find()
    .populate({
      path: "buyer",
      select: "name photo",
    })
    .populate({
      path: "products.product",
      select: "name photo vendor",
      populate: {
        path: "vendor",
        select: "name photo",
      },
    })
    .skip(offset)
    .limit(limit);

  orders = orders.filter((order) => {
    return order.products.some((product) => {
      return product.product.vendor._id.toString() === vendorId;
    });
  });

  const totalOrders = await Order.countDocuments();

  res.status(200).json({ orders, totalOrders });
});

// @desc Add Order
// router POST /api/order
// @access Private
const addOrder = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  // const carts = await Cart.find({ user: userId }).populate("product");
  const carts = req.body.cartItems;
  const transactionRef = req.body.tx_ref;

  if (!carts || carts.length === 0) {
    return res.status(404).json({ message: "No items in the cart" });
  }

  const products = [];
  let totalAmount = 0;

  carts.forEach((cart) => {
    const { product, amount } = cart;
    const price = product.price;

    products.push({
      product: product._id,
      quantity: amount,
      price: price,
    });

    totalAmount += amount * price;
  });

  const newOrder = new Order({
    buyer: userId,
    products,
    totalAmount,
    paymentStatus: "pending",
    transactionRef,
  });

  const savedOrder = await newOrder.save();

  if (savedOrder) {
    await Cart.deleteMany({ user: userId });

    res.status(201).json(savedOrder);
  }

  if (!savedOrder) {
    res.status(400);
    throw new Error("Adding order failed");
  }
});

// @desc Update Order
// router PUT /api/order/update
// @access Private
const updateOrder = asyncHandler(async (req, res) => {
  const hash = crypto
    .createHmac("sha256", process.env.CHAPA_SECRET_HASH)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (
    hash == req.headers["chapa-signature"] ||
    hash == req.headers["x-chapa-signature"]
  ) {
    const transactionRef = req.body.tx_ref;

    const updatedOrder = await updateOrderStatus(transactionRef);

    if (updatedOrder) {
      res.status(200).json(updatedOrder);
    } else {
      res.status(400).json({ message: "Update order failed" });
    }
  } else {
    res.status(401).json({ message: "Not authorized" });
  }
});

const updateOrderStatus = asyncHandler(async (transactionRef) => {
  const updatedOrder = await Order.findOneAndUpdate(
    { transactionRef: transactionRef },
    { $set: { paymentStatus: "paid" } },
    { new: true }
  );

  if (!updatedOrder) {
    throw new Error("Order not found");
  }

  for (const product of updatedOrder.products) {
    const productInDatabase = await Product.findById(product.product);

    if (productInDatabase) {
      productInDatabase.quantity -= product.quantity;
      await productInDatabase.save();
    } else {
      throw new Error(`Product with ID ${product._id} not found`);
    }
  }

  return updatedOrder;
});

export { addOrder, updateOrder, getOrders, getOrdersByVendor };
