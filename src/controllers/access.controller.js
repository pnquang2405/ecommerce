"use strict";

const AccessService = require("../services/access.service");

const { OK, CREATED, SuccessResponse } = require("../core/success.response");
class AccessController {
  signIn = async (req, res, next) => {
    new SuccessResponse({
      metadata: await AccessService.signIn(req.body),
    }).send(res);
  };
  signUp = async (req, res, next) => {
    // return res.status(201).json(await AccessService.signUp(req.body));
    new CREATED({
      message: "Resiserted OK",
      metadata: await AccessService.signUp(req.body),
      options: {
        limit: 10,
      },
    }).send(res);
  };

  signOut = async (req, res, next) => {
    new SuccessResponse({
      message: "Logout Success!",
      metadata: await AccessService.logout(req.keyStore),
    }).send(res);
  };

  handlerRefreshToken = async (req, res, next) => {
    new SuccessResponse({
      message: "Get Token Success!",
      metadata: await AccessService.handlerRefreshToken(req.body.refreshToken),
    }).send(res);
  };
}

module.exports = new AccessController();
