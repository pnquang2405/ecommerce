"use strict";

const express = require("express");
const productController = require("../../controllers/product.controller");
const router = express.Router();
const { asyncHandler } = require("../../auth/checkAuth");
const { authentication } = require("../../auth/authUtils");

router.get(
  "/search/:key",
  asyncHandler(productController.getListSearchProduct)
);

router.use(authentication);
router.post("", asyncHandler(productController.createProduct));
router.get("/drafts/all", asyncHandler(productController.getAllDraftsForShop));
router.get(
  "/published/all",
  asyncHandler(productController.getAllPublishedForShop)
);
router.post(
  "/publish/:productId",
  asyncHandler(productController.publishByShop)
);
router.post(
  "/unPublish/:productId",
  asyncHandler(productController.unPublishByShop)
);

module.exports = router;
