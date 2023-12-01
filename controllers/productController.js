import asyncHandler from "express-async-handler";
import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js";

// @desc Add a new product
// router POST /api/products
// @access Private
const addProduct = asyncHandler(async (req, res) => {
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
const updateProduct = asyncHandler(async (req, res) => {
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
const featureProduct = asyncHandler(async (req, res) => {
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
const deleteProduct = asyncHandler(async (req, res) => {
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
const getProducts = asyncHandler(async (req, res) => {
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
const getProduct = asyncHandler(async (req, res) => {
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
const getProductsByVendor = asyncHandler(async (req, res) => {
  let products = await Product.find({ vendor: req.params.vendorId }).populate({
    path: "category",
    select: "name",
  });

  return res.status(200).json({ products });
});

// @desc Get Featured products
// router GET /api/products/featured
// @access Public
const getFeaturedProducts = asyncHandler(async (req, res) => {
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
const getProductsByCategory = asyncHandler(async (req, res) => {
  const categoryName = req.params.category.toLowerCase();

  const category = await Category.findOne({
    name: { $regex: new RegExp(categoryName, "i") },
  });

  const products = await Product.find({ category: category._id })
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

// @desc Get products by name (query string)
// router GET /api/products/search/:query
// @access Public
const getProductsByName = asyncHandler(async (req, res) => {
  const query = req.params.query.toLowerCase();

  // const products = await Product.find({
  //   name: { $regex: new RegExp(query, "i") },
  // })
  //   .populate({
  //     path: "category",
  //     select: "name",
  //   })
  //   .populate({
  //     path: "vendor",
  //     select: "name",
  //   });

  const products = await Product.aggregate([
    {
      $search: {
        index: "default",
        text: {
          query: query,
          path: {
            wildcard: "*",
          },
          fuzzy: {},
        },
      },
    },
    {
      $lookup: {
        from: "categories",
        foreignField: "_id",
        localField: "category",
        as: "category",
      },
    },
    { $unwind: "$category" },
    {
      $lookup: {
        from: "users",
        foreignField: "_id",
        localField: "vendor",
        as: "vendor",
      },
    },
    { $unwind: "$vendor" },
  ]);

  if (!products || products.length === 0) {
    res.status(400);
    throw new Error("Product not found");
  }

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
  getProductsByName,
};
