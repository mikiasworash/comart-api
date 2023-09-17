import asyncHanlder from "express-async-handler";
import Product from "../models/productModel.js";

// @desc Add a new product
// router POST /api/products
// @access Private
const addProduct = asyncHanlder(async (req, res) => {
  const productExists = await Product.findOne({
    name: req.body.name,
    vendor: req.user._id,
  });
  if (productExists) {
    res.status(400);
    throw new Error("Product already exists");
  }

  // Add the vendor id to the request body
  req.body.vendor = req.user._id;

  const product = await Product.create(req.body);

  if (product) {
    res.status(201).json({
      success: true,
      data: product,
    });
  } else {
    res.status(400);
    throw new Error("Adding a product failed");
  }
});

// @desc Update a product
// router PUT /api/products/:id
// @access Private
const updateProduct = asyncHanlder(async (req, res) => {
  let product = await Product.findById(req.params.id);
  // Make sure product exists
  if (!product) {
    res.status(400);
    throw new Error("Product not found");
  } else {
    // Make sure user is the product owner
    if (product.vendor.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("This user is not the owner of this product");
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      success: true,
      data: product,
    });
  }
});

// @desc Get products
// router GET /api/products/
// @access Public
const getProducts = asyncHanlder(async (req, res) => {
  let products = await Product.find().populate({
    path: "category",
    select: "name",
  });

  return res.status(200).json({
    success: true,
    count: products.length,
    data: products,
  });
});

// @desc Get products
// router GET /api/products/:vendorId
// @access Public
const getProductsByVendor = asyncHanlder(async (req, res) => {
  let products = await Product.find({ vendor: req.params.vendorId }).populate({
    path: "category",
    select: "name",
  });

  return res.status(200).json({
    success: true,
    count: products.length,
    data: products,
  });
});

export { addProduct, updateProduct, getProducts, getProductsByVendor };
