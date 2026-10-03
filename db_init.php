<?php
/**
 * JANANI AGRO PRODUCTS - AUTOMATED DATABASE & COLUMN MIGRATION ENGINE
 * Self-healing schema engine:
 * 1. Checks every table: auto-creates if missing.
 * 2. Checks every column in every table: auto-adds missing columns (ALTER TABLE ADD COLUMN)
 *    so any future schema additions for client requirements are applied automatically!
 * 3. Auto-seeds default products, categories, coupons, settings, users, and orders if empty.
 * Runs natively on Hostinger Shared Hosting (Apache/LiteSpeed + MySQL).
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ---------------------------------------------------------
// ENVIRONMENT CONFIGURATION (.env reader with safe fallbacks)
// ---------------------------------------------------------
$envFile = __DIR__ . '/.env';
if (!file_exists($envFile)) {
    $envFile = dirname(__DIR__) . '/.env';
}
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        if (strpos($line, '=') !== false) {
            list($name, $value) = explode('=', $line, 2);
            $name = trim($name);
            $value = trim($value, " \t\n\r\0\x0B\"'");
            putenv("{$name}={$value}");
            $_ENV[$name] = $value;
        }
    }
}

$raw_host = strtolower(trim(getenv('DB_HOST') ?: 'localhost'));
$raw_db   = trim(getenv('DB_NAME') ?: 'u409810820_Jananiagro');
$raw_user = trim(getenv('DB_USER') ?: 'u409810820_Jananiagropro');
$raw_pass = trim(getenv('DB_PASSWORD') ?: 'Jananiagro@123');

// On Hostinger Linux/CageFS, MySQL MUST connect via unix domain socket (lowercase 'localhost').
// Never use 127.0.0.1 or uppercase HOST which attempts TCP connect and throws 'Operation not permitted'.
$hosts  = ['localhost'];
$dbs    = array_values(array_unique([$raw_db, 'u409810820_Jananiagro', 'u409810820_jananiagro', strtolower($raw_db)]));
$users  = array_values(array_unique([$raw_user, 'u409810820_Jananiagropro', 'u409810820_jananiagropro', strtolower($raw_user)]));
$passes = array_values(array_unique([$raw_pass, 'Jananiagro@123', 'JANANIAGRO@123']));

$pdo = null;
$connectedDb = $raw_db;
$lastError = null;

foreach ($hosts as $h) {
    foreach ($dbs as $db) {
        foreach ($users as $u) {
            foreach ($passes as $p) {
                try {
                    $pdo = new PDO("mysql:host={$h};dbname={$db};charset=utf8mb4", $u, $p, [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                        PDO::ATTR_EMULATE_PREPARES => false
                    ]);
                    $connectedDb = $db;
                    break 4;
                } catch (PDOException $e) {
                    $lastError = $e;
                }
            }
        }
    }
}

if (!$pdo) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database connection failed: ' . ($lastError ? $lastError->getMessage() : 'Unknown error'),
        'hint' => 'Please verify database name and credentials in Hostinger hPanel.'
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    exit;
}

$response = [
    'success' => false,
    'database' => $connectedDb,
    'tables_created' => [],
    'columns_verified' => 0,
    'columns_added' => [],
    'seeds_inserted' => [],
    'errors' => []
];

// ---------------------------------------------------------
// SCHEMA DEFINITIONS (Tables & Column Definitions)
// Any new column added here in future will be auto-migrated!
// ---------------------------------------------------------
$schema = [
    'users' => [
        'columns' => [
            'id' => 'VARCHAR(64) PRIMARY KEY',
            'name' => 'VARCHAR(255) NOT NULL',
            'email' => 'VARCHAR(255) UNIQUE NOT NULL',
            'phone' => 'VARCHAR(50) DEFAULT NULL',
            'password' => 'VARCHAR(255) DEFAULT NULL',
            'role' => "VARCHAR(50) DEFAULT 'Customer'",
            'wallet_balance' => 'DECIMAL(10,2) DEFAULT 0.00',
            'loyalty_points' => 'INT DEFAULT 0',
            'tier' => "VARCHAR(50) DEFAULT 'Silver'",
            'status' => "VARCHAR(50) DEFAULT 'Active'",
            'referral_code' => 'VARCHAR(50) DEFAULT NULL',
            'is_verified' => 'TINYINT(1) DEFAULT 1',
            'avatar' => 'VARCHAR(500) DEFAULT NULL',
            'preferences' => 'JSON DEFAULT NULL',
            'created_at' => 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
            'updated_at' => 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
        ]
    ],

    'categories' => [
        'columns' => [
            'id' => 'VARCHAR(64) PRIMARY KEY',
            'name' => 'VARCHAR(255) NOT NULL',
            'slug' => 'VARCHAR(255) UNIQUE NOT NULL',
            'level' => 'INT DEFAULT 1',
            'parent_id' => 'VARCHAR(64) NULL',
            'parent_name' => 'VARCHAR(255) NULL',
            'image' => 'VARCHAR(500) DEFAULT NULL',
            'product_count' => 'INT DEFAULT 0',
            'active' => 'TINYINT(1) DEFAULT 1',
            'featured' => 'TINYINT(1) DEFAULT 0',
            'trending' => 'TINYINT(1) DEFAULT 0',
            'display_order' => 'INT DEFAULT 0',
            'description' => 'TEXT DEFAULT NULL',
            'created_at' => 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
            'updated_at' => 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
            'deleted_at' => 'TIMESTAMP NULL DEFAULT NULL'
        ]
    ],

    'products' => [
        'columns' => [
            'id' => 'INT AUTO_INCREMENT PRIMARY KEY',
            'slug' => 'VARCHAR(255) UNIQUE NOT NULL',
            'name' => 'VARCHAR(255) NOT NULL',
            'category_name' => 'VARCHAR(255) NOT NULL',
            'category_id' => 'VARCHAR(64) DEFAULT NULL',
            'price' => 'DECIMAL(10,2) NOT NULL',
            'old_price' => 'DECIMAL(10,2) DEFAULT NULL',
            'cost_price' => 'DECIMAL(10,2) DEFAULT NULL',
            'unit' => "VARCHAR(50) DEFAULT '1 kg'",
            'stock' => 'INT DEFAULT 50',
            'low_stock_threshold' => 'INT DEFAULT 10',
            'rating' => 'DECIMAL(2,1) DEFAULT 4.8',
            'reviews_count' => 'INT DEFAULT 0',
            'badge' => 'VARCHAR(100) DEFAULT NULL',
            'image' => 'VARCHAR(500) DEFAULT NULL',
            'gallery' => 'JSON DEFAULT NULL',
            'description' => 'TEXT DEFAULT NULL',
            'features' => 'JSON DEFAULT NULL',
            'nutrition_facts' => 'JSON DEFAULT NULL',
            'origin' => "VARCHAR(255) DEFAULT 'Lodhika GIDC, Gujarat'",
            'certification' => "VARCHAR(255) DEFAULT 'Certified Organic & NPOP Verified'",
            'hsn_code' => 'VARCHAR(50) DEFAULT NULL',
            'tax_rate' => 'DECIMAL(5,2) DEFAULT 0.00',
            'active' => 'TINYINT(1) DEFAULT 1',
            'status' => "VARCHAR(50) DEFAULT 'Active'",
            'sku' => 'VARCHAR(100) DEFAULT NULL',
            'tags' => 'JSON DEFAULT NULL',
            'created_at' => 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
            'updated_at' => 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
        ]
    ],

    'orders' => [
        'columns' => [
            'id' => 'VARCHAR(64) PRIMARY KEY',
            'number' => 'VARCHAR(64) UNIQUE NOT NULL',
            'order_date' => 'VARCHAR(100) DEFAULT NULL',
            'customer_id' => 'VARCHAR(64) DEFAULT NULL',
            'customer_name' => 'VARCHAR(255) DEFAULT NULL',
            'customer_email' => 'VARCHAR(255) DEFAULT NULL',
            'customer_phone' => 'VARCHAR(50) DEFAULT NULL',
            'shipping_address' => 'JSON DEFAULT NULL',
            'billing_address' => 'JSON DEFAULT NULL',
            'items' => 'JSON DEFAULT NULL',
            'subtotal' => 'DECIMAL(10,2) DEFAULT 0.00',
            'discount' => 'DECIMAL(10,2) DEFAULT 0.00',
            'delivery_fee' => 'DECIMAL(10,2) DEFAULT 0.00',
            'tax_amount' => 'DECIMAL(10,2) DEFAULT 0.00',
            'total' => 'DECIMAL(10,2) NOT NULL',
            'payment_method' => "VARCHAR(100) DEFAULT 'UPI / Online'",
            'payment_status' => "VARCHAR(50) DEFAULT 'Paid'",
            'order_status' => "VARCHAR(50) DEFAULT 'Processing'",
            'courier' => "VARCHAR(100) DEFAULT 'Delhivery Air Express'",
            'tracking_id' => 'VARCHAR(100) DEFAULT NULL',
            'awb' => 'VARCHAR(100) DEFAULT NULL',
            'warehouse' => "VARCHAR(255) DEFAULT 'Lodhika GIDC Central Facility'",
            'delivery_slot' => 'VARCHAR(100) DEFAULT NULL',
            'customer_notes' => 'TEXT DEFAULT NULL',
            'timeline' => 'JSON DEFAULT NULL',
            'created_at' => 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
            'updated_at' => 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
        ]
    ],

    'coupons' => [
        'columns' => [
            'id' => 'VARCHAR(64) PRIMARY KEY',
            'code' => 'VARCHAR(50) UNIQUE NOT NULL',
            'title' => 'VARCHAR(255) NOT NULL',
            'description' => 'TEXT DEFAULT NULL',
            'type' => "VARCHAR(50) DEFAULT 'percentage'",
            'discount' => 'DECIMAL(10,2) NOT NULL',
            'min_cart' => 'DECIMAL(10,2) DEFAULT 0.00',
            'max_discount' => 'DECIMAL(10,2) DEFAULT 0.00',
            'start_date' => 'DATE DEFAULT NULL',
            'expiry_date' => 'DATE DEFAULT NULL',
            'uses' => 'INT DEFAULT 0',
            'max_uses' => 'INT DEFAULT 1000',
            'per_user_limit' => 'INT DEFAULT 1',
            'is_first_order_only' => 'TINYINT(1) DEFAULT 0',
            'is_free_shipping' => 'TINYINT(1) DEFAULT 0',
            'user_specific_tier' => "VARCHAR(50) DEFAULT 'All'",
            'active' => 'TINYINT(1) DEFAULT 1',
            'created_at' => 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
            'updated_at' => 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
        ]
    ],

    'settings' => [
        'columns' => [
            'id' => 'INT AUTO_INCREMENT PRIMARY KEY',
            'setting_key' => 'VARCHAR(100) UNIQUE NOT NULL',
            'setting_value' => 'JSON NOT NULL',
            'updated_at' => 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
        ]
    ],

    'reviews' => [
        'columns' => [
            'id' => 'VARCHAR(64) PRIMARY KEY',
            'product_id' => 'VARCHAR(64) NOT NULL',
            'product_name' => 'VARCHAR(255) NOT NULL',
            'customer_id' => 'VARCHAR(64) DEFAULT NULL',
            'customer_name' => 'VARCHAR(255) NOT NULL',
            'customer_email' => 'VARCHAR(255) DEFAULT NULL',
            'rating' => 'INT DEFAULT 5',
            'title' => 'VARCHAR(255) DEFAULT NULL',
            'comment' => 'TEXT DEFAULT NULL',
            'verified_purchase' => 'TINYINT(1) DEFAULT 1',
            'status' => "VARCHAR(50) DEFAULT 'Approved'",
            'helpful_count' => 'INT DEFAULT 0',
            'created_at' => 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
        ]
    ],

    'cms_banners' => [
        'columns' => [
            'id' => 'VARCHAR(64) PRIMARY KEY',
            'type' => "VARCHAR(50) DEFAULT 'hero'",
            'title' => 'VARCHAR(255) NOT NULL',
            'subtitle' => 'VARCHAR(255) DEFAULT NULL',
            'image_url' => 'VARCHAR(500) DEFAULT NULL',
            'cta_label' => 'VARCHAR(100) DEFAULT NULL',
            'cta_url' => 'VARCHAR(255) DEFAULT NULL',
            'badge' => 'VARCHAR(100) DEFAULT NULL',
            'slide_order' => 'INT DEFAULT 1',
            'active' => 'TINYINT(1) DEFAULT 1',
            'created_at' => 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
        ]
    ],

    'payments' => [
        'columns' => [
            'id' => 'VARCHAR(64) PRIMARY KEY',
            'order_id' => 'VARCHAR(64) NOT NULL',
            'customer_name' => 'VARCHAR(255) DEFAULT NULL',
            'customer_email' => 'VARCHAR(255) DEFAULT NULL',
            'gateway' => "VARCHAR(50) DEFAULT 'Razorpay'",
            'method' => "VARCHAR(50) DEFAULT 'UPI'",
            'gross_amount' => 'DECIMAL(10,2) NOT NULL',
            'gateway_fee' => 'DECIMAL(10,2) DEFAULT 0.00',
            'net_settled_amount' => 'DECIMAL(10,2) NOT NULL',
            'currency' => "VARCHAR(10) DEFAULT 'INR'",
            'status' => "VARCHAR(50) DEFAULT 'Captured'",
            'refunded_amount' => 'DECIMAL(10,2) DEFAULT 0.00',
            'bank_utr' => 'VARCHAR(100) DEFAULT NULL',
            'created_at' => 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
        ]
    ],

    'inquiries' => [
        'columns' => [
            'id' => 'INT AUTO_INCREMENT PRIMARY KEY',
            'name' => 'VARCHAR(255) NOT NULL',
            'business_name' => 'VARCHAR(255) DEFAULT NULL',
            'service' => 'VARCHAR(100) DEFAULT NULL',
            'email' => 'VARCHAR(255) NOT NULL',
            'phone' => 'VARCHAR(50) NOT NULL',
            'quantity' => 'VARCHAR(100) DEFAULT NULL',
            'message' => 'TEXT DEFAULT NULL',
            'status' => "VARCHAR(50) DEFAULT 'New'",
            'created_at' => 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
        ]
    ],

    'activity_logs' => [
        'columns' => [
            'id' => 'VARCHAR(64) PRIMARY KEY',
            'actor_name' => 'VARCHAR(255) DEFAULT NULL',
            'actor_email' => 'VARCHAR(255) DEFAULT NULL',
            'actor_role' => 'VARCHAR(100) DEFAULT NULL',
            'action' => 'VARCHAR(255) DEFAULT NULL',
            'module' => 'VARCHAR(100) DEFAULT NULL',
            'severity' => "VARCHAR(50) DEFAULT 'low'",
            'ip_address' => 'VARCHAR(50) DEFAULT NULL',
            'created_at' => 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
        ]
    ],

    'newsletter_subscribers' => [
        'columns' => [
            'id' => 'INT AUTO_INCREMENT PRIMARY KEY',
            'email' => 'VARCHAR(255) UNIQUE NOT NULL',
            'source' => "VARCHAR(100) DEFAULT 'website_footer'",
            'status' => "VARCHAR(50) DEFAULT 'Subscribed'",
            'created_at' => 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
        ]
    ],

    'pickup_locations' => [
        'columns' => [
            'id' => 'VARCHAR(64) PRIMARY KEY',
            'name' => 'VARCHAR(255) NOT NULL',
            'address' => 'TEXT NOT NULL',
            'city' => 'VARCHAR(100) NOT NULL',
            'state' => 'VARCHAR(100) NOT NULL',
            'pincode' => 'VARCHAR(20) NOT NULL',
            'phone' => 'VARCHAR(50) NOT NULL',
            'email' => 'VARCHAR(255) DEFAULT NULL',
            'is_default' => 'TINYINT(1) DEFAULT 0',
            'active' => 'TINYINT(1) DEFAULT 1',
            'created_at' => 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
        ]
    ]
];

// ---------------------------------------------------------
// DYNAMIC TABLE & COLUMN MIGRATION ENGINE
// ---------------------------------------------------------
foreach ($schema as $tableName => $tableMeta) {
    try {
        // Step 1: Check if table exists
        $checkTable = $pdo->query("SHOW TABLES LIKE '{$tableName}'")->fetch();

        if (!$checkTable) {
            // Table doesn't exist -> Create it with full column set
            $colDefs = [];
            foreach ($tableMeta['columns'] as $colName => $colDef) {
                $colDefs[] = "`{$colName}` {$colDef}";
            }
            $createSql = "CREATE TABLE IF NOT EXISTS `{$tableName}` (" . implode(", ", $colDefs) . ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";
            $pdo->exec($createSql);
            $response['tables_created'][] = $tableName;
        } else {
            // Table exists -> Check individual columns and auto-add any missing ones!
            $existingCols = [];
            $colsQuery = $pdo->query("SHOW COLUMNS FROM `{$tableName}`");
            while ($c = $colsQuery->fetch()) {
                $existingCols[] = strtolower($c['Field']);
            }

            foreach ($tableMeta['columns'] as $colName => $colDef) {
                $response['columns_verified']++;
                if (!in_array(strtolower($colName), $existingCols)) {
                    // Column is missing! Run ALTER TABLE to add it dynamically!
                    // If it's a PRIMARY KEY or AUTO_INCREMENT column on existing table, strip for safe addition
                    $cleanDef = preg_replace('/(PRIMARY KEY|AUTO_INCREMENT)/i', '', $colDef);
                    $alterSql = "ALTER TABLE `{$tableName}` ADD COLUMN `{$colName}` {$cleanDef}";
                    $pdo->exec($alterSql);
                    $response['columns_added'][] = "{$tableName}.{$colName}";
                }
            }
        }
    } catch (PDOException $e) {
        $response['errors'][] = "Schema error on {$tableName}: " . $e->getMessage();
    }
}

// ---------------------------------------------------------
// AUTO-SEEDING JANANI AGRO DATA (If Tables are Empty)
// ---------------------------------------------------------

// 1. Categories - Janani Agro Certified Biologicals
$legacyCatSlugs = ['cold-pressed-oils', 'organic-rice', 'pulses', 'spices', 'wheat', 'millets', 'seeds', 'flours', 'dry-fruits', 'organic-fertilizers', 'vedic-ghee'];
$inCat = "'" . implode("','", $legacyCatSlugs) . "'";
try {
    $pdo->exec("DELETE FROM `categories` WHERE `slug` IN ({$inCat}) OR `id` LIKE 'cat-sub-%'");
} catch (Exception $e) {}

$categories = [
    ['cat-crop-protection', 'Biological Crop Protection', 'biological-crop-protection', 1, null, null, '/products/balavan.jpg', 4, 1, 1, 1, 1, 'Beneficial Trichoderma viride, Bacillus subtilis, Pseudomonas fluorescens, and cold-pressed Azadirachtin botanical formulations for disease management, pest control, root protection, and pathogen suppression.'],
    ['cat-plant-nutrients', 'Organic Plant Nutrients', 'organic-plant-nutrients', 1, null, null, '/products/annada.jpg', 2, 1, 1, 1, 2, 'Cold-hydrolysed marine fish amino acids and seaweed-based organic biostimulants rich in organic nitrogen, polypeptides, and trace minerals for robust vegetative growth, flowering, and fruit development.'],
    ['cat-soil-conditioners', 'Soil Conditioners & Biostimulants', 'soil-conditioners-biostimulants', 1, null, null, '/products/bhumi-shakti.jpg', 2, 1, 1, 1, 3, 'Potassium humate, concentrated fulvic extracts, and beneficial potassium-mobilizing bacteria (KMB) to improve soil aggregation, CEC, microbial flora, and nutrient bio-availability.']
];

$stmtCat = $pdo->prepare("INSERT INTO `categories` (`id`, `name`, `slug`, `level`, `parent_id`, `parent_name`, `image`, `product_count`, `active`, `featured`, `trending`, `display_order`, `description`) 
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
ON DUPLICATE KEY UPDATE 
    `name` = VALUES(`name`), 
    `image` = VALUES(`image`), 
    `product_count` = VALUES(`product_count`), 
    `active` = 1, 
    `description` = VALUES(`description`)");

foreach ($categories as $cat) {
    $stmtCat->execute($cat);
}
$response['seeds_inserted'][] = 'categories (3)';

// 2. Products - Janani Agro Flagship Formulations (8 Genuine Products)
$validProductSlugs = [
    'balavan-bacillus-subtilis-5l',
    'suraksha-pseudomonas-fluorescens-5l',
    'harit-trichoderma-viride-liquid-biofungal-formulation-1l',
    'neem-oil-1000-ppm-azadirachtin-1l',
    'annada-fish-amino-acid-5l',
    'pushkal-flowering-fruit-set-biostimulant-1l',
    'bhumi-shakti-humic-fulvic-biostimulant-5l',
    'dharani-kmb-potassium-mobilizing-biofertilizer-5l'
];
$inProds = "'" . implode("','", $validProductSlugs) . "'";
try {
    // Remove all old legacy demo grocery products
    $pdo->exec("DELETE FROM `products` WHERE `slug` NOT IN ({$inProds})");
} catch (Exception $e) {}

$products = [
    ['balavan-bacillus-subtilis-5l', 'BALAVAN - Bacillus Subtilis (5L)', 'Biological Crop Protection', 5600.00, 6200.00, '5 L', 120, 5.0, 52, 'Flagship Bio-Shield', '/products/balavan.jpg', 'Beneficial Bacillus subtilis liquid biological formulation for blight control, fungal disease suppression, and systemic acquired resistance across all commercial crops.', 'JAP-SKU-BALAVAN'],
    ['suraksha-pseudomonas-fluorescens-5l', 'SURAKSHA - Pseudomonas Fluorescens (5L)', 'Biological Crop Protection', 4900.00, 5500.00, '5 L', 110, 4.9, 63, 'Root Defender', '/products/suraksha.jpg', 'High-potency Pseudomonas fluorescens liquid bio-fungal formulation for soil-borne pathogen control, root wilt prevention, and rhizosphere colonization.', 'JAP-SKU-SURAKSHA'],
    ['harit-trichoderma-viride-liquid-biofungal-formulation-1l', 'HARIT - Trichoderma Viride Liquid Biofungal Formulation (1L)', 'Biological Crop Protection', 950.00, 1100.00, '1 L', 120, 5.0, 39, 'Bio-Fungal Shield', '/products/harit.jpg', 'Trichoderma viride liquid biofungal formulation for suppression of wilt, damping-off, root rot, collar rot, and rhizosphere diseases.', 'JAP-SKU-HARIT'],
    ['neem-oil-1000-ppm-azadirachtin-1l', 'NEEM OIL 1000 PPM - Botanical Insecticide & Mite Control (1L)', 'Biological Crop Protection', 599.00, 699.00, '1 L', 140, 4.9, 44, 'Botanical IPM', '/products/neem-oil.jpg', 'Cold-pressed neem-oil-based botanical formulation containing standardized Azadirachtin 1000 PPM for organic management of aphids, whiteflies, thrips, caterpillars, and mites.', 'JAP-SKU-NEEM1000'],
    ['annada-fish-amino-acid-5l', 'ANNADA - Fish Amino Acid (5L)', 'Organic Plant Nutrients', 3600.00, 3999.00, '5 L', 150, 5.0, 64, 'Flagship Nutrient', '/products/annada.jpg', 'Naturally derived cold-hydrolysed Fish Amino Acid formulation rich in natural L-amino acids and peptides for vigorous vegetative growth, chlorophyll synthesis, and stress tolerance.', 'JAP-SKU-ANNADA'],
    ['pushkal-flowering-fruit-set-biostimulant-1l', 'PUSHKAL - Flowering & Fruit Set Biostimulant (1L)', 'Organic Plant Nutrients', 999.00, 1199.00, '1 L', 150, 5.0, 42, 'Flowering & Fruit Set', '/products/pushkal.jpg', 'Concentrated crop biostimulant formulated with 10% Free Amino Acids, 10% Seaweed Extract, Fulvic Acid, Boron, and Zinc to support flower initiation, prevent flower drop, and boost fruit set.', 'JAP-SKU-PUSHKAL'],
    ['bhumi-shakti-humic-fulvic-biostimulant-5l', 'BHUMI SHAKTI - Humic & Fulvic Biostimulant (5L)', 'Soil Conditioners & Biostimulants', 3900.00, 4400.00, '5 L', 120, 4.9, 58, 'Soil Rejuvenator', '/products/bhumi-shakti.jpg', 'High-purity potassium humate and fulvic acid complex for improving soil structure, cation exchange capacity, microbial life, and root nutrient absorption.', 'JAP-SKU-BHUMISHAKTI'],
    ['dharani-kmb-potassium-mobilizing-biofertilizer-5l', 'DHARANI KMB - Potassium Mobilizing Biofertilizer (5L)', 'Soil Conditioners & Biostimulants', 5300.00, 5800.00, '5 L', 100, 5.0, 48, 'Potassium Mobilizer', '/products/dharani.jpg', 'Liquid biofertilizer containing beneficial Potassium Mobilizing Bacteria (Frateuria aurantia) to solubilize and unlock fixed soil potassium into plant-available form.', 'JAP-SKU-DHARANI']
];

$stmtProd = $pdo->prepare("INSERT INTO `products` (`slug`, `name`, `category_name`, `price`, `old_price`, `unit`, `stock`, `rating`, `reviews_count`, `badge`, `image`, `description`, `sku`, `active`, `status`) 
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'Active')
ON DUPLICATE KEY UPDATE 
    `name` = VALUES(`name`), 
    `category_name` = VALUES(`category_name`), 
    `price` = VALUES(`price`), 
    `old_price` = VALUES(`old_price`), 
    `unit` = VALUES(`unit`), 
    `image` = VALUES(`image`), 
    `description` = VALUES(`description`), 
    `badge` = VALUES(`badge`), 
    `active` = 1, 
    `status` = 'Active'");

foreach ($products as $prod) {
    $stmtProd->execute($prod);
}
$response['seeds_inserted'][] = 'products (8)';

// 3. Coupons
$coupCount = $pdo->query("SELECT COUNT(*) FROM `coupons`")->fetchColumn();
if ($coupCount == 0) {
    $coupons = [
        ['coup-1', 'JANANI10', '10% Off Storewide', 'Save 10% on your entire basket of organic essentials', 'percentage', 10.00, 499.00, 200.00, '2026-01-01', '2026-12-31', 142, 1000, 1, 1],
        ['coup-2', 'HARVEST15', '15% Harvest Fest Savings', '15% off orders above ₹999 on cold pressed oils and pulses', 'percentage', 15.00, 999.00, 350.00, '2026-01-01', '2026-12-31', 88, 500, 1, 1],
        ['coup-3', 'FREESHIP', 'Free Priority Delivery', 'Complimentary delivery anywhere in India on orders ₹499+', 'percentage', 0.00, 499.00, 60.00, '2026-01-01', '2026-12-31', 110, 2000, 2, 1],
        ['coup-4', 'BILONA20', 'Flat 20% on Desi Ghee', 'Exclusive discount on Vedic A2 Gir Cow Bilona Ghee', 'percentage', 20.00, 1200.00, 500.00, '2026-01-01', '2026-12-31', 64, 300, 1, 1]
    ];
    $stmt = $pdo->prepare("INSERT IGNORE INTO `coupons` (`id`, `code`, `title`, `description`, `type`, `discount`, `min_cart`, `max_discount`, `start_date`, `expiry_date`, `uses`, `max_uses`, `per_user_limit`, `active`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    foreach ($coupons as $c) {
        $stmt->execute($c);
    }
    $response['seeds_inserted'][] = 'coupons (4)';
}

// 4. Settings
$setCount = $pdo->query("SELECT COUNT(*) FROM `settings`")->fetchColumn();
if ($setCount == 0) {
    $storeSettings = json_encode([
        'storeName' => 'Janani Agro Products',
        'legalBusinessName' => 'Janani Agro Industries Private Limited',
        'supportEmail' => 'care@jananiagro.com',
        'supportPhone' => '+91 98480 22338',
        'storeAddress' => 'Plot No. 42-B, Lodhika GIDC Industrial Area, Metoda',
        'city' => 'Rajkot',
        'state' => 'Gujarat',
        'pincode' => '360021',
        'country' => 'India',
        'fssaiLicenseNo' => '10722026000412',
        'cinNumber' => 'U01111GJ2022PTC132890',
        'gstin' => '29AABCI9928P1Z8',
        'defaultCurrency' => 'INR (₹)',
        'defaultTimezone' => 'Asia/Kolkata (IST)',
        'weightUnit' => 'kg / g',
        'dimensionsUnit' => 'cm',
        'orderIdPrefix' => 'JAP-',
        'orderIdPadding' => 6,
        'maintenanceMode' => false,
        'operatingHours' => 'Monday – Saturday: 9:00 AM – 7:00 PM IST'
    ]);
    $stmt = $pdo->prepare("INSERT INTO `settings` (`setting_key`, `setting_value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`)");
    $stmt->execute(['store_profile', $storeSettings]);
    $response['seeds_inserted'][] = 'settings';
}

// 5. Users & Root Super Admin
$rootAdminEmail = getenv('ADMIN_EMAIL') ?: 'jananibiosciences.r@gmail.com';
try {
    $adminStmt = $pdo->prepare("INSERT INTO `users` (`id`, `name`, `email`, `phone`, `role`, `wallet_balance`, `loyalty_points`, `tier`, `status`, `referral_code`) 
        VALUES ('ADMIN-ROOT', 'Janani Admin (Root)', ?, '+91 98480 22338', 'Super Admin', 10000.00, 5000, 'Platinum Root Access', 'Active', 'JANANIROOT') 
        ON DUPLICATE KEY UPDATE `role` = 'Super Admin', `status` = 'Active', `tier` = 'Platinum Root Access'");
    $adminStmt->execute([$rootAdminEmail]);
    $response['seeds_inserted'][] = 'root_admin (' . $rootAdminEmail . ')';
} catch (PDOException $e) {}

$userCount = $pdo->query("SELECT COUNT(*) FROM `users`")->fetchColumn();
if ($userCount <= 1) {
    $users = [
        ['STAFF-001', 'Rajesh Varma', 'admin@jananiagro.com', '+91 98480 22338', 'Super Admin', 250.00, 500, 'Platinum', 'Active', 'JANANI8492'],
        ['CUST-001', 'Dr. Ananya Iyer', 'dr.ananya@heritagehealth.org', '+91 98450 11223', 'Customer', 420.00, 850, 'Gold', 'Active', 'JANANI3821'],
        ['CUST-002', 'Vikramaditya Rao', 'vikram.rao@technocorp.in', '+91 99800 44556', 'Customer', 150.00, 320, 'Silver', 'Active', 'JANANI9104']
    ];
    $stmt = $pdo->prepare("INSERT IGNORE INTO `users` (`id`, `name`, `email`, `phone`, `role`, `wallet_balance`, `loyalty_points`, `tier`, `status`, `referral_code`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    foreach ($users as $u) {
        $stmt->execute($u);
    }
    $response['seeds_inserted'][] = 'users (3)';
}

// 6. Orders
$orderCount = $pdo->query("SELECT COUNT(*) FROM `orders`")->fetchColumn();
if ($orderCount == 0) {
    $orders = [
        [
            'JAP-849201', 'JAP-849201', '11 Sep 2026, 14:20', 'Rajesh Varma', 'rajesh.varma@gmail.com', '+91 98480 22338',
            json_encode(['name' => 'Rajesh Varma', 'street' => 'Flat 402, Green Palms, Indiranagar', 'city' => 'Bengaluru', 'state' => 'Karnataka', 'pincode' => '560038']),
            json_encode([['productId' => 1, 'title' => 'Wood Pressed Groundnut Oil (5L)', 'price' => 1850, 'quantity' => 1, 'subtotal' => 1850]]),
            2450.00, 245.00, 0.00, 2205.00, 'UPI Instant', 'Paid', 'Delivered', 'Delhivery Air Express', 'DEL-8492048194', 'DEL-8492048194'
        ],
        [
            'JAP-849202', 'JAP-849202', '10 Sep 2026, 18:45', 'Dr. Ananya Iyer', 'dr.ananya@heritagehealth.org', '+91 98450 11223',
            json_encode(['name' => 'Dr. Ananya Iyer', 'street' => 'Villa 14, Palm Meadows, Whitefield', 'city' => 'Bengaluru', 'state' => 'Karnataka', 'pincode' => '560066']),
            json_encode([['productId' => 4, 'title' => 'Royal Aged Basmati Rice (5kg)', 'price' => 1200, 'quantity' => 2, 'subtotal' => 2400]]),
            3890.00, 583.00, 0.00, 3307.00, 'Razorpay (Credit Card)', 'Paid', 'In Transit', 'Delhivery Air Express', 'DEL-8492048195', 'DEL-8492048195'
        ]
    ];
    $stmt = $pdo->prepare("INSERT IGNORE INTO `orders` (`id`, `number`, `order_date`, `customer_name`, `customer_email`, `customer_phone`, `shipping_address`, `items`, `subtotal`, `discount`, `delivery_fee`, `total`, `payment_method`, `payment_status`, `order_status`, `courier`, `tracking_id`, `awb`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    foreach ($orders as $o) {
        $stmt->execute($o);
    }
    $response['seeds_inserted'][] = 'orders (2)';
}

$response['success'] = count($response['errors']) === 0;
$response['message'] = $response['success'] 
    ? 'All tables and columns verified & auto-migrated successfully in MySQL database ' . $db_name . '!' 
    : 'Some errors occurred during table setup.';

echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
