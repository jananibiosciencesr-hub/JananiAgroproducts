import express from "express";
import {
  getProducts,
  getProductByIdOrSlug,
  getCategories,
  getCategoryBySlug,
} from "../controllers/productController.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/categories", getCategories);
router.get("/categories/:slug", getCategoryBySlug);
router.get("/:idOrSlug", getProductByIdOrSlug);

export default router;
