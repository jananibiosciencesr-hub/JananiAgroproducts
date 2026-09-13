const names = [
  ["Organic Basmati Rice", "Organic Rice", 249, "1 kg"],
  ["Premium Wheat Flour", "Flours", 119, "1 kg"],
  ["Lakadong Turmeric Powder", "Spices", 189, "200 g"],
  ["Kashmiri Red Chilli Powder", "Spices", 169, "200 g"],
  ["Whole Coriander Powder", "Spices", 139, "200 g"],
  ["Wood-Pressed Groundnut Oil", "Cold Pressed Oils", 399, "1 L"],
  ["Cold-Pressed Mustard Oil", "Cold Pressed Oils", 329, "1 L"],
  ["Organic Green Gram", "Pulses", 179, "500 g"],
  ["Unpolished Toor Dal", "Pulses", 199, "500 g"],
  ["Foxtail Millet", "Millets", 149, "500 g"],
  ["Natural Jaggery Powder", "Dry Fruits", 129, "500 g"],
  ["Organic Sesame Seeds", "Seeds", 159, "250 g"],
  ["Brown Rice", "Organic Rice", 219, "1 kg"],
  ["Khapli Wheat", "Wheat", 189, "1 kg"],
  ["Pearl Millet", "Millets", 109, "500 g"],
  ["Split Bengal Gram", "Pulses", 149, "500 g"],
  ["Cumin Seeds", "Spices", 219, "200 g"],
  ["Black Pepper Whole", "Spices", 299, "150 g"],
  ["Virgin Coconut Oil", "Cold Pressed Oils", 449, "500 ml"],
  ["Flax Seeds", "Seeds", 169, "250 g"],
  ["Almonds Premium", "Dry Fruits", 599, "500 g"],
  ["Stoneground Besan", "Flours", 139, "500 g"],
  ["Vermicompost Plus", "Organic Fertilizers", 299, "5 kg"],
  ["Native Vegetable Seeds", "Seeds", 199, "12 packs"],
];

const slugs = (val) => val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export const products = names.map(([name, category, price, unit], index) => ({
  id: index + 1,
  slug: slugs(name),
  name,
  category,
  price,
  oldPrice: Math.round(price * 1.2),
  unit,
  stock: 50 + index * 10,
  rating: Number((4.6 + (index % 4) * 0.1).toFixed(1)),
  reviews: 34 + index * 7,
  badge: index < 4 ? "Bestseller" : index % 4 === 0 ? "New Harvest" : null,
  image: index % 2 === 0 ? "/assets/janani-pantry.jpg" : "/assets/janani-products.jpg",
  description: `Carefully sourced ${name.toLowerCase()} with natural flavour, honest nutrition and complete traceability from our partner farms in Gujarat and across India.`,
  origin: "Lodhika GIDC, Gujarat",
  certification: "Certified Organic & NPOP Verified",
}));

export const categories = [
  "Organic Rice", "Wheat", "Millets", "Pulses", "Spices", "Cold Pressed Oils", "Seeds", "Dry Fruits", "Flours", "Organic Fertilizers",
].map((name, index) => ({
  id: index + 1,
  name,
  slug: slugs(name),
  count: products.filter((p) => p.category === name).length || index + 3,
  description: `Pure, unadulterated ${name.toLowerCase()} cultivated through traditional agro-ecological farming methods.`,
}));

export let orders = [
  {
    id: 1,
    number: "JAP-260811",
    date: "08 Sep 2026",
    total: 1246,
    status: "Shipped",
    itemsCount: 4,
    items: [
      { productId: 1, name: "Organic Basmati Rice", price: 249, quantity: 2 },
      { productId: 3, name: "Lakadong Turmeric Powder", price: 189, quantity: 2 },
      { productId: 6, name: "Wood-Pressed Groundnut Oil", price: 399, quantity: 1 },
    ],
    customer: {
      name: "Neha Patel",
      phone: "9311416225",
      email: "neha.patel@example.com",
      address: "A-304, Green Acres, SG Highway, Ahmedabad, Gujarat – 380054",
    },
    courier: "Delhivery Air Express",
    awb: "DEL-8492048194",
    expected: "12 Sep 2026",
    timeline: [
      { status: "Order Confirmed & Payment Verified", time: "08 Sep 2026, 10:30 AM", done: true },
      { status: "Batch Quality Tested & Nitrogen Packed", time: "09 Sep 2026, 03:15 PM", done: true },
      { status: "Dispatched from Lodhika GIDC Facility", time: "10 Sep 2026, 09:00 AM", done: true },
      { status: "Arrived at Regional Sort Center", time: "11 Sep 2026, 06:45 AM", done: true },
      { status: "Out for Delivery", time: "Expected 12 Sep 2026", done: false },
      { status: "Delivered to Customer", time: "Pending", done: false },
    ],
  },
  {
    id: 2,
    number: "JAP-260724",
    date: "24 Aug 2026",
    total: 879,
    status: "Delivered",
    itemsCount: 3,
    items: [
      { productId: 2, name: "Premium Wheat Flour", price: 119, quantity: 2 },
      { productId: 7, name: "Cold-Pressed Mustard Oil", price: 329, quantity: 1 },
      { productId: 9, name: "Unpolished Toor Dal", price: 199, quantity: 1 },
    ],
    customer: {
      name: "Neha Patel",
      phone: "9311416225",
      email: "neha.patel@example.com",
      address: "A-304, Green Acres, SG Highway, Ahmedabad, Gujarat – 380054",
    },
    courier: "BlueDart Express",
    awb: "BLU-5930284912",
    expected: "27 Aug 2026",
    timeline: [
      { status: "Order Confirmed", time: "24 Aug 2026", done: true },
      { status: "Quality Tested & Packed", time: "25 Aug 2026", done: true },
      { status: "Dispatched", time: "25 Aug 2026", done: true },
      { status: "Delivered", time: "27 Aug 2026", done: true },
    ],
  },
];

export let inquiries = [];
export let dealerApplications = [];
export let contactMessages = [];
export let newsletterSubscribers = [];
