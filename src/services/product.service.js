"use strict";

const {
  product,
  clothing,
  electronic,
  furniture,
} = require("../models/product.model");
const { BadRequestError } = require("../core/error.response");
const {
  findAllProductsForShop,
  publishProductByShop,
  unPublishProductByShop,
  searchProductByUser,
  findAllProducts,
  findProduct,
  updateProductById,
} = require("../models/repositories/product.repo");
const { updateNestedObject } = require("../utils");

//define Factory class to create product
class ProductFactory {
  static productRegistry = {};
  static registerProductType(type, classRef) {
    ProductFactory.productRegistry[type] = classRef;
  }

  static async createProduct(type, payload) {
    const productClass = ProductFactory.productRegistry[type];
    if (!productClass)
      throw new BadRequestError(`invalid product type ${type}`);

    return new productClass(payload).createProduct();
  }

  static async findAllDraftsForShop({ product_shop, limit = 50, skip = 0 }) {
    const query = { product_shop, isDraft: true };
    return await findAllProductsForShop({ query, limit, skip });
  }

  static async findAllPublishedForShop({ product_shop, limit = 50, skip = 0 }) {
    const query = { product_shop, isPublished: true };
    return await findAllProductsForShop({ query, limit, skip });
  }

  static async publishProductByShop(product_shop, product_id) {
    return await publishProductByShop(product_shop, product_id);
  }

  static async unPublishProductByShop(product_shop, product_id) {
    return await unPublishProductByShop(product_shop, product_id);
  }

  static async getListSearchProduct(keySearch) {
    return await searchProductByUser(keySearch);
  }

  static async updateProduct(type, productId, payload) {
    const productClass = ProductFactory.productRegistry[type];
    if (!productClass)
      throw new BadRequestError(`invalid product type ${type}`);

    return new productClass(payload).updateProduct(productId);
  }

  static async findAllProducts({
    limit = 50,
    sort = "ctime",
    page = 1,
    filter = { isPublished: true },
  }) {
    return await findAllProducts({
      limit,
      sort,
      page,
      filter,
      select: ["product_name", "product_price", "product_thumb"],
    });
  }

  static async findOneProduct({ product_id }) {
    return await findProduct({ product_id, unSelect: ["__v"] });
  }
}

class Product {
  constructor({
    product_name,
    product_thumb,
    product_description,
    product_price,
    product_type,
    product_shop,
    product_attributes,
    product_quantity,
  }) {
    this.product_name = product_name;
    this.product_thumb = product_thumb;
    this.product_description = product_description;
    this.product_price = product_price;
    this.product_type = product_type;
    this.product_shop = product_shop;
    this.product_attributes = product_attributes;
    this.product_quantity = product_quantity;
  }

  async createProduct(product_id) {
    return await product.create({ ...this, _id: product_id });
  }

  async updateProduct(productId, bodyUpdate) {
    return await updateProductById({ productId, bodyUpdate, model: product });
  }
}

class Clothing extends Product {
  async createProduct() {
    const newClothing = await clothing.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newClothing) throw new BadRequestError("create new Clothing error");

    const newProduct = await super.createProduct(newClothing._id);
    if (!newProduct) throw new BadRequestError("create new Product error");

    return newProduct;
  }

  async updateProduct(productId) {
    const objectParams = this;
    if (objectParams.product_attributes) {
      await updateProductById({
        productId,
        bodyUpdate: updateNestedObject(objectParams.product_attributes),
        model: clothing,
      });
    }

    const updateProduct = await super.updateProduct(
      productId,
      updateNestedObject(objectParams.product_attributes)
    );
    return updateProduct;
  }
}

class Electronic extends Product {
  async createProduct() {
    const newElectronic = await electronic.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newElectronic)
      throw new BadRequestError("create new Electronic error");

    const newProduct = await super.createProduct(newElectronic._id);
    if (!newProduct) throw new BadRequestError("create new Product error");

    return newProduct;
  }

  async updateProduct(productId) {
    const objectParams = this;
    if (objectParams.product_attributes) {
      await updateProductById({ productId, objectParams, model: electronic });
    }

    const updateProduct = await super.updateProduct(productId, objectParams);
    return updateProduct;
  }
}

class Furniture extends Product {
  async createProduct() {
    const newFurniture = await furniture.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newFurniture) throw new BadRequestError("create new Furniture error");

    const newProduct = await super.createProduct(newFurniture._id);
    if (!newProduct) throw new BadRequestError("create new Product error");

    return newProduct;
  }

  async updateProduct(productId) {
    const objectParams = this;
    if (objectParams.product_attributes) {
      await updateProductById({
        productId,
        bodyUpdate: updateNestedObject(objectParams.product_attributes),
        model: furniture,
      });
    }

    const updateProduct = await super.updateProduct(
      productId,
      updateNestedObject(objectParams)
    );
    return updateProduct;
  }
}

ProductFactory.registerProductType("Electronic", Electronic);
ProductFactory.registerProductType("Clothing", Clothing);
ProductFactory.registerProductType("Furniture", Furniture);

module.exports = ProductFactory;
