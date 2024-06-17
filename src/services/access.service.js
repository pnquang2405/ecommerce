"use strict";

const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair, verifyJWT } = require("../auth/authUtils");
const { getInfoData } = require("../utils/index");
const { BadRequestError, ForbidenError } = require("../core/error.response");
const { findByEmail } = require("./shop.service");

const RoleShop = {
  SHOP: "SHOP",
  WRITER: "WRITER",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
};

class AccessService {
  static signUp = async ({ name, email, password }) => {
    const holderShop = await shopModel.findOne({ email }).lean();

    if (holderShop) {
      throw new BadRequestError("Error: Shop already registered");
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const newShop = await shopModel.create({
      name,
      email,
      password: passwordHash,
      roles: [RoleShop.SHOP],
    });

    if (newShop) {
      // created privateKey, publicKey
      const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
        modulusLength: 4096,
        publicKeyEncoding: {
          type: "pkcs1",
          format: "pem",
        },
        privateKeyEncoding: {
          type: "pkcs1",
          format: "pem",
        },
      });

      const publicKeyString = await KeyTokenService.createKeyToken({
        userId: newShop._id,
        publicKey,
      });

      if (!publicKeyString) {
        throw new BadRequestError("Error: SpublicKeyString error");
      }

      const publicKeyObject = crypto.createPublicKey(publicKeyString);
      console.log(publicKeyObject);
      const tokens = await createTokenPair(
        { userId: newShop._id, email },
        publicKeyString,
        privateKey
      );
      console.log("Created Token Success::", tokens);

      return {
        code: 201,
        metadata: {
          shop: getInfoData({
            fileds: ["_id", "name", "email"],
            object: newShop,
          }),
          tokens,
        },
      };
    }
  };

  static signIn = async ({ email, password, refreshToken = null }) => {
    const foundShop = await findByEmail({ email });
    if (!foundShop) {
      throw new BadRequestError(" Shop not registerd");
    }

    const matchPassword = bcrypt.compare(password, foundShop.password);
    if (!matchPassword) {
      throw new UnauthorizedRequestError("Authenticationn Error");
    }

    const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: "pkcs1",
        format: "pem",
      },
      privateKeyEncoding: {
        type: "pkcs1",
        format: "pem",
      },
    });

    const { _id: userId } = foundShop;

    const tokens = await createTokenPair(
      { userId, email },
      publicKey,
      privateKey
    );

    await KeyTokenService.createKeyToken({
      userId,
      publicKey,
      privateKey,
      refreshToken: tokens.refreshToken,
    });

    return {
      shop: getInfoData({
        fileds: ["_id", "name", "email"],
        object: foundShop,
      }),
      tokens,
    };
  };

  static logout = async (keyStore) => {
    const delKey = await KeyTokenService.removeKeyById(keyStore._id);
    return delKey;
  };

  static handlerRefreshToken = async (refreshToken) => {
    const foundToken = await KeyTokenService.findByRefreshTokenUsed(
      refreshToken
    );

    if (foundToken) {
      const { userId, email } = await verifyJWT(
        refreshToken,
        foundToken.priavteKey
      );
      console.log({ userId, email });
      await KeyTokenService.deleteKeyById(userId);
      throw new ForbidenError("Something wrong happed!! Please relogin");
    }

    const holderToken = await KeyTokenService.findByRefreshToken(refreshToken);
    if (!holderToken) {
      throw new AuthFailureError("Shop not registered");
    }

    const { userId, email } = await verifyJWT(
      refreshToken,
      holderToken.privateKey
    );
    console.log("[2]: ", { userId, email });

    const foundShop = await findByEmail({ email });
    if (!foundShop) {
      throw new AuthFailureError("Shop not found");
    }

    const tokens = await createTokenPair(
      { userId, email },
      holderToken.publicKey,
      holderToken.privateKey
    );

    await holderToken.updateOne({
      $set: {
        refreshToken: tokens.refreshToken,
      },
      $addToSet: {
        refreshTokensUsed: refreshToken,
      },
    });

    return {
      user: { userId: userId, email: email },
      tokens,
    };
  };
}

module.exports = AccessService;
