import mongoose from "mongoose";

const productSchema = mongoose.Schema(
  {
    name: { type: String, required: [true, "Please add a product name"] },
    description: { type: String, required: true },
    photo: { type: String },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Please add a category"],
      ref: "Category",
    },
    price: { type: Number, required: [true, "Please add a price"] },
    quantity: { type: Number, required: [true, "Please add quantity"] },
    soldOut: { type: Boolean, default: false },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Please add a vendor"],
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
