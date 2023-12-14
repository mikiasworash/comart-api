import asyncHandler from "express-async-handler";
import Rating from "../models/ratingModel.js";

// @desc Add rating
// router POST /api/ratings/:id
// @access Private
const addRating = asyncHandler(async (req, res) => {
  const ratingExists = await Rating.findOne({
    user: req.user._id,
    product: req.params.id,
  });

  if (ratingExists && ratingExists.rate == req.body.rate) {
    res.status(400);
    throw new Error("Product already rated");
  }

  req.body.user = req.user._id;
  req.body.product = req.params.id;

  let rating = await Rating.create(req.body);

  if (rating) {
    res.status(201).json(rating);
  } else {
    res.status(400);
    throw new Error("adding rating failed");
  }
});

// @desc Get ratings
// router GET /api/ratings/:id
// @access Private
const getRatings = asyncHandler(async (req, res) => {
  let ratings = await Rating.find({ product: req.params.id });

  if (!ratings) {
    res.status(400);
    throw new Error("No ratings found for this product");
  }

  return res.status(200).json(ratings);
});

export { addRating, getRatings };
