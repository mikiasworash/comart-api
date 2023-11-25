import asyncHanlder from "express-async-handler";
import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js";

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
    res.status(201).json({ product });
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
    res.status(200).json({ product });
  }
});

// @desc Update the feature status of a product
// router PUT /api/products/featured/:id
// @access Private
const featureProduct = asyncHanlder(async (req, res) => {
  let product = await Product.findById(req.params.id);
  // Make sure product exists
  if (!product) {
    res.status(400);
    throw new Error("Product not found");
  } else {
    req.body.featured = !product.featured;

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ product });
  }
});

// @desc Delete a product
// router DELETE /api/products/:id
// @access Private
const deleteProduct = asyncHanlder(async (req, res) => {
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

    product = await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ product });
  }
});

// @desc Get all products
// router GET /api/products
// @access Public
const getProducts = asyncHanlder(async (req, res) => {
  let products = await Product.find()
    .populate({
      path: "category",
      select: "name",
    })
    .populate({
      path: "vendor",
      select: "name",
    });

  return res.status(200).json({ products });
});

// @desc Get a single product
// router GET /api/products/product/:id
// @access Public
const getProduct = asyncHanlder(async (req, res) => {
  let product = await Product.findById(req.params.id)
    .populate({
      path: "category",
      select: "name",
    })
    .populate({
      path: "vendor",
      select: "name",
    });

  return res.status(200).json({ product });
});

// @desc Get products owned by a vendor
// router GET /api/products/vendor/:vendorId
// @access Public
const getProductsByVendor = asyncHanlder(async (req, res) => {
  let products = await Product.find({ vendor: req.params.vendorId }).populate({
    path: "category",
    select: "name",
  });

  return res.status(200).json({ products });
});

// @desc Get Featured products
// router GET /api/products/featured
// @access Public
const getFeaturedProducts = asyncHanlder(async (req, res) => {
  let products = await Product.find({ featured: true })
    .populate({
      path: "category",
      select: "name",
    })
    .populate({
      path: "vendor",
      select: "name",
    });

  return res.status(200).json({ products });
});

// @desc Get products by category
// router GET /api/products/categories/:category
// @access Public
const getProductsByCategory = asyncHanlder(async (req, res) => {
  const categoryName = req.params.category.toLowerCase();

  const category = await Category.findOne({
    name: { $regex: new RegExp(categoryName, "i") },
  });

  const products = await Product.find({ category: category._id }).populate({
    path: "category",
    select: "name",
  });

  return res.status(200).json({ products });
});

export {
  addProduct,
  updateProduct,
  getProducts,
  getProductsByVendor,
  getFeaturedProducts,
  getProductsByCategory,
  deleteProduct,
  featureProduct,
  getProduct,
};
