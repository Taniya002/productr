const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    productType: {
      type: String,
      required: [true, "Product type is required"],
      enum: ["Food", "Electronics", "Fashion", "Grocery", "Beauty", "Furniture"],
    },
    quantityStock: {
      type: Number,
      required: [true, "Quantity stock is required"],
      min: [0, "Stock cannot be negative"],
    },
    mrp: {
      type: Number,
      required: [true, "MRP is required"],
      min: [0, "MRP cannot be negative"],
    },
    sellingPrice: {
      type: Number,
      required: [true, "Selling price is required"],
      min: [0, "Selling price cannot be negative"],
    },
    brandName: {
      type: String,
      required: [true, "Brand name is required"],
      trim: true,
    },
    // description: {
    //   type: String,
    //   trim: true,
    //   default: "",
    // },
    images: [
      {
        url: { type: String },
        publicId: { type: String },
      },
    ],
    exchangeEligible: {
      type: Boolean,
      default: false,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
