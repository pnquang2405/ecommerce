"use strict";
const keytokenModel = require("../models/keytoken.model");
const { mongoose } = require("mongoose");

class KeyTokenService {
  static createKeyToken = async ({
    userId,
    publicKey,
    privateKey,
    refreshToken,
  }) => {
    try {
      // const publicKeyString = publicKey.toString();
      // const tokens = await keyTokenModel.create({
      //   user: userId,
      //   publicKey: publicKey,
      // });

      // return tokens ? publicKeyString : null;

      const filter = { user: userId };
      const update = {
        publicKey,
        privateKey,
        refreshTokensUsed: [],
        refreshToken,
      };
      const options = { upsert: true, new: true };

      const tokens = await keytokenModel.findOneAndUpdate(
        filter,
        update,
        options
      );

      return tokens ? tokens.publicKey : null;
    } catch (error) {
      console.log(error.message);
      return error;
    }
  };

  static findByUserId = async (userId) => {
    return await keytokenModel
      .findOne({ user: new mongoose.Types.ObjectId(userId) })
      .lean();
  };

  static removeKeyById = async (id) => {
    return await keytokenModel.deleteOne(id).lean();
  };

  static findByRefreshTokenUsed = async (refreshToken) => {
    return await keytokenModel
      .findOne({ refreshTokensUsed: refreshToken })
      .lean();
  };

  static deleteKeyById = async (userId) => {
    return await keytokenModel.findByIdAndDelete({ user: userId }).lean();
  };

  static findByRefreshToken = async (refreshToken) => {
    return await keytokenModel.findOne({ refreshToken });
  };
}

module.exports = KeyTokenService;
