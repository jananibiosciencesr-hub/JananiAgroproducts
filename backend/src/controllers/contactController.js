import { contactMessages, newsletterSubscribers } from "../data/mockData.js";

// @desc    Submit contact message from Contact page
// @route   POST /api/contact
export const submitContactMessage = (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and message are required fields.",
      });
    }

    const newMessage = {
      id: contactMessages.length + 1,
      name,
      email,
      phone: phone || "",
      subject: subject || "General Inquiry",
      message,
      createdAt: new Date().toISOString(),
    };

    contactMessages.unshift(newMessage);

    return res.status(201).json({
      success: true,
      message: "Your message has been sent to Janani Agro customer support. We will reply promptly!",
      data: newMessage,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Subscribe to harvest newsletter
// @route   POST /api/newsletter
export const subscribeNewsletter = (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes("@")) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    if (!newsletterSubscribers.includes(email.toLowerCase())) {
      newsletterSubscribers.push(email.toLowerCase());
    }

    return res.status(200).json({
      success: true,
      message: "Thank you for subscribing to the Janani Harvest Journal & private offers!",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
