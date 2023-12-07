import mongoose from "mongoose";
import axios from "axios";

const productSchema = mongoose.Schema(
  {
    name: { type: String, required: [true, "Please add a product name"] },
    description: { type: String, required: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Please add a category"],
      ref: "Category",
    },
    photo: {
      type: String,
      default: "default",
    },
    price: { type: Number, required: [true, "Please add a price"] },
    quantity: { type: Number, required: [true, "Please add quantity"] },
    featured: { type: Boolean, default: false },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Please add a vendor"],
      ref: "User",
    },
    embedding: {},
  },
  {
    timestamps: true,
  }
);

// get embeddings from openai before saving product
productSchema.pre("save", async function (next) {
  if (!this.isModified("name")) {
    next();
  }

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/embeddings",
      {
        input: this.name,
        model: "text-embedding-ada-002",
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.openai_api_key}`,
          "Content-Type": "application/json",
        },
      }
    );

    this.embedding = response.data.data[0].embedding;
  } catch (err) {
    console.error(err);
  }

  next();
});

const Product = mongoose.model("Product", productSchema);
export default Product;
