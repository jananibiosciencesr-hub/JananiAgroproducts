-- =======================================================================
-- JANANI AGRO PRODUCTS - COMPLETE PRODUCTION DATABASE SCHEMA & SEED DATA
-- Website: https://jananiagroproducts.com
-- Database: u409810820_Jananiagro
-- Username: u409810820_Jananiagropro
-- =======================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- --------------------------------------------------------
-- Table structure for `users`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `password` VARCHAR(255) DEFAULT NULL,
  `role` VARCHAR(50) DEFAULT 'Customer',
  `wallet_balance` DECIMAL(10,2) DEFAULT '0.00',
  `loyalty_points` INT(11) DEFAULT '0',
  `tier` VARCHAR(50) DEFAULT 'Silver',
  `status` VARCHAR(50) DEFAULT 'Active',
  `referral_code` VARCHAR(50) DEFAULT NULL,
  `is_verified` TINYINT(1) DEFAULT '1',
  `preferences` JSON DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `categories`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `categories` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `level` INT(11) DEFAULT '1',
  `parent_id` VARCHAR(64) DEFAULT NULL,
  `parent_name` VARCHAR(255) DEFAULT NULL,
  `image` VARCHAR(500) DEFAULT NULL,
  `product_count` INT(11) DEFAULT '0',
  `active` TINYINT(1) DEFAULT '1',
  `featured` TINYINT(1) DEFAULT '0',
  `trending` TINYINT(1) DEFAULT '0',
  `display_order` INT(11) DEFAULT '0',
  `description` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `products`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `products` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `slug` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `category_name` VARCHAR(255) NOT NULL,
  `category_id` VARCHAR(64) DEFAULT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `old_price` DECIMAL(10,2) DEFAULT NULL,
  `unit` VARCHAR(50) DEFAULT '1 kg',
  `stock` INT(11) DEFAULT '50',
  `rating` DECIMAL(2,1) DEFAULT '4.8',
  `reviews_count` INT(11) DEFAULT '0',
  `badge` VARCHAR(100) DEFAULT NULL,
  `image` VARCHAR(500) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `origin` VARCHAR(255) DEFAULT 'Lodhika GIDC, Gujarat',
  `certification` VARCHAR(255) DEFAULT 'Certified Organic & NPOP Verified',
  `active` TINYINT(1) DEFAULT '1',
  `status` VARCHAR(50) DEFAULT 'Active',
  `sku` VARCHAR(100) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `orders`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `orders` (
  `id` VARCHAR(64) NOT NULL,
  `number` VARCHAR(64) NOT NULL,
  `order_date` VARCHAR(100) DEFAULT NULL,
  `customer_name` VARCHAR(255) DEFAULT NULL,
  `customer_email` VARCHAR(255) DEFAULT NULL,
  `customer_phone` VARCHAR(50) DEFAULT NULL,
  `shipping_address` JSON DEFAULT NULL,
  `items` JSON DEFAULT NULL,
  `subtotal` DECIMAL(10,2) DEFAULT '0.00',
  `discount` DECIMAL(10,2) DEFAULT '0.00',
  `delivery_fee` DECIMAL(10,2) DEFAULT '0.00',
  `total` DECIMAL(10,2) NOT NULL,
  `payment_method` VARCHAR(100) DEFAULT 'UPI / Online',
  `payment_status` VARCHAR(50) DEFAULT 'Paid',
  `order_status` VARCHAR(50) DEFAULT 'Processing',
  `courier` VARCHAR(100) DEFAULT 'Delhivery Air Express',
  `tracking_id` VARCHAR(100) DEFAULT NULL,
  `awb` VARCHAR(100) DEFAULT NULL,
  `warehouse` VARCHAR(255) DEFAULT 'Lodhika GIDC Central Facility',
  `timeline` JSON DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `number` (`number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `coupons`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `coupons` (
  `id` VARCHAR(64) NOT NULL,
  `code` VARCHAR(50) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `type` VARCHAR(50) DEFAULT 'percentage',
  `discount` DECIMAL(10,2) NOT NULL,
  `min_cart` DECIMAL(10,2) DEFAULT '0.00',
  `max_discount` DECIMAL(10,2) DEFAULT '0.00',
  `start_date` DATE DEFAULT NULL,
  `expiry_date` DATE DEFAULT NULL,
  `uses` INT(11) DEFAULT '0',
  `max_uses` INT(11) DEFAULT '1000',
  `per_user_limit` INT(11) DEFAULT '1',
  `is_first_order_only` TINYINT(1) DEFAULT '0',
  `is_free_shipping` TINYINT(1) DEFAULT '0',
  `user_specific_tier` VARCHAR(50) DEFAULT 'All',
  `active` TINYINT(1) DEFAULT '1',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `settings`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `settings` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `setting_key` VARCHAR(100) NOT NULL,
  `setting_value` JSON NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_key` (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `reviews`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `reviews` (
  `id` VARCHAR(64) NOT NULL,
  `product_id` VARCHAR(64) NOT NULL,
  `product_name` VARCHAR(255) NOT NULL,
  `customer_id` VARCHAR(64) DEFAULT NULL,
  `customer_name` VARCHAR(255) NOT NULL,
  `customer_email` VARCHAR(255) DEFAULT NULL,
  `rating` INT(11) DEFAULT '5',
  `title` VARCHAR(255) DEFAULT NULL,
  `comment` TEXT DEFAULT NULL,
  `verified_purchase` TINYINT(1) DEFAULT '1',
  `status` VARCHAR(50) DEFAULT 'Approved',
  `helpful_count` INT(11) DEFAULT '0',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `cms_banners`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `cms_banners` (
  `id` VARCHAR(64) NOT NULL,
  `type` VARCHAR(50) DEFAULT 'hero',
  `title` VARCHAR(255) NOT NULL,
  `subtitle` VARCHAR(255) DEFAULT NULL,
  `image_url` VARCHAR(500) DEFAULT NULL,
  `cta_label` VARCHAR(100) DEFAULT NULL,
  `cta_url` VARCHAR(255) DEFAULT NULL,
  `badge` VARCHAR(100) DEFAULT NULL,
  `slide_order` INT(11) DEFAULT '1',
  `active` TINYINT(1) DEFAULT '1',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `payments`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `payments` (
  `id` VARCHAR(64) NOT NULL,
  `order_id` VARCHAR(64) NOT NULL,
  `customer_name` VARCHAR(255) DEFAULT NULL,
  `customer_email` VARCHAR(255) DEFAULT NULL,
  `gateway` VARCHAR(50) DEFAULT 'Razorpay',
  `method` VARCHAR(50) DEFAULT 'UPI',
  `gross_amount` DECIMAL(10,2) NOT NULL,
  `gateway_fee` DECIMAL(10,2) DEFAULT '0.00',
  `net_settled_amount` DECIMAL(10,2) NOT NULL,
  `currency` VARCHAR(10) DEFAULT 'INR',
  `status` VARCHAR(50) DEFAULT 'Captured',
  `refunded_amount` DECIMAL(10,2) DEFAULT '0.00',
  `bank_utr` VARCHAR(100) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `inquiries`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `inquiries` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `business_name` VARCHAR(255) DEFAULT NULL,
  `service` VARCHAR(100) DEFAULT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `quantity` VARCHAR(100) DEFAULT NULL,
  `message` TEXT DEFAULT NULL,
  `status` VARCHAR(50) DEFAULT 'New',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `activity_logs`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `activity_logs` (
  `id` VARCHAR(64) NOT NULL,
  `actor_name` VARCHAR(255) DEFAULT NULL,
  `actor_email` VARCHAR(255) DEFAULT NULL,
  `actor_role` VARCHAR(100) DEFAULT NULL,
  `action` VARCHAR(255) DEFAULT NULL,
  `module` VARCHAR(100) DEFAULT NULL,
  `severity` VARCHAR(50) DEFAULT 'low',
  `ip_address` VARCHAR(50) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================
-- SEED DATA
-- ========================================================

-- Categories Seed
INSERT IGNORE INTO `categories` (`id`, `name`, `slug`, `level`, `parent_id`, `parent_name`, `image`, `product_count`, `active`, `featured`, `trending`, `display_order`) VALUES
('cat-oils', 'Cold Pressed Oils', 'cold-pressed-oils', 1, NULL, NULL, '/images/categories/oils.webp', 4, 1, 1, 1, 1),
('cat-rice', 'Organic Rice', 'organic-rice', 1, NULL, NULL, '/images/categories/rice.webp', 3, 1, 1, 0, 2),
('cat-pulses', 'Pulses & Dals', 'pulses', 1, NULL, NULL, '/images/categories/pulses.webp', 3, 1, 1, 0, 3),
('cat-spices', 'Raw Spices', 'spices', 1, NULL, NULL, '/images/categories/spices.webp', 4, 1, 1, 1, 4),
('cat-wheat', 'Wheat & Grains', 'wheat', 1, NULL, NULL, '/images/categories/wheat.webp', 2, 1, 0, 0, 5),
('cat-millets', 'Ancient Millets', 'millets', 1, NULL, NULL, '/images/categories/millets.webp', 2, 1, 0, 1, 6),
('cat-seeds', 'Seeds & Superfoods', 'seeds', 1, NULL, NULL, '/images/categories/seeds.webp', 3, 1, 0, 0, 7),
('cat-flours', 'Stoneground Flours', 'flours', 1, NULL, NULL, '/images/categories/flours.webp', 2, 1, 0, 0, 8),
('cat-dryfruits', 'Dry Fruits & Sweeteners', 'dry-fruits', 1, NULL, NULL, '/images/categories/dryfruits.webp', 2, 1, 0, 0, 9),
('cat-fertilizers', 'Organic Fertilizers', 'organic-fertilizers', 1, NULL, NULL, '/images/categories/fertilizers.webp', 1, 1, 0, 0, 10);

-- Products Seed (24 Organic SKUs)
INSERT IGNORE INTO `products` (`slug`, `name`, `category_name`, `price`, `old_price`, `unit`, `stock`, `rating`, `reviews_count`, `badge`, `image`, `description`, `sku`) VALUES
('wood-pressed-groundnut-oil', 'Wood Pressed Groundnut Oil', 'Cold Pressed Oils', 399.00, 480.00, '1 L', 85, 4.9, 86, 'Bestseller', '/images/products/wood-pressed-groundnut-oil.webp', 'Slow wood-pressed from Saurashtra native groundnuts. 100% natural, chemical-free.', 'JAP-SKU-001'),
('cold-pressed-mustard-oil', 'Cold Pressed Mustard Oil', 'Cold Pressed Oils', 329.00, 395.00, '1 L', 60, 4.8, 54, 'Pure Kachi Ghani', '/images/products/cold-pressed-mustard-oil.webp', 'Traditional Kachi Ghani extracted from whole yellow and brown mustard seeds.', 'JAP-SKU-002'),
('virgin-coconut-oil', 'Cold Pressed Virgin Coconut Oil', 'Cold Pressed Oils', 449.00, 540.00, '500 ml', 45, 4.9, 42, 'Pure Aroma', '/images/products/virgin-coconut-oil.webp', 'Cold extracted from freshly grated coconut milk. Raw, unrefined, and aromatic.', 'JAP-SKU-003'),
('organic-basmati-rice', 'Royal Aged Organic Basmati Rice', 'Organic Rice', 249.00, 299.00, '1 kg', 120, 4.9, 112, 'Heritage Reserve', '/images/products/organic-basmati-rice.webp', 'Aged 2 years for elongated grain fluffiness and authentic aroma.', 'JAP-SKU-004'),
('brown-rice', 'Traditional Brown Basmati Rice', 'Organic Rice', 219.00, 260.00, '1 kg', 75, 4.7, 38, NULL, '/images/products/brown-rice.webp', 'Unpolished nutrient-rich brown rice rich in dietary fibre.', 'JAP-SKU-005'),
('unpolished-toor-dal', 'Unpolished Organic Toor Dal', 'Pulses & Dals', 199.00, 240.00, '1 kg', 90, 4.8, 64, 'High Protein', '/images/products/unpolished-toor-dal.webp', 'Zero water polish, enzyme-rich farm fresh toor dal that cooks easily.', 'JAP-SKU-006'),
('organic-green-gram', 'Organic Whole Moong (Green Gram)', 'Pulses & Dals', 179.00, 215.00, '500 g', 65, 4.8, 41, NULL, '/images/products/organic-green-gram.webp', 'High-sprouting native whole green moong for nutritious daily meals.', 'JAP-SKU-007'),
('split-bengal-gram', 'Organic Chana Dal (Bengal Gram)', 'Pulses & Dals', 149.00, 180.00, '500 g', 70, 4.7, 29, NULL, '/images/products/split-bengal-gram.webp', 'Stone-milled pesticide-free split Bengal gram dal.', 'JAP-SKU-008'),
('lakadong-turmeric-powder', 'Lakadong High-Curcumin Turmeric Powder', 'Raw Spices', 189.00, 230.00, '200 g', 80, 5.0, 95, '7.8% Curcumin', '/images/products/lakadong-turmeric-powder.webp', 'Organically harvested Meghalaya Lakadong turmeric with superior medicinal potency.', 'JAP-SKU-009'),
('kashmiri-red-chilli-powder', 'Kashmiri Mild Red Chilli Powder', 'Raw Spices', 169.00, 205.00, '200 g', 60, 4.8, 48, 'Vibrant Colour', '/images/products/kashmiri-red-chilli-powder.webp', 'Stemless sun-dried Kashmiri chillies delivering vivid crimson shade and mild heat.', 'JAP-SKU-010'),
('whole-coriander-powder', 'Stone Ground Coriander Powder', 'Raw Spices', 139.00, 170.00, '200 g', 55, 4.7, 33, NULL, '/images/products/whole-coriander-powder.webp', 'Freshly powdered whole aromatic Dhana seeds.', 'JAP-SKU-011'),
('cumin-seeds', 'Whole Native Cumin Seeds (Jeera)', 'Raw Spices', 219.00, 265.00, '200 g', 70, 4.9, 52, 'Rich Essential Oils', '/images/products/cumin-seeds.webp', 'Sun-cured Gujarat cumin seeds packed with aroma.', 'JAP-SKU-012'),
('khapli-wheat', 'Ancient Emmer (Khapli) Wheat', 'Wheat & Grains', 189.00, 230.00, '1 kg', 50, 4.9, 61, 'Diabetic Friendly', '/images/products/khapli-wheat.webp', 'Low GI indigenous grain celebrated for sustained energy.', 'JAP-SKU-013'),
('premium-wheat-flour', 'Chakki Fresh Sharbati Atta', 'Wheat & Grains', 119.00, 145.00, '1 kg', 150, 4.8, 88, NULL, '/images/products/premium-wheat-flour.webp', '100% whole grain wheat flour ground at low temperature.', 'JAP-SKU-014'),
('foxtail-millet', 'Organic Foxtail Millet (Kangni)', 'Ancient Millets', 149.00, 180.00, '500 g', 65, 4.8, 44, 'Superfood', '/images/products/foxtail-millet.webp', 'Gluten-free traditional grain rich in iron and phosphorus.', 'JAP-SKU-015'),
('pearl-millet', 'Native Desi Bajra (Pearl Millet)', 'Ancient Millets', 109.00, 135.00, '500 g', 80, 4.7, 31, NULL, '/images/products/pearl-millet.webp', 'Wholesome winter millet grown in dry Saurashtra soils.', 'JAP-SKU-016'),
('organic-sesame-seeds', 'Natural White Sesame Seeds (Til)', 'Seeds & Superfoods', 159.00, 195.00, '250 g', 55, 4.8, 36, 'Calcium Rich', '/images/products/organic-sesame-seeds.webp', 'Sun-dried whole unhulled white sesame seeds.', 'JAP-SKU-017'),
('flax-seeds', 'Roasted Golden Flax Seeds (Alsi)', 'Seeds & Superfoods', 169.00, 205.00, '250 g', 70, 4.9, 47, 'Omega-3', '/images/products/flax-seeds.webp', 'Nutrient-dense superfood for cardiovascular wellness.', 'JAP-SKU-018'),
('stoneground-besan', 'Fine Stoneground Gram Flour (Besan)', 'Stoneground Flours', 139.00, 170.00, '500 g', 85, 4.8, 59, NULL, '/images/products/stoneground-besan.webp', 'Silky smooth aromatic chana dal flour for pakoras and laddoos.', 'JAP-SKU-019'),
('natural-jaggery-powder', 'Unrefined Desi Jaggery Powder (Gud)', 'Dry Fruits & Sweeteners', 129.00, 160.00, '500 g', 95, 4.9, 73, 'Chemical Free', '/images/products/natural-jaggery-powder.webp', 'Naturally crystallised sugarcane juice without chemical bleaching.', 'JAP-SKU-020'),
('almonds-premium', 'Giri Mamra Almonds', 'Dry Fruits & Sweeteners', 599.00, 720.00, '500 g', 40, 5.0, 51, 'High Oil Content', '/images/products/almonds-premium.webp', 'Hand-selected unpasteurized Mamra almonds from verified orchards.', 'JAP-SKU-021'),
('vermicompost-plus', 'Bio-Enriched Vermicompost Fertilizer', 'Organic Fertilizers', 299.00, 360.00, '5 kg', 100, 4.9, 67, '100% Organic', '/images/products/vermicompost-plus.webp', 'Earthworm enriched organic manure for lush terrace and farm crops.', 'JAP-SKU-022'),
('native-vegetable-seeds', 'Indigenous Heritage Kitchen Garden Seed Kit', 'Seeds & Superfoods', 199.00, 250.00, '12 packs', 60, 4.9, 43, 'Non-Hybrid', '/images/products/native-vegetable-seeds.webp', '12 non-GMO heirloom open-pollinated vegetable varieties.', 'JAP-SKU-023'),
('black-pepper-whole', 'Malabar Bold Black Peppercorns', 'Raw Spices', 299.00, 365.00, '150 g', 50, 4.9, 39, 'Grade TGSEB', '/images/products/black-pepper-whole.webp', 'Large-berried Tellicherry black pepper with punchy heat.', 'JAP-SKU-024');

-- Coupons Seed
INSERT IGNORE INTO `coupons` (`id`, `code`, `title`, `description`, `type`, `discount`, `min_cart`, `max_discount`, `start_date`, `expiry_date`, `uses`, `max_uses`, `per_user_limit`, `active`) VALUES
('coup-1', 'JANANI10', '10% Off Storewide', 'Save 10% on your entire basket of organic essentials', 'percentage', 10.00, 499.00, 200.00, '2026-01-01', '2026-12-31', 142, 1000, 1, 1),
('coup-2', 'HARVEST15', '15% Harvest Fest Savings', '15% off orders above ₹999 on cold pressed oils and pulses', 'percentage', 15.00, 999.00, 350.00, '2026-01-01', '2026-12-31', 88, 500, 1, 1),
('coup-3', 'FREESHIP', 'Free Priority Delivery', 'Complimentary delivery anywhere in India on orders ₹499+', 'percentage', 0.00, 499.00, 60.00, '2026-01-01', '2026-12-31', 110, 2000, 2, 1),
('coup-4', 'BILONA20', 'Flat 20% on Desi Ghee', 'Exclusive discount on Vedic A2 Gir Cow Bilona Ghee', 'percentage', 20.00, 1200.00, 500.00, '2026-01-01', '2026-12-31', 64, 300, 1, 1);

-- Settings Seed
INSERT INTO `settings` (`setting_key`, `setting_value`) VALUES
('store_profile', '{"storeName":"Janani Agro Products","legalBusinessName":"Janani Agro Industries Private Limited","supportEmail":"care@jananiagro.com","supportPhone":"+91 98480 22338","storeAddress":"Plot No. 42-B, Lodhika GIDC Industrial Area, Metoda","city":"Rajkot","state":"Gujarat","pincode":"360021","country":"India","fssaiLicenseNo":"10722026000412","cinNumber":"U01111GJ2022PTC132890","gstin":"29AABCI9928P1Z8","defaultCurrency":"INR (₹)","defaultTimezone":"Asia/Kolkata (IST)","weightUnit":"kg / g","dimensionsUnit":"cm","orderIdPrefix":"JAP-","orderIdPadding":6,"maintenanceMode":false,"operatingHours":"Monday – Saturday: 9:00 AM – 7:00 PM IST"}'),
('shipping_rules', '{"defaultWarehouse":"Lodhika GIDC Central Facility","courier":"Delhivery Air Express","freeDeliveryThreshold":799,"standardDeliveryFee":60}')
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

-- Users Seed
INSERT IGNORE INTO `users` (`id`, `name`, `email`, `phone`, `role`, `wallet_balance`, `loyalty_points`, `tier`, `status`, `referral_code`) VALUES
('ADMIN-ROOT', 'Janani Admin (Root)', 'jananibiosciences.r@gmail.com', '+91 98480 22338', 'Super Admin', 10000.00, 5000, 'Platinum Root Access', 'Active', 'JANANIROOT'),
('STAFF-001', 'Rajesh Varma', 'admin@jananiagro.com', '+91 98480 22338', 'Super Admin', 250.00, 500, 'Platinum', 'Active', 'JANANI8492'),
('CUST-001', 'Dr. Ananya Iyer', 'dr.ananya@heritagehealth.org', '+91 98450 11223', 'Customer', 420.00, 850, 'Gold', 'Active', 'JANANI3821'),
('CUST-002', 'Vikramaditya Rao', 'vikram.rao@technocorp.in', '+91 99800 44556', 'Customer', 150.00, 320, 'Silver', 'Active', 'JANANI9104');

-- Orders Seed
INSERT IGNORE INTO `orders` (`id`, `number`, `order_date`, `customer_name`, `customer_email`, `customer_phone`, `shipping_address`, `items`, `subtotal`, `discount`, `delivery_fee`, `total`, `payment_method`, `payment_status`, `order_status`, `courier`, `tracking_id`, `awb`) VALUES
('JAP-849201', 'JAP-849201', '11 Sep 2026, 14:20', 'Rajesh Varma', 'rajesh.varma@gmail.com', '+91 98480 22338', '{"city":"Bengaluru","name":"Rajesh Varma","state":"Karnataka","street":"Flat 402, Green Palms, Indiranagar","pincode":"560038"}', '[{"price":1850,"title":"Wood Pressed Groundnut Oil (5L)","subtotal":1850,"quantity":1,"productId":1}]', 2450.00, 245.00, 0.00, 2205.00, 'UPI Instant', 'Paid', 'Delivered', 'Delhivery Air Express', 'DEL-8492048194', 'DEL-8492048194'),
('JAP-849202', 'JAP-849202', '10 Sep 2026, 18:45', 'Dr. Ananya Iyer', 'dr.ananya@heritagehealth.org', '+91 98450 11223', '{"city":"Bengaluru","name":"Dr. Ananya Iyer","state":"Karnataka","street":"Villa 14, Palm Meadows, Whitefield","pincode":"560066"}', '[{"price":1200,"title":"Royal Aged Basmati Rice (5kg)","subtotal":2400,"quantity":2,"productId":4}]', 3890.00, 583.00, 0.00, 3307.00, 'Razorpay (Credit Card)', 'Paid', 'In Transit', 'Delhivery Air Express', 'DEL-8492048195', 'DEL-8492048195');

COMMIT;
SET FOREIGN_KEY_CHECKS = 1;
