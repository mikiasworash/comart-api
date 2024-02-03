import asyncHandler from "express-async-handler";
import Rating from "../models/ratingModel.js";
import Product from "../models/productModel.js";

// @desc Get ratings
// router GET /api/products/:id/ratings
// @access Public
const getRatings = asyncHandler(async (req, res) => {
  let ratings = await Rating.find({ product: req.params.id });

  if (!ratings) {
    res.status(400);
    throw new Error("No ratings found for this product");
  }

  return res.status(200).json(ratings);
});

// @desc Get a single rating
// router GET /api/ratings/:id
// @access Public
const getRating = asyncHandler(async (req, res) => {
  let ratings = await Rating.find({ product: req.params.id }).populate({
    path: "product",
    select: "name description",
  });

  if (!ratings) {
    res.status(400);
    throw new Error("No ratings found for this product");
  }

  return res.status(200).json(ratings);
});

// @desc Add rating
// router POST /api/products/:id/ratings
// @access Private
const addRating = asyncHandler(async (req, res) => {
  req.body.user = req.user._id;
  req.body.product = req.params.id;

  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("No product found with this id");
  }

  let rating = await Rating.create(req.body);

  if (rating) {
    res.status(201).json(rating);
  } else {
    res.status(400);
    throw new Error("adding rating failed");
  }
});

// @desc Update rating
// router PUT /api/ratings/:id
// @access Private
const updateRating = asyncHandler(async (req, res) => {
  const rating = await Rating.findById(req.params.id);

  if (!rating) {
    res.status(404);
    throw new Error("No rating found with this id");
  }

  rating = await rating.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: rating,
  });
});

// @desc Delete rating
// router DELETE /api/ratings/:id
// @access Private
const deleteRating = asyncHandler(async (req, res) => {
  const rating = await Rating.findById(req.params.id);

  if (!rating) {
    res.status(404);
    throw new Error("No rating found with this id");
  }

  await rating.remove();

  res.status(200).json({
    success: true,
    data: rating,
  });
});

export { getRatings, getRating, addRating, updateRating, deleteRating };
