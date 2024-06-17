"use strict";

const express = require("express");
const accessController = require("../../controllers/access.controller");
const router = express.Router();
const { asyncHandler } = require("../../auth/checkAuth");
const { authentication } = require("../../auth/authUtils");

//singup
router.post("/shop/signup", asyncHandler(accessController.signUp));
router.post("/shop/signin", asyncHandler(accessController.signIn));

router.use(authentication);
router.post("/shop/signout", asyncHandler(accessController.signOut));
router.post(
  "/shop/handlerRefershToken",
  asyncHandler(accessController.handlerRefreshToken)
);

module.exports = router;
