"use strict";

const ProductService = require("../services/product.service");
const { SuccessResponse } = require("../core/success.response");

class ProductController {
  createProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Create new Product successfully!!",
      metadata: await ProductService.createProduct(req.body.product_type, {
        ...req.body,
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  getAllDraftsForShop = async (req, res, next) => {
    new SuccessResponse({
      message: "Get all draft products",
      metadata: await ProductService.findAllDraftsForShop({
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  getAllPublishedForShop = async (req, res, next) => {
    new SuccessResponse({
      message: "Get all published products",
      metadata: await ProductService.findAllPublishedForShop({
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  publishByShop = async (req, res, next) => {
    new SuccessResponse({
      message: "Publish product by shop successfully",
      metadata: await ProductService.publishProductByShop({
        product_shop: req.user.userId,
        product_id: req.params.productId,
      }),
    }).send(res);
  };

  unPublishByShop = async (req, res, next) => {
    new SuccessResponse({
      message: "UnPublish product by shop successfully",
      metadata: await ProductService.unPublishProductByShop({
        product_shop: req.user.userId,
        product_id: req.params.productId,
      }),
    }).send(res);
  };

  getListSearchProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Get list of products with key search",
      metadata: await ProductService.getListSearchProduct(req.params),
    }).send(res);
  };

  getAllProducts = async (req, res, next) => {
    new SuccessResponse({
      message: "Get list of products",
      metadata: await ProductService.findAllProducts(req.query),
    }).send(res);
  };

  findProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Get list product successfully",
      metadata: await ProductService.findOneProduct({
        product_id: req.params.product_id,
      }),
    }).send(res);
  };

  updateProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Update product successfully",
      metadata: await ProductService.updateProduct(
        req.body.product_type,
        req.params.productId,
        {
          ...req.body,
          product_shop: req.user.userId,
        }
      ),
    }).send(res);
  };
}

module.exports = new ProductController();
