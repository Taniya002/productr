const { body, validationResult } = require("express-validator");
const Product = require("../models/Product");
const { uploadToCloudinary, deleteFromCloudinary } = require("../utils/cloudinary.utils");
const { successResponse, errorResponse } = require("../utils/response.utils");

const productValidation = [
  body("productName").notEmpty().withMessage("Product name is required.").trim(),
  body("productType")
    .notEmpty()
    .withMessage("Product type is required.")
    .isIn(["Food", "Electronics", "Fashion", "Grocery", "Beauty", "Furniture"])
    .withMessage("Invalid product type."),
  body("quantityStock")
    .notEmpty()
    .withMessage("Quantity stock is required.")
    .isNumeric()
    .withMessage("Quantity stock must be a number.")
    .custom((v) => v >= 0)
    .withMessage("Quantity stock cannot be negative."),
  body("mrp")
    .notEmpty()
    .withMessage("MRP is required.")
    .isNumeric()
    .withMessage("MRP must be a number.")
    .custom((v) => v >= 0)
    .withMessage("MRP cannot be negative."),
  body("sellingPrice")
    .notEmpty()
    .withMessage("Selling price is required.")
    .isNumeric()
    .withMessage("Selling price must be a number.")
    .custom((v) => v >= 0)
    .withMessage("Selling price cannot be negative."),
  body("brandName").notEmpty().withMessage("Brand name is required.").trim(),
];

const createProduct = [
  ...productValidation,

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 400, errors.array()[0].msg);
    }

    try {
      const {
        productName,
        productType,
        quantityStock,
        mrp,
        sellingPrice,
        brandName,
        description,
        exchangeEligible,
      } = req.body;

      let images = [];
      if (req.files && req.files.length > 0) {
        const uploadPromises = req.files.map((file) => uploadToCloudinary(file.buffer));
        const results = await Promise.all(uploadPromises);
        images = results.map((r) => ({ url: r.secure_url, publicId: r.public_id }));
      }

      const product = await Product.create({
        productName,
        productType,
        quantityStock: Number(quantityStock),
        mrp: Number(mrp),
        sellingPrice: Number(sellingPrice),
        brandName,
        description: description || "",
        images,
        exchangeEligible: exchangeEligible === "true" || exchangeEligible === true,
        createdBy: req.user._id,
      });

      return successResponse(res, 201, "Product created successfully.", { product });
    } catch (error) {
      console.error("Create Product Error:", error.message);
      return errorResponse(res, 500, "Failed to create product.");
    }
  },
];

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 })
      .populate("createdBy", "email");

    return successResponse(res, 200, "Products fetched successfully.", {
      count: products.length,
      products,
    });
  } catch (error) {
    return errorResponse(res, 500, "Failed to fetch products.");
  }
};

const getPublishedProducts = async (req, res) => {
  try {
    const products = await Product.find({ createdBy: req.user._id, isPublished: true }).sort({
      createdAt: -1,
    });

    return successResponse(res, 200, "Published products fetched successfully.", {
      count: products.length,
      products,
    });
  } catch (error) {
    return errorResponse(res, 500, "Failed to fetch published products.");
  }
};

const getUnpublishedProducts = async (req, res) => {
  try {
    const products = await Product.find({ createdBy: req.user._id, isPublished: false }).sort({
      createdAt: -1,
    });

    return successResponse(res, 200, "Unpublished products fetched successfully.", {
      count: products.length,
      products,
    });
  } catch (error) {
    return errorResponse(res, 500, "Failed to fetch unpublished products.");
  }
};

const getSingleProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    }).populate("createdBy", "email");

    if (!product) {
      return errorResponse(res, 404, "Product not found.");
    }

    return successResponse(res, 200, "Product fetched successfully.", { product });
  } catch (error) {
    return errorResponse(res, 500, "Failed to fetch product.");
  }
};

const updateProduct = [
  ...productValidation.map((v) => v.optional()),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 400, errors.array()[0].msg);
    }

    try {
      const product = await Product.findOne({ _id: req.params.id, createdBy: req.user._id });

      if (!product) {
        return errorResponse(res, 404, "Product not found.");
      }

      const {
        productName,
        productType,
        quantityStock,
        mrp,
        sellingPrice,
        brandName,
        description,
        exchangeEligible,
      } = req.body;

      let images = product.images;

      if (req.files && req.files.length > 0) {
        const deletePromises = product.images.map((img) => deleteFromCloudinary(img.publicId));
        await Promise.all(deletePromises);

        const uploadPromises = req.files.map((file) => uploadToCloudinary(file.buffer));
        const results = await Promise.all(uploadPromises);
        images = results.map((r) => ({ url: r.secure_url, publicId: r.public_id }));
      }

      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        {
          ...(productName && { productName }),
          ...(productType && { productType }),
          ...(quantityStock !== undefined && { quantityStock: Number(quantityStock) }),
          ...(mrp !== undefined && { mrp: Number(mrp) }),
          ...(sellingPrice !== undefined && { sellingPrice: Number(sellingPrice) }),
          ...(brandName && { brandName }),
          ...(description !== undefined && { description }),
          ...(exchangeEligible !== undefined && {
            exchangeEligible: exchangeEligible === "true" || exchangeEligible === true,
          }),
          images,
        },
        { new: true, runValidators: true }
      );

      return successResponse(res, 200, "Product updated successfully.", { product: updatedProduct });
    } catch (error) {
      console.error("Update Product Error:", error.message);
      return errorResponse(res, 500, "Failed to update product.");
    }
  },
];

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, createdBy: req.user._id });

    if (!product) {
      return errorResponse(res, 404, "Product not found.");
    }

    if (product.images.length > 0) {
      const deletePromises = product.images.map((img) => deleteFromCloudinary(img.publicId));
      await Promise.all(deletePromises);
    }

    await Product.findByIdAndDelete(req.params.id);

    return successResponse(res, 200, "Product deleted successfully.", {});
  } catch (error) {
    return errorResponse(res, 500, "Failed to delete product.");
  }
};

const publishProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, createdBy: req.user._id });

    if (!product) {
      return errorResponse(res, 404, "Product not found.");
    }

    if (product.isPublished) {
      return errorResponse(res, 400, "Product is already published.");
    }

    product.isPublished = true;
    await product.save();

    return successResponse(res, 200, "Product published successfully.", { product });
  } catch (error) {
    return errorResponse(res, 500, "Failed to publish product.");
  }
};

const unpublishProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, createdBy: req.user._id });

    if (!product) {
      return errorResponse(res, 404, "Product not found.");
    }

    if (!product.isPublished) {
      return errorResponse(res, 400, "Product is already unpublished.");
    }

    product.isPublished = false;
    await product.save();

    return successResponse(res, 200, "Product unpublished successfully.", { product });
  } catch (error) {
    return errorResponse(res, 500, "Failed to unpublish product.");
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getPublishedProducts,
  getUnpublishedProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  publishProduct,
  unpublishProduct,
};
