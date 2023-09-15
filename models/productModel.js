import mongoose from "mongoose";

const productSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    photo: { type: String },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true},
    soldout: { type: Boolean, default:false,},
    vendorId: { type: mongoose.Schema.Types.ObjectId, required: true, ref:"User" },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
