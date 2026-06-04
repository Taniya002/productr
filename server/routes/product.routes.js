const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const { upload, handleMulterError } = require("../middleware/upload.middleware");
const {
  createProduct,
  getAllProducts,
  getPublishedProducts,
  getUnpublishedProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  publishProduct,
  unpublishProduct,
} = require("../controllers/product.controller");

router.use(protect);

router.get("/published", getPublishedProducts);
router.get("/unpublished", getUnpublishedProducts);

router
  .route("/")
  .get(getAllProducts)
  .post(upload.array("images", 5), handleMulterError, createProduct);

router
  .route("/:id")
  .get(getSingleProduct)
  .put(upload.array("images", 5), handleMulterError, updateProduct)
  .delete(deleteProduct);

router.patch("/publish/:id", publishProduct);
router.patch("/unpublish/:id", unpublishProduct);

module.exports = router;
