import express from "express";
import {
  submitContactMessage,
  subscribeNewsletter,
} from "../controllers/contactController.js";

const router = express.Router();

router.post("/message", submitContactMessage);
router.post("/newsletter", subscribeNewsletter);

export default router;
