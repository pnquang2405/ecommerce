"use strict";
const { mongoose, model } = require("mongoose");

const DOCUMENT_NAME = "product";
const COLLECTION_NAME = "products";

// Declare the Schema of the Mongo model
var productSchema = new mongoose.Schema(
  {
    product_name: {
      type: String,
      required: true,
    },
    product_thumb: {
      type: String,
      required: true,
    },
    product_description: String,
    product_price: {
      type: Number,
      required: true,
    },
    product_quantity: {
      type: Number,
      required: true,
    },
    product_type: {
      type: String,
      required: true,
      enum: ["Electronics", "Clothing", "Furniture"],
    },
    product_shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    product_attributes: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  }
);

//define the product type is clothing
const clothingSchema = new mongoose.Schema(
  {
    brand: { type: String, required: true },
    size: String,
    material: String,
  },
  {
    collection: "clothes",
    timestamps: true,
  }
);

//define the product type is electronic
const electronicSchema = new mongoose.Schema(
  {
    manufacturer: { type: String, required: true },
    model: String,
    color: String,
  },
  {
    collection: "electronics",
    timestamps: true,
  }
);

//Export the model
module.exports = {
  product: model(DOCUMENT_NAME, productSchema),
  clothing: model("clothing", clothingSchema),
  electronic: model("electronic", electronicSchema),
};
