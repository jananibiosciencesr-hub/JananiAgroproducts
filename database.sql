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

-- Categories Seed (Janani Agro Genuine Biological Inputs)
DELETE FROM `categories`;
INSERT INTO `categories` (`id`, `name`, `slug`, `level`, `parent_id`, `parent_name`, `image`, `product_count`, `active`, `featured`, `trending`, `display_order`, `description`) VALUES
('cat-crop-protection', 'Biological Crop Protection', 'biological-crop-protection', 1, NULL, NULL, '/products/balavan.jpg', 4, 1, 1, 1, 1, 'Beneficial Trichoderma viride, Bacillus subtilis, Pseudomonas fluorescens, and cold-pressed Azadirachtin botanical formulations for disease management, pest control, root protection, and pathogen suppression.'),
('cat-plant-nutrients', 'Organic Plant Nutrients', 'organic-plant-nutrients', 1, NULL, NULL, '/products/annada.jpg', 2, 1, 1, 1, 2, 'Cold-hydrolysed marine fish amino acids and seaweed-based organic biostimulants rich in organic nitrogen, polypeptides, and trace minerals for robust vegetative growth, flowering, and fruit development.'),
('cat-soil-conditioners', 'Soil Conditioners & Biostimulants', 'soil-conditioners-biostimulants', 1, NULL, NULL, '/products/bhumi-shakti.jpg', 2, 1, 1, 1, 3, 'Potassium humate, concentrated fulvic extracts, and beneficial potassium-mobilizing bacteria (KMB) to improve soil aggregation, CEC, microbial flora, and nutrient bio-availability.');

-- Products Seed (Janani Agro Flagship Biological Formulations)
DELETE FROM `products`;
INSERT INTO `products` (`slug`, `name`, `category_name`, `price`, `old_price`, `unit`, `stock`, `rating`, `reviews_count`, `badge`, `image`, `description`, `sku`, `active`, `status`) VALUES
('balavan-bacillus-subtilis-5l', 'BALAVAN - Bacillus Subtilis (5L)', 'Biological Crop Protection', 5600.00, 6200.00, '5 L', 120, 5.0, 52, 'Flagship Bio-Shield', '/products/balavan.jpg', 'Beneficial Bacillus subtilis liquid biological formulation for blight control, fungal disease suppression, and systemic acquired resistance across all commercial crops.', 'JAP-SKU-BALAVAN', 1, 'Active'),
('suraksha-pseudomonas-fluorescens-5l', 'SURAKSHA - Pseudomonas Fluorescens (5L)', 'Biological Crop Protection', 4900.00, 5500.00, '5 L', 110, 4.9, 63, 'Root Defender', '/products/suraksha.jpg', 'High-potency Pseudomonas fluorescens liquid bio-fungal formulation for soil-borne pathogen control, root wilt prevention, and rhizosphere colonization.', 'JAP-SKU-SURAKSHA', 1, 'Active'),
('harit-trichoderma-viride-liquid-biofungal-formulation-1l', 'HARIT - Trichoderma Viride Liquid Biofungal Formulation (1L)', 'Biological Crop Protection', 950.00, 1100.00, '1 L', 120, 5.0, 39, 'Bio-Fungal Shield', '/products/harit.jpg', 'Trichoderma viride liquid biofungal formulation for suppression of wilt, damping-off, root rot, collar rot, and rhizosphere diseases.', 'JAP-SKU-HARIT', 1, 'Active'),
('neem-oil-1000-ppm-azadirachtin-1l', 'NEEM OIL 1000 PPM - Botanical Insecticide & Mite Control (1L)', 'Biological Crop Protection', 599.00, 699.00, '1 L', 140, 4.9, 44, 'Botanical IPM', '/products/neem-oil.jpg', 'Cold-pressed neem-oil-based botanical formulation containing standardized Azadirachtin 1000 PPM for organic management of aphids, whiteflies, thrips, caterpillars, and mites.', 'JAP-SKU-NEEM1000', 1, 'Active'),
('annada-fish-amino-acid-5l', 'ANNADA - Fish Amino Acid (5L)', 'Organic Plant Nutrients', 3600.00, 3999.00, '5 L', 150, 5.0, 64, 'Flagship Nutrient', '/products/annada.jpg', 'Naturally derived cold-hydrolysed Fish Amino Acid formulation rich in natural L-amino acids and peptides for vigorous vegetative growth, chlorophyll synthesis, and stress tolerance.', 'JAP-SKU-ANNADA', 1, 'Active'),
('pushkal-flowering-fruit-set-biostimulant-1l', 'PUSHKAL - Flowering & Fruit Set Biostimulant (1L)', 'Organic Plant Nutrients', 999.00, 1199.00, '1 L', 150, 5.0, 42, 'Flowering & Fruit Set', '/products/pushkal.jpg', 'Concentrated crop biostimulant formulated with 10% Free Amino Acids, 10% Seaweed Extract, Fulvic Acid, Boron, and Zinc to support flower initiation, prevent flower drop, and boost fruit set.', 'JAP-SKU-PUSHKAL', 1, 'Active'),
('bhumi-shakti-humic-fulvic-biostimulant-5l', 'BHUMI SHAKTI - Humic & Fulvic Biostimulant (5L)', 'Soil Conditioners & Biostimulants', 3900.00, 4400.00, '5 L', 120, 4.9, 58, 'Soil Rejuvenator', '/products/bhumi-shakti.jpg', 'High-purity potassium humate and fulvic acid complex for improving soil structure, cation exchange capacity, microbial life, and root nutrient absorption.', 'JAP-SKU-BHUMISHAKTI', 1, 'Active'),
('dharani-kmb-potassium-mobilizing-biofertilizer-5l', 'DHARANI KMB - Potassium Mobilizing Biofertilizer (5L)', 'Soil Conditioners & Biostimulants', 5300.00, 5800.00, '5 L', 100, 5.0, 48, 'Potassium Mobilizer', '/products/dharani.jpg', 'Liquid biofertilizer containing beneficial Potassium Mobilizing Bacteria (Frateuria aurantia) to solubilize and unlock fixed soil potassium into plant-available form.', 'JAP-SKU-DHARANI', 1, 'Active');

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
