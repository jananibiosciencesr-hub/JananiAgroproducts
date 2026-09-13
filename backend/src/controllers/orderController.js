import { orders, products } from "../data/mockData.js";

// @desc    Create / Place a new order
// @route   POST /api/orders
export const createOrder = (req, res) => {
  try {
    const { items, customer, paymentMethod, couponCode } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one item in the order.",
      });
    }

    if (!customer || !customer.phone || !customer.address) {
      return res.status(400).json({
        success: false,
        message: "Customer contact and delivery address are required.",
      });
    }

    // Enrich items with verified product data and calculate subtotal
    let subtotal = 0;
    const enrichedItems = items.map((item) => {
      const p = products.find((prod) => prod.id === Number(item.productId || item.id));
      const price = p ? p.price : Number(item.price || 0);
      const name = p ? p.name : item.name || "Organic Product";
      const quantity = Math.max(1, Number(item.quantity || item.qty || 1));
      const itemTotal = price * quantity;
      subtotal += itemTotal;
      return {
        productId: p ? p.id : item.productId,
        name,
        price,
        unit: p?.unit || "unit",
        quantity,
        total: itemTotal,
      };
    });

    // Discount calculations
    let discount = 0;
    if (couponCode === "JANANI10") {
      discount = Math.round(subtotal * 0.1);
    } else if (couponCode === "ORGANIC50") {
      discount = Math.min(50, subtotal);
    }

    // Shipping calculation (Free for >= ₹799)
    const shippingFee = subtotal >= 799 ? 0 : 60;
    const finalTotal = Math.max(0, subtotal - discount + shippingFee);

    const newOrderNumber = `JAP-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date();
    const formattedDate = `${now.getDate().toString().padStart(2, "0")} ${now.toLocaleString("en-US", { month: "short" })} ${now.getFullYear()}`;

    const newOrder = {
      id: orders.length + 1,
      number: newOrderNumber,
      date: formattedDate,
      subtotal,
      discount,
      shippingFee,
      total: finalTotal,
      status: "Confirmed",
      paymentMethod: paymentMethod || "UPI",
      itemsCount: enrichedItems.reduce((acc, curr) => acc + curr.quantity, 0),
      items: enrichedItems,
      customer: {
        name: `${customer.firstName || ""} ${customer.lastName || ""}`.trim() || customer.name || "Valued Customer",
        phone: customer.phone,
        email: customer.email || "",
        address: `${customer.address || ""}, ${customer.landmark || ""}, ${customer.city || ""}, ${customer.state || "Gujarat"} – ${customer.pincode || ""}`.replace(/,\s*,/g, ","),
      },
      courier: "Delhivery Air Express",
      awb: `DEL-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      expected: "Within 3–4 Days",
      timeline: [
        {
          status: "Order Confirmed & Payment Verified",
          time: `${formattedDate}, ${now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`,
          done: true,
        },
        { status: "Batch Quality Tested & Nitrogen Packed", time: "Pending", done: false },
        { status: "Dispatched from Lodhika GIDC Facility", time: "Pending", done: false },
        { status: "Out for Delivery", time: "Pending", done: false },
        { status: "Delivered to Customer", time: "Pending", done: false },
      ],
      createdAt: now.toISOString(),
    };

    orders.unshift(newOrder);

    return res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      order: newOrder,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
export const getOrders = (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single order by order number or ID
// @route   GET /api/orders/:orderNumber
export const getOrderByNumber = (req, res) => {
  try {
    const { orderNumber } = req.params;
    const clean = orderNumber.trim().toUpperCase();

    const order = orders.find(
      (o) => o.number.toUpperCase() === clean || String(o.id) === clean
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order not found with reference: ${orderNumber}`,
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Live track order by query (order number or phone)
// @route   GET /api/orders/track/:query
export const trackOrder = (req, res) => {
  try {
    const { query } = req.params;
    const clean = query.trim().toUpperCase();

    let order = orders.find(
      (o) =>
        o.number.toUpperCase() === clean ||
        o.customer?.phone?.replace(/\D/g, "") === clean.replace(/\D/g, "")
    );

    if (!order) {
      // Return simulated live tracking for custom JAP query
      order = {
        number: clean.startsWith("JAP") ? clean : `JAP-${clean}`,
        date: "Today",
        status: "In Transit",
        courier: "Delhivery Air Express",
        awb: `AWB-${Math.floor(100000000 + Math.random() * 900000000)}`,
        expected: "Within 2–3 Days",
        timeline: [
          { status: "Order Confirmed & Processed", time: "Completed", done: true },
          { status: "Cleaned & Packed in Lodhika GIDC, Gujarat", time: "Completed", done: true },
          { status: "Dispatched & In Transit", time: "Active", done: true },
          { status: "Out for Delivery", time: "Upcoming", done: false },
          { status: "Delivered to Customer", time: "Pending", done: false },
        ],
      };
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
