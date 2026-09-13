import express from "express";
import {
  submitInquiry,
  submitDealerApplication,
  getInquiries,
  getDealerApplications,
} from "../controllers/inquiryController.js";

const router = express.Router();

router.post("/", submitInquiry);
router.get("/", getInquiries);
router.post("/dealers", submitDealerApplication);
router.get("/dealers", getDealerApplications);

export default router;
