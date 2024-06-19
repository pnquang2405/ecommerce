"use strict";
const { mongoose } = require("mongoose");

const {
  product,
  electronic,
  furniture,
  clothing,
} = require("../product.model");

const findAllProductsForShop = async ({ query, limit, skip }) => {
  return await product
    .find(query)
    .populate("product_name", "name email -_id")
    .sort({ updateAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
};

const publishProductByShop = async ({ product_shop, product_id }) => {
  const foundShop = await product.findOne({
    product_shop: new mongoose.Types.ObjectId(product_shop),
    _id: new mongoose.Types.ObjectId(product_id),
  });

  if (!foundShop) return null;

  foundShop.isDraft = false;
  foundShop.isPublished = true;
  const { modifiedCount } = await foundShop.updateOne(foundShop);

  return modifiedCount;
};

const unPublishProductByShop = async ({ product_shop, product_id }) => {
  const foundShop = await product.findOne({
    product_shop: new mongoose.Types.ObjectId(product_shop),
    _id: new mongoose.Types.ObjectId(product_id),
  });

  if (!foundShop) return null;

  foundShop.isDraft = true;
  foundShop.isPublished = false;
  const { modifiedCount } = await foundShop.updateOne(foundShop);

  return modifiedCount;
};

const searchProductByUser = async (keySearch) => {
  const regexSearch = new RegExp(keySearch["key"]);
  const results = await product
    .find(
      {
        isPublished: true,
        $text: { $search: regexSearch },
      },
      { score: { $meta: "textScore" } }
    )
    .sort({ score: { $meta: "textScore" } })
    .lean();

  return results;
};

module.exports = {
  findAllProductsForShop,
  publishProductByShop,
  unPublishProductByShop,
  searchProductByUser,
};
