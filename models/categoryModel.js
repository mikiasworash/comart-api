import mongoose from "mongoose";

const categorySchema = mongoose.Schema(
  {
    name: { type: String, required: [true, "Please add a category name"] },
    description: { type: String },
  },
  {
    timestamps: true,
  }
);

const Category = mongoose.model("Category", categorySchema);
export default Category;
