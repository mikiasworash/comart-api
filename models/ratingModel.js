import mongoose from "mongoose";

const ratingSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    rate: {
      type: Number,
      required: true,
      min: [1, "Rate cannot be less than 1"],
      max: [5, "Rate cannot be greater than 5"],
    },
  },
  {
    timestamps: true,
  }
);

const Rating = mongoose.model("Rating", ratingSchema);
export default Rating;
