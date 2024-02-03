import asyncHandler from "express-async-handler";
import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js";
import axios from "axios";

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

    product.name = req.body.name;
    product.description = req.body.description;
    product.category = req.body.category;
    product.price = req.body.price;
    product.quantity = req.body.quantity;

    if (req.body.photo) {
      product.photo = req.body.photo;
    }

    await product.save();

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
  const page = req.query.page ? parseInt(req.query.page, 10) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 8;
  const offset = (page - 1) * limit;

  let products = await Product.find()
    .select("-embedding")
    .populate({
      path: "category",
      select: "name",
    })
    .populate({
      path: "vendor",
      select: "name",
    })
    .skip(offset)
    .limit(limit);

  return res.status(200).json({ products });
});

// @desc Get a single product
// router GET /api/products/product/:id
// @access Public
const getProduct = asyncHandler(async (req, res) => {
  let product = await Product.findById(req.params.id)
    .select("-embedding")
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
// @access Private
const getProductsByVendor = asyncHandler(async (req, res) => {
  const page = req.query.page ? parseInt(req.query.page, 10) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 5;
  const offset = (page - 1) * limit;

  let products = await Product.find({ vendor: req.params.vendorId })
    .select("-embedding")
    .populate({
      path: "category",
      select: "name",
    })
    .skip(offset)
    .limit(limit);

  return res.status(200).json({ products });
});

// @desc Get Featured products
// router GET /api/products/featured
// @access Public
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const page = req.query.page ? parseInt(req.query.page, 10) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 8;
  const offset = (page - 1) * limit;

  let products = await Product.find({ featured: true })
    .select("-embedding")
    .populate({
      path: "category",
      select: "name",
    })
    .populate({
      path: "vendor",
      select: "name",
    })
    .skip(offset)
    .limit(limit);

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

  const page = req.query.page ? parseInt(req.query.page, 10) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 8;
  const offset = (page - 1) * limit;

  const products = await Product.find({ category: category._id })
    .select("-embedding")
    .populate({
      path: "category",
      select: "name",
    })
    .populate({
      path: "vendor",
      select: "name",
    })
    .skip(offset)
    .limit(limit);

  return res.status(200).json({ products });
});

// @desc Get products by name (query string)
// router GET /api/products/search/:query
// @access Public
const getProductsByName = asyncHandler(async (req, res) => {
  const query = req.params.query.toLowerCase();

  // fuzzy search by name
  // const products = await Product.aggregate([
  //   {
  //     $search: {
  //       index: "default",
  //       text: {
  //         query: query,
  //         path: {
  //           wildcard: "*",
  //         },
  //         fuzzy: {},
  //       },
  //     },
  //   },
  // {
  //   $project: {
  //     embedding: 0,
  //   },
  // },
  //   {
  //     $lookup: {
  //       from: "categories",
  //       foreignField: "_id",
  //       localField: "category",
  //       as: "category",
  //     },
  //   },
  //   { $unwind: "$category" },
  //   {
  //     $lookup: {
  //       from: "users",
  //       foreignField: "_id",
  //       localField: "vendor",
  //       as: "vendor",
  //     },
  //   },
  //   { $unwind: "$vendor" },
  // ]);

  // get embedding from openai for the query
  // to match with stored embedding
  const product_embedding = await getEmbedding(query);

  // vector search by using openai embedding
  const products = await Product.aggregate([
    {
      $vectorSearch: {
        index: "vector_index",
        path: "embedding",
        queryVector: product_embedding,
        numCandidates: 100,
        limit: 8,
      },
    },
    {
      $project: {
        embedding: 0,
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

// @desc get embedding from openai
// route nonexistent
// @access public
const getEmbedding = asyncHandler(async (query) => {
  const response = await axios.post(
    "https://api.openai.com/v1/embeddings",
    {
      input: query,
      model: "text-embedding-ada-002",
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.openai_api_key}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (response.status === 200) {
    return response.data.data[0].embedding;
  } else {
    throw new Error(`Failed to get embedding. Status code: ${response.status}`);
  }
});

// @desc search autocomplete
// router GET /api/products/search/autocomplete/:query
// @access Public
const searchAutoComplete = asyncHandler(async (req, res) => {
  const query = req.params.query.toLowerCase();

  const products = await Product.aggregate([
    {
      $search: {
        index: "autoCompleteProducts",
        autocomplete: {
          query: query,
          path: "name",
          tokenOrder: "sequential",
          fuzzy: {},
        },
      },
    },
    {
      $project: {
        embedding: 0,
      },
    },
    {
      $limit: 10,
    },
    {
      $project: {
        name: 1,
      },
    },
  ]);

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
  searchAutoComplete,
};
