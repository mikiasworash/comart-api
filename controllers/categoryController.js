import asyncHanlder from "express-async-handler";
import Category from "../models/categoryModel.js";

// @desc Add a new category
// router POST /api/categories
// @access Private
const addCategory = asyncHanlder(async (req, res) => {
  const categoryExists = await Category.findOne({ name: req.body.name });
  if (categoryExists) {
    res.status(400);
    throw new Error("Category already exists");
  }

  const category = await Category.create(req.body);

  if (category) {
    res.status(201).json({
      success: true,
      data: category,
    });
  } else {
    res.status(400);
    throw new Error("Adding a category failed");
  }
});

// @desc Update a category
// router PUT /api/categories/:id
// @access Private
const updateCategory = asyncHanlder(async (req, res) => {
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
    res.status(200).json({
      success: true,
      data: category,
    });
  }
});

export { addCategory, updateCategory };
