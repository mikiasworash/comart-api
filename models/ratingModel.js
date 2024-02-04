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
    rating: {
      type: Number,
      required: true,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating must can not be more than 5"],
    },
    review: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent user from adding more than one rating per product
ratingSchema.index({ product: 1, user: 1 }, { unique: true });

// Static method to get average rating and save
ratingSchema.statics.getAverageRating = async function (productId) {
  const obj = await this.aggregate([
    {
      $match: { product: productId },
    },
    {
      $group: {
        _id: "$product",
        averageRating: { $avg: "$rating" },
      },
    },
  ]);

  try {
    await this.model("Product").findByIdAndUpdate(productId, {
      averageRating: obj[0].averageRating,
    });
  } catch (error) {
    console.error(error);
  }
};

// Call getAverageRating After save
ratingSchema.post("save", function () {
  this.constructor.getAverageRating(this.product);
});

// Call getAverageRating Before remove
ratingSchema.pre("remove", function () {
  this.constructor.getAverageRating(this.product);
});

const Rating = mongoose.model("Rating", ratingSchema);
export default Rating;
