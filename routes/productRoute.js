import express from "express";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import {
  brainTreePaymentController,
  braintreeTokenController,
  createProductController,
  deleteProductController,
  getProductController,
  getSingleProduct,
  productFilterController,
  productListController,
  productPhotoController,
  proudctCountController,
  searchProduct,
  updateProductController,
} from "../controllers/productController.js";
import formidableMiddleware from "express-formidable";
const router = express.Router();

router.post(
  "/create-product",
  requireSignIn,
  isAdmin,
  formidableMiddleware(),
  createProductController
);
router.put(
  "/update-product/:pid",
  requireSignIn,
  isAdmin,
  formidableMiddleware(),
  updateProductController
);
router.get("/get-product", getProductController);
router.get("/get-product/:slug", getSingleProduct);
router.get("/product-photo/:pid", productPhotoController);
router.post("/product-filter", productFilterController);
router.delete("/delete-product/:pid", deleteProductController);
router.get("/product-count", proudctCountController);
router.get("/product-list/:page", productListController);
router.get("/search:/keyword", searchProduct);
router.get("/braintree/token", braintreeTokenController);
router.post("/braintree/payment", requireSignIn, brainTreePaymentController);

export default router;
