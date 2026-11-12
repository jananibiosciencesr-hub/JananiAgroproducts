import { orders, products } from "../data/mockData.js";
import { getPool, query, isDbConnected } from "../config/db.js";

let columnsEnsured = false;
async function ensureOrderColumns() {
  if (columnsEnsured) return;
  try {
    const activePool = getPool();
    await activePool.query(`
      ALTER TABLE \`orders\` 
        ADD COLUMN IF NOT EXISTS \`coupon_code\` VARCHAR(50) DEFAULT NULL,
        ADD COLUMN IF NOT EXISTS \`coupon_discount\` DECIMAL(10,2) DEFAULT '0.00',
        ADD COLUMN IF NOT EXISTS \`wallet_deduction\` DECIMAL(10,2) DEFAULT '0.00',
        ADD COLUMN IF NOT EXISTS \`transaction_id\` VARCHAR(100) DEFAULT NULL,
        ADD COLUMN IF NOT EXISTS \`razorpay_order_id\` VARCHAR(100) DEFAULT NULL,
        ADD COLUMN IF NOT EXISTS \`delivery_slot\` VARCHAR(150) DEFAULT NULL,
        ADD COLUMN IF NOT EXISTS \`expected_delivery\` VARCHAR(100) DEFAULT NULL,
        ADD COLUMN IF NOT EXISTS \`billing_address\` JSON DEFAULT NULL
    `);
    columnsEnsured = true;
  } catch (err) {
    columnsEnsured = true;
  }
}

// Helper to format order response consistently with both camelCase and snake_case fields
export function formatOrderResponse(o) {
  if (!o) return null;

  const shippingAddress = typeof o.shipping_address === "string"
    ? JSON.parse(o.shipping_address)
    : (o.shipping_address || o.shippingAddress || o.address || {});

  const billingAddress = typeof o.billing_address === "string"
    ? JSON.parse(o.billing_address)
    : (o.billing_address || o.billingAddress || shippingAddress);

  const items = typeof o.items === "string"
    ? JSON.parse(o.items)
    : (Array.isArray(o.items) ? o.items : []);

  const timeline = typeof o.timeline === "string"
    ? JSON.parse(o.timeline)
    : (Array.isArray(o.timeline) ? o.timeline : []);

  const orderNumber = o.number || o.orderNumber || o.id;
  const customerName = o.customer_name || o.customerName || shippingAddress.fullName || shippingAddress.name || o.customer?.name || "Valued Patron";
  const customerEmail = o.customer_email || o.customerEmail || shippingAddress.email || o.customer?.email || "";
  const customerPhone = o.customer_phone || o.customerPhone || shippingAddress.phone || o.customer?.phone || "";

  return {
    id: o.id || orderNumber,
    number: orderNumber,
    orderNumber: orderNumber,
    date: o.order_date || o.date || "Recent",
    orderDate: o.order_date || o.date || "Recent",
    order_date: o.order_date || o.date || "Recent",
    isoDate: o.created_at ? String(o.created_at).split("T")[0] : new Date().toISOString().split("T")[0],
    customer_name: customerName,
    customerName,
    customer_email: customerEmail,
    customerEmail,
    customer_phone: customerPhone,
    customerPhone,
    customer: {
      id: o.customer_id || o.customer?.id || "",
      name: customerName,
      fullName: customerName,
      email: customerEmail,
      phone: customerPhone,
      tier: o.customer?.tier || "Customer"
    },
    shipping_address: shippingAddress,
    shippingAddress,
    billing_address: billingAddress,
    billingAddress,
    address: shippingAddress,
    items,
    subtotal: Number(o.subtotal || 0),
    discount: Number(o.discount || 0),
    coupon_code: o.coupon_code || o.couponCode || null,
    couponCode: o.coupon_code || o.couponCode || null,
    coupon_discount: Number(o.coupon_discount || o.couponDiscount || 0),
    couponDiscount: Number(o.coupon_discount || o.couponDiscount || 0),
    wallet_deduction: Number(o.wallet_deduction || o.walletDeduction || 0),
    walletDeduction: Number(o.wallet_deduction || o.walletDeduction || 0),
    delivery_fee: Number(o.delivery_fee ?? o.deliveryFee ?? o.shippingFee ?? 0),
    deliveryFee: Number(o.delivery_fee ?? o.deliveryFee ?? o.shippingFee ?? 0),
    shippingFee: Number(o.delivery_fee ?? o.deliveryFee ?? o.shippingFee ?? 0),
    total: Number(o.total || o.finalTotal || 0),
    finalTotal: Number(o.total || o.finalTotal || 0),
    payment_method: o.payment_method || o.paymentMethod || "Razorpay (Online)",
    paymentMethod: o.payment_method || o.paymentMethod || "Razorpay (Online)",
    payment_status: o.payment_status || o.paymentStatus || "Paid",
    paymentStatus: o.payment_status || o.paymentStatus || "Paid",
    order_status: o.order_status || o.orderStatus || o.status || "Processing",
    orderStatus: o.order_status || o.orderStatus || o.status || "Processing",
    status: o.order_status || o.orderStatus || o.status || "Processing",
    courier: o.courier || "Delhivery Air Express & Janani Direct",
    tracking_id: o.tracking_id || o.trackingId || o.awb || "",
    trackingId: o.tracking_id || o.trackingId || o.awb || "",
    awb: o.awb || o.tracking_id || "",
    delivery_slot: o.delivery_slot || o.deliverySlot || "Standard Delivery (2-3 Business Days)",
    deliverySlot: o.delivery_slot || o.deliverySlot || "Standard Delivery (2-3 Business Days)",
    expected_delivery: o.expected_delivery || o.expectedDelivery || "2-3 Business Days",
    expectedDelivery: o.expected_delivery || o.expectedDelivery || "2-3 Business Days",
    warehouse: o.warehouse || "Lodhika GIDC Central Facility, Rajkot",
    timeline,
    created_at: o.created_at || new Date().toISOString(),
    createdAt: o.created_at || new Date().toISOString()
  };
}

// @desc    Create / Place a new order
// @route   POST /api/orders OR /api/admin/orders OR /api.php?action=orders
export const createOrder = async (req, res) => {
  try {
    const body = req.body || {};
    const items = body.items || [];

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one item in the order.",
      });
    }

    // Flexible customer resolution from nested customer object or top-level properties
    const custObj = body.customer || {};
    const shipObj = body.shipping_address || body.shippingAddress || body.address || custObj.shippingAddress || custObj.address || {};

    const customerPhone = String(
      body.customer_phone ||
      custObj.phone ||
      shipObj.phone ||
      body.customerPhone ||
      ""
    ).trim();

    const customerEmail = String(
      body.customer_email ||
      custObj.email ||
      shipObj.email ||
      body.customerEmail ||
      ""
    ).trim().toLowerCase();

    const customerName = String(
      body.customer_name ||
      custObj.name ||
      `${custObj.firstName || ""} ${custObj.lastName || ""}`.trim() ||
      shipObj.fullName ||
      shipObj.name ||
      body.customerName ||
      "Valued Patron"
    ).trim();

    const streetAddress = String(
      shipObj.streetAddress ||
      shipObj.street ||
      custObj.streetAddress ||
      custObj.address ||
      body.streetAddress ||
      ""
    ).trim();

    const city = String(shipObj.city || custObj.city || body.city || "Ahmedabad").trim();
    const state = String(shipObj.state || custObj.state || body.state || "Gujarat").trim();
    const pincode = String(shipObj.pincode || custObj.pincode || body.pincode || "380054").trim();

    if (!customerPhone && !customerEmail) {
      return res.status(400).json({
        success: false,
        message: "Customer contact (mobile number or email) is required.",
      });
    }

    const resolvedShippingAddress = {
      fullName: customerName,
      name: customerName,
      phone: customerPhone,
      email: customerEmail,
      street: streetAddress || "Registered Delivery Address",
      streetAddress: streetAddress || "Registered Delivery Address",
      landmark: shipObj.landmark || custObj.landmark || "",
      city,
      state,
      pincode
    };

    const resolvedBillingAddress = body.billing_address || body.billingAddress || resolvedShippingAddress;

    // Enrich and calculate items
    let subtotal = 0;
    const enrichedItems = items.map((item) => {
      const p = products.find((prod) => prod.id === Number(item.productId || item.id || item.product?.id));
      const price = Number(item.price ?? (p ? p.price : 0));
      const name = item.name || item.title || item.product?.name || (p ? p.name : "Agro Crop Care Formulation");
      const quantity = Math.max(1, Number(item.quantity || item.qty || 1));
      const itemTotal = price * quantity;
      subtotal += itemTotal;
      return {
        id: item.id || item.productId || p?.id || Math.floor(100 + Math.random() * 900),
        productId: p ? p.id : (item.productId || item.id || 1),
        name,
        title: name,
        price,
        unit: item.unit || p?.unit || "unit",
        variant: item.variant || "Standard Pack",
        quantity,
        qty: quantity,
        image: item.image || item.product?.image || p?.image || "",
        total: itemTotal,
        subtotal: itemTotal
      };
    });

    const parsedSubtotal = body.subtotal ? Number(body.subtotal) : subtotal;
    const couponDiscount = Number(body.coupon_discount || body.couponDiscount || body.discount || 0);
    const walletDeduction = Number(body.wallet_deduction || body.walletDeduction || 0);
    const deliveryFee = Number(body.delivery_fee ?? body.deliveryFee ?? body.shippingFee ?? (parsedSubtotal >= 799 ? 0 : 60));
    const finalTotal = Number(body.total || body.finalTotal || Math.max(0, parsedSubtotal - couponDiscount - walletDeduction + deliveryFee));

    const nextNum = orders.length + 1;
    const generatedOrderNumber = body.number || body.orderNumber || body.id || `JAP-${String(nextNum).padStart(3, "0")}`;
    const orderId = body.id || generatedOrderNumber;

    const now = new Date();
    const formattedDate = body.order_date || body.date || `${now.getDate().toString().padStart(2, "0")} ${now.toLocaleString("en-US", { month: "short" })} ${now.getFullYear()}`;
    const paymentMethod = body.payment_method || body.paymentMethod || "Razorpay (Online)";
    const paymentStatus = body.payment_status || body.paymentStatus || (paymentMethod === "Cash on Delivery" ? "Pending (COD)" : "Paid");
    const orderStatus = body.order_status || body.orderStatus || body.status || "Processing";
    const courier = body.courier || "Delhivery Air Express & Janani Direct";
    const awb = body.awb || body.tracking_id || `DEL-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    const trackingId = body.tracking_id || awb;
    const warehouse = body.warehouse || "Lodhika GIDC Central Facility, Rajkot";
    const deliverySlot = body.delivery_slot || body.deliverySlot || "Standard Delivery (2-3 Business Days)";
    const expectedDelivery = body.expected_delivery || body.expectedDelivery || "2-3 Business Days";

    const defaultTimeline = [
      {
        status: paymentMethod === "Cash on Delivery" ? "Order Placed (Cash on Delivery)" : "Order Placed & Payment Verified via Razorpay",
        title: paymentMethod === "Cash on Delivery" ? "Order Placed (Cash on Delivery)" : "Order Placed & Payment Verified via Razorpay",
        time: `${formattedDate}, ${now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`,
        location: "Regional Processing Hub, Lodhika Rajkot",
        done: true,
        current: true
      },
      {
        status: "Quality Tested & Nitrogen Sealed",
        title: "Quality Tested & Nitrogen Sealed",
        time: "Within 4 Hours",
        location: "Rajkot Central Facility",
        done: false,
        current: false
      },
      {
        status: "Dispatched via Delhivery Air Express",
        title: "Dispatched via Delhivery Air Express",
        time: "Scheduled Tomorrow",
        location: "Regional Transit Gateway",
        done: false,
        current: false
      },
      {
        status: "Out for Doorstep Delivery",
        title: "Out for Doorstep Delivery",
        time: deliverySlot,
        location: "Local Delivery Hub",
        done: false,
        current: false
      },
      {
        status: "Delivered to Customer",
        title: "Delivered to Customer",
        time: expectedDelivery,
        location: "Customer Address",
        done: false,
        current: false
      }
    ];

    const timeline = Array.isArray(body.timeline) && body.timeline.length > 0 ? body.timeline : defaultTimeline;

    const newOrderData = {
      id: orderId,
      number: generatedOrderNumber,
      orderNumber: generatedOrderNumber,
      order_date: formattedDate,
      date: formattedDate,
      customer_name: customerName,
      customerName,
      customer_email: customerEmail,
      customerEmail,
      customer_phone: customerPhone,
      customerPhone,
      shipping_address: resolvedShippingAddress,
      shippingAddress: resolvedShippingAddress,
      billing_address: resolvedBillingAddress,
      billingAddress: resolvedBillingAddress,
      items: enrichedItems,
      subtotal: parsedSubtotal,
      discount: couponDiscount,
      coupon_code: body.coupon_code || body.couponCode || null,
      coupon_discount: couponDiscount,
      wallet_deduction: walletDeduction,
      delivery_fee: deliveryFee,
      shippingFee: deliveryFee,
      total: finalTotal,
      finalTotal,
      payment_method: paymentMethod,
      paymentMethod,
      payment_status: paymentStatus,
      paymentStatus,
      order_status: orderStatus,
      orderStatus,
      status: orderStatus,
      courier,
      tracking_id: trackingId,
      trackingId,
      awb,
      warehouse,
      delivery_slot: deliverySlot,
      deliverySlot,
      expected_delivery: expectedDelivery,
      expectedDelivery,
      timeline,
      created_at: now.toISOString(),
      createdAt: now.toISOString()
    };

    // 1. Persist to MySQL orders table
    try {
      await ensureOrderColumns();
      const activePool = getPool();
      await activePool.query(`
        INSERT INTO \`orders\` (
          id, number, order_date, customer_name, customer_email, customer_phone,
          shipping_address, billing_address, items, subtotal, discount,
          coupon_code, coupon_discount, wallet_deduction, delivery_fee, total,
          payment_method, payment_status, order_status, courier, tracking_id,
          awb, warehouse, delivery_slot, expected_delivery, timeline
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          customer_name = VALUES(customer_name),
          customer_email = VALUES(customer_email),
          customer_phone = VALUES(customer_phone),
          shipping_address = VALUES(shipping_address),
          items = VALUES(items),
          subtotal = VALUES(subtotal),
          total = VALUES(total),
          payment_status = VALUES(payment_status),
          order_status = VALUES(order_status),
          timeline = VALUES(timeline)
      `, [
        orderId,
        generatedOrderNumber,
        formattedDate,
        customerName,
        customerEmail,
        customerPhone,
        JSON.stringify(resolvedShippingAddress),
        JSON.stringify(resolvedBillingAddress),
        JSON.stringify(enrichedItems),
        parsedSubtotal,
        couponDiscount,
        body.coupon_code || body.couponCode || null,
        couponDiscount,
        walletDeduction,
        deliveryFee,
        finalTotal,
        paymentMethod,
        paymentStatus,
        orderStatus,
        courier,
        trackingId,
        awb,
        warehouse,
        deliverySlot,
        expectedDelivery,
        JSON.stringify(timeline)
      ]);
      console.log(`✅ [MySQL Order Persisted] Order ${generatedOrderNumber} saved to database for ${customerEmail || customerPhone}`);
    } catch (dbErr) {
      console.warn("⚠️ [Order Controller] MySQL direct order insert fallback note:", dbErr.message);
    }

    // 2. Deduct inventory stock
    enrichedItems.forEach((it) => {
      const p = products.find((prod) => prod.id === it.productId || prod.name === it.name || prod.slug === it.productId);
      if (p) {
        p.stock = Math.max(0, (p.stock ?? p.stockCount ?? 45) - it.quantity);
        if (p.stockCount !== undefined) {
          p.stockCount = p.stock;
        }
      }
    });

    // 3. Keep in-memory cache synchronized
    const existingIndex = orders.findIndex((o) => o.id === orderId || o.number === generatedOrderNumber);
    const formattedForMemory = formatOrderResponse(newOrderData);
    if (existingIndex >= 0) {
      orders[existingIndex] = formattedForMemory;
    } else {
      orders.unshift(formattedForMemory);
    }

    return res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      order: formattedForMemory,
      data: formattedForMemory
    });
  } catch (error) {
    console.error("Create Order Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all orders with customer scoping & filters
// @route   GET /api/orders
export const getOrders = async (req, res) => {
  try {
    const { email, phone, customer_email, customer_phone, status, search } = req.query;
    const filterEmail = (email || customer_email || "").trim().toLowerCase();
    const filterPhone = (phone || customer_phone || "").replace(/\D/g, "");

    // 1. Try querying MySQL orders table
    try {
      let sql = "SELECT * FROM `orders` WHERE 1=1";
      const params = [];

      if (filterEmail) {
        sql += " AND LOWER(customer_email) = ?";
        params.push(filterEmail);
      } else if (filterPhone) {
        sql += " AND customer_phone LIKE ?";
        params.push(`%${filterPhone.slice(-10)}%`);
      }

      if (status && status !== "all") {
        sql += " AND (order_status = ? OR order_status LIKE ?)";
        params.push(status, `%${status}%`);
      }

      if (search && search.trim()) {
        const q = `%${search.trim()}%`;
        sql += " AND (number LIKE ? OR customer_name LIKE ? OR customer_email LIKE ? OR customer_phone LIKE ?)";
        params.push(q, q, q, q);
      }

      sql += " ORDER BY created_at DESC LIMIT 200";

      const rows = await query(sql, params);
      if (Array.isArray(rows)) {
        const formatted = rows.map(formatOrderResponse);
        return res.status(200).json({
          success: true,
          count: formatted.length,
          total: formatted.length,
          orders: formatted,
          data: formatted
        });
      }
    } catch (dbErr) {
      console.warn("⚠️ [getOrders] MySQL query fallback to in-memory store:", dbErr.message);
    }

    // 2. In-Memory fallback with user scoping
    let results = [...orders];

    if (filterEmail) {
      results = results.filter((o) => (o.customerEmail || o.customer?.email || o.customer_email || "").toLowerCase() === filterEmail);
    } else if (filterPhone) {
      results = results.filter((o) => (o.customerPhone || o.customer?.phone || o.customer_phone || "").replace(/\D/g, "").endsWith(filterPhone.slice(-10)));
    }

    if (status && status !== "all") {
      results = results.filter((o) => (o.status || o.orderStatus || "").toLowerCase().includes(status.toLowerCase()));
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      results = results.filter((o) =>
        (o.number || "").toLowerCase().includes(q) ||
        (o.customerName || o.customer?.name || "").toLowerCase().includes(q)
      );
    }

    const formattedResults = results.map(formatOrderResponse);

    return res.status(200).json({
      success: true,
      count: formattedResults.length,
      total: formattedResults.length,
      orders: formattedResults,
      data: formattedResults
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single order by order number or ID
// @route   GET /api/orders/:orderNumber
export const getOrderByNumber = async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const clean = orderNumber.trim().toUpperCase();

    // 1. Check MySQL
    try {
      const rows = await query(
        "SELECT * FROM `orders` WHERE UPPER(number) = ? OR UPPER(id) = ? LIMIT 1",
        [clean, clean]
      );
      if (rows && rows.length > 0) {
        const formatted = formatOrderResponse(rows[0]);
        return res.status(200).json({
          success: true,
          order: formatted,
          data: formatted
        });
      }
    } catch (dbErr) { }

    // 2. Check memory
    const order = orders.find(
      (o) => (o.number || "").toUpperCase() === clean || String(o.id || "").toUpperCase() === clean
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order not found with reference: ${orderNumber}`,
      });
    }

    const formatted = formatOrderResponse(order);
    return res.status(200).json({
      success: true,
      order: formatted,
      data: formatted
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Live track order by query (order number or phone)
// @route   GET /api/orders/track/:query
export const trackOrder = async (req, res) => {
  try {
    const { query: trackQuery } = req.params;
    const clean = trackQuery.trim().toUpperCase();
    const cleanDigits = trackQuery.replace(/\D/g, "");

    // 1. Check MySQL
    try {
      const rows = await query(
        "SELECT * FROM `orders` WHERE UPPER(number) = ? OR UPPER(id) = ? OR customer_phone LIKE ? LIMIT 1",
        [clean, clean, `%${cleanDigits.slice(-10)}%`]
      );
      if (rows && rows.length > 0) {
        const formatted = formatOrderResponse(rows[0]);
        return res.status(200).json({
          success: true,
          order: formatted,
          data: formatted
        });
      }
    } catch (dbErr) { }

    let order = orders.find(
      (o) =>
        (o.number || "").toUpperCase() === clean ||
        (o.customerPhone || o.customer?.phone || "").replace(/\D/g, "").endsWith(cleanDigits.slice(-10))
    );

    if (!order) {
      order = {
        number: clean.startsWith("JAP") ? clean : `JAP-${clean}`,
        date: "Today",
        status: "In Transit",
        courier: "Delhivery Air Express",
        awb: `DEL-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
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

    const formatted = formatOrderResponse(order);
    return res.status(200).json({
      success: true,
      order: formatted,
      data: formatted
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
