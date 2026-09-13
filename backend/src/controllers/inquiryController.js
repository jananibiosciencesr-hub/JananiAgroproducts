import { inquiries, dealerApplications } from "../data/mockData.js";

// @desc    Submit a commercial or services inquiry
// @route   POST /api/inquiries
export const submitInquiry = (req, res) => {
  try {
    const { name, businessName, service, email, phone, quantity, message } = req.body;

    if (!name || !phone || !email) {
      return res.status(400).json({
        success: false,
        message: "Name, phone, and email are required fields.",
      });
    }

    const newInquiry = {
      id: inquiries.length + 1,
      name,
      businessName: businessName || "N/A",
      service: service || "General Commercial Service",
      email,
      phone,
      quantity: quantity || "Not specified",
      message: message || "",
      status: "New",
      createdAt: new Date().toISOString(),
    };

    inquiries.unshift(newInquiry);

    return res.status(201).json({
      success: true,
      message: "Commercial inquiry received successfully! Our sales head will contact you within 24 hours.",
      inquiry: newInquiry,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit a dealer or distributor application
// @route   POST /api/dealers/apply
export const submitDealerApplication = (req, res) => {
  try {
    const {
      businessName,
      contactPerson,
      phone,
      email,
      gst,
      city,
      state,
      tier,
      investment,
      message,
    } = req.body;

    if (!businessName || !contactPerson || !phone || !city) {
      return res.status(400).json({
        success: false,
        message: "Business name, contact person, phone, and city are required.",
      });
    }

    const application = {
      id: dealerApplications.length + 1,
      businessName,
      contactPerson,
      phone,
      email: email || "",
      gst: gst || "N/A",
      city,
      state: state || "Gujarat",
      tier: tier || "Retail Dealership",
      investment: investment || "₹1,00,000 - ₹3,00,000",
      message: message || "",
      status: "Under Review",
      createdAt: new Date().toISOString(),
    };

    dealerApplications.unshift(application);

    return res.status(201).json({
      success: true,
      message: "Dealer application submitted successfully! Our regional distributor desk will review your profile.",
      application,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all inquiries (for admin/monitoring)
// @route   GET /api/inquiries
export const getInquiries = (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      count: inquiries.length,
      inquiries,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all dealer applications
// @route   GET /api/dealers/applications
export const getDealerApplications = (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      count: dealerApplications.length,
      applications: dealerApplications,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
