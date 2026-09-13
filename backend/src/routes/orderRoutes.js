import express from "express";
import {
  createOrder,
  getOrders,
  getOrderByNumber,
  trackOrder,
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/", createOrder);
router.get("/", getOrders);
router.get("/track/:query", trackOrder);
router.get("/:orderNumber", getOrderByNumber);

export default router;
