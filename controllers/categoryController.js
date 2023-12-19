import asyncHandler from "express-async-handler";
import Category from "../models/categoryModel.js";
import Product from "../models/productModel.js";

// @desc Add a new category
// router POST /api/categories
// @access Private
const addCategory = asyncHandler(async (req, res) => {
  const categoryExists = await Category.findOne({ name: req.body.name });
  if (categoryExists) {
    res.status(400);
    throw new Error("Category already exists");
  }

  const category = await Category.create(req.body);

  if (category) {
    res.status(201).json({ category });
  } else {
    res.status(400);
    throw new Error("Adding a category failed");
  }
});

// @desc Update a category
// router PUT /api/categories/:id
// @access Private
const updateCategory = asyncHandler(async (req, res) => {
  let category = await Category.findById(req.params.id);
  // Make sure category exists
  if (!category) {
    res.status(400);
    throw new Error("Category not found");
  } else {
    category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ category });
  }
});

// @desc Delete a category
// router DELETE /api/categories/:id
// @access Private
const deleteCategory = asyncHandler(async (req, res) => {
  let category = await Category.findById(req.params.id);
  // Make sure category exists
  if (!category) {
    res.status(400);
    throw new Error("Category not found");
  } else {
    // check if product exists with this category
    const productExists = await Product.findOne({ category: req.params.id });
    if (productExists) {
      res.status(400);
      throw new Error("Couldn't delete category as it contains products");
    }
    category = await Category.findByIdAndDelete(req.params.id);
    res.status(200).json({ category });
  }
});

// @desc Get all categores
// router GET /api/categories
// @access Public
const getCategories = asyncHandler(async (req, res) => {
  let categories = await Category.find();

  return res.status(200).json({ categories });
});

// @desc Get all categores paginated
// router GET /api/categories/paginated
// @access Public
const getCategoriesPaginated = asyncHandler(async (req, res) => {
  const page = req.query.page ? parseInt(req.query.page, 10) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 5;
  const offset = (page - 1) * limit;

  let categories = await Category.find().skip(offset).limit(limit);

  return res.status(200).json({ categories });
});

// @desc Get category
// router GET /api/categories/:id
// @access Public
const getCategory = asyncHandler(async (req, res) => {
  let category = await Category.findById(req.params.id);
  if (!category) {
    res.status(400);
    throw new Error("Category not found with this id");
  }

  return res.status(200).json({ category });
});

export {
  addCategory,
  updateCategory,
  getCategories,
  getCategory,
  deleteCategory,
  getCategoriesPaginated,
};
