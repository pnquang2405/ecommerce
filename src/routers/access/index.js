"use strict";

const express = require("express");
const accessController = require("../../controllers/access.controller");
const router = express.Router();
const { asyncHandler } = require("../../auth/checkAuth");
const { authentication } = require("../../auth/authUtils");

//singup
router.post("/signup", asyncHandler(accessController.signUp));
router.post("/signin", asyncHandler(accessController.signIn));

router.use(authentication);
router.post("/signout", asyncHandler(accessController.signOut));
router.post(
  "/handlerRefershToken",
  asyncHandler(accessController.handlerRefreshToken)
);

module.exports = router;
