'use strict'

const shopModel = require('../models/shop.model')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const KeyTokenService = require('./keyToken.service')
const {createTokenPair} = require('../auth/authUtils')
const {getInfoData} = require('../utils/index')

const RoleShop = {
    SHOP: 'SHOP',
    WRITER: 'WRITER',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN'
}

class AccessService {
    static signUp = async ({ name, email, password}) => {
        try {
            console.log("name", name);
            const holderShop = await shopModel.findOne({email}).lean()

            if (holderShop){
                return {
                    code: 500,
                    message: 'Shop already registered'
                }
            }
            const passwordHash = await bcrypt.hash(password, 10)
            const newShop = await shopModel.create({
                name, email, password: passwordHash, roles: [RoleShop.SHOP]
            })

            if (newShop){
                // created privateKey, publicKey
                const {privateKey, publicKey} = crypto.generateKeyPairSync('rsa', {
                    modulusLength: 4096,
                    publicKeyEncoding: {
                        type: 'pkcs1',
                        format: 'pem'
                    },
                    privateKeyEncoding: {
                        type: 'pkcs1',
                        format: 'pem'
                    }
                })

                console.log({ privateKey, publicKey}); 

                const publicKeyString = await KeyTokenService.createKeyToken({
                    userId: newShop._id,
                    publicKey
                })

                if(!publicKeyString){
                    return {
                        code: 500,
                        message: 'publicKeyString error'
                    }
                }

                const publicKeyObject = crypto.createPublicKey(publicKeyString);
                console.log(publicKeyObject)
                const tokens = await createTokenPair({userId: newShop._id, email}, publicKeyString, privateKey)
                console.log('Created Token Success::', tokens)

                return {
                  code: 201,
                  metadata: {
                    shop: getInfoData({fileds: ['_id', 'name', 'email'], object: newShop}),
                    tokens
                  }
                }
            }
            
        } catch (error) {
            return {
                code: 500,
                message: error.message,
                status: 'error'
            }
        }
    }

}

module.exports = AccessService