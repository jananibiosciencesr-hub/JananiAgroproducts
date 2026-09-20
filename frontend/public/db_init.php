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

// 1. Categories
$catCount = $pdo->query("SELECT COUNT(*) FROM `categories`")->fetchColumn();
if ($catCount == 0) {
    $categories = [
        ['cat-oils', 'Cold Pressed Oils', 'cold-pressed-oils', 1, null, null, '/images/categories/oils.webp', 4, 1, 1, 1, 1],
        ['cat-rice', 'Organic Rice', 'organic-rice', 1, null, null, '/images/categories/rice.webp', 3, 1, 1, 0, 2],
        ['cat-pulses', 'Pulses & Dals', 'pulses', 1, null, null, '/images/categories/pulses.webp', 3, 1, 1, 0, 3],
        ['cat-spices', 'Raw Spices', 'spices', 1, null, null, '/images/categories/spices.webp', 4, 1, 1, 1, 4],
        ['cat-wheat', 'Wheat & Grains', 'wheat', 1, null, null, '/images/categories/wheat.webp', 2, 1, 0, 0, 5],
        ['cat-millets', 'Ancient Millets', 'millets', 1, null, null, '/images/categories/millets.webp', 2, 1, 0, 1, 6],
        ['cat-seeds', 'Seeds & Superfoods', 'seeds', 1, null, null, '/images/categories/seeds.webp', 3, 1, 0, 0, 7],
        ['cat-flours', 'Stoneground Flours', 'flours', 1, null, null, '/images/categories/flours.webp', 2, 1, 0, 0, 8],
        ['cat-dryfruits', 'Dry Fruits & Sweeteners', 'dry-fruits', 1, null, null, '/images/categories/dryfruits.webp', 2, 1, 0, 0, 9],
        ['cat-fertilizers', 'Organic Fertilizers', 'organic-fertilizers', 1, null, null, '/images/categories/fertilizers.webp', 1, 1, 0, 0, 10]
    ];
    $stmt = $pdo->prepare("INSERT IGNORE INTO `categories` (`id`, `name`, `slug`, `level`, `parent_id`, `parent_name`, `image`, `product_count`, `active`, `featured`, `trending`, `display_order`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    foreach ($categories as $cat) {
        $stmt->execute($cat);
    }
    $response['seeds_inserted'][] = 'categories (10)';
}

// 2. Products (24 Organic SKUs)
$prodCount = $pdo->query("SELECT COUNT(*) FROM `products`")->fetchColumn();
if ($prodCount == 0) {
    $products = [
        ['wood-pressed-groundnut-oil', 'Wood Pressed Groundnut Oil', 'Cold Pressed Oils', 399.00, 480.00, '1 L', 85, 4.9, 86, 'Bestseller', '/images/products/wood-pressed-groundnut-oil.webp', 'Slow wood-pressed from Saurashtra native groundnuts. 100% natural, chemical-free.', 'JAP-SKU-001'],
        ['cold-pressed-mustard-oil', 'Cold Pressed Mustard Oil', 'Cold Pressed Oils', 329.00, 395.00, '1 L', 60, 4.8, 54, 'Pure Kachi Ghani', '/images/products/cold-pressed-mustard-oil.webp', 'Traditional Kachi Ghani extracted from whole yellow and brown mustard seeds.', 'JAP-SKU-002'],
        ['virgin-coconut-oil', 'Cold Pressed Virgin Coconut Oil', 'Cold Pressed Oils', 449.00, 540.00, '500 ml', 45, 4.9, 42, 'Pure Aroma', '/images/products/virgin-coconut-oil.webp', 'Cold extracted from freshly grated coconut milk. Raw, unrefined, and aromatic.', 'JAP-SKU-003'],
        ['organic-basmati-rice', 'Royal Aged Organic Basmati Rice', 'Organic Rice', 249.00, 299.00, '1 kg', 120, 4.9, 112, 'Heritage Reserve', '/images/products/organic-basmati-rice.webp', 'Aged 2 years for elongated grain fluffiness and authentic aroma.', 'JAP-SKU-004'],
        ['brown-rice', 'Traditional Brown Basmati Rice', 'Organic Rice', 219.00, 260.00, '1 kg', 75, 4.7, 38, null, '/images/products/brown-rice.webp', 'Unpolished nutrient-rich brown rice rich in dietary fibre.', 'JAP-SKU-005'],
        ['unpolished-toor-dal', 'Unpolished Organic Toor Dal', 'Pulses & Dals', 199.00, 240.00, '1 kg', 90, 4.8, 64, 'High Protein', '/images/products/unpolished-toor-dal.webp', 'Zero water polish, enzyme-rich farm fresh toor dal that cooks easily.', 'JAP-SKU-006'],
        ['organic-green-gram', 'Organic Whole Moong (Green Gram)', 'Pulses & Dals', 179.00, 215.00, '500 g', 65, 4.8, 41, null, '/images/products/organic-green-gram.webp', 'High-sprouting native whole green moong for nutritious daily meals.', 'JAP-SKU-007'],
        ['split-bengal-gram', 'Organic Chana Dal (Bengal Gram)', 'Pulses & Dals', 149.00, 180.00, '500 g', 70, 4.7, 29, null, '/images/products/split-bengal-gram.webp', 'Stone-milled pesticide-free split Bengal gram dal.', 'JAP-SKU-008'],
        ['lakadong-turmeric-powder', 'Lakadong High-Curcumin Turmeric Powder', 'Raw Spices', 189.00, 230.00, '200 g', 80, 5.0, 95, '7.8% Curcumin', '/images/products/lakadong-turmeric-powder.webp', 'Organically harvested Meghalaya Lakadong turmeric with superior medicinal potency.', 'JAP-SKU-009'],
        ['kashmiri-red-chilli-powder', 'Kashmiri Mild Red Chilli Powder', 'Raw Spices', 169.00, 205.00, '200 g', 60, 4.8, 48, 'Vibrant Colour', '/images/products/kashmiri-red-chilli-powder.webp', 'Stemless sun-dried Kashmiri chillies delivering vivid crimson shade and mild heat.', 'JAP-SKU-010'],
        ['whole-coriander-powder', 'Stone Ground Coriander Powder', 'Raw Spices', 139.00, 170.00, '200 g', 55, 4.7, 33, null, '/images/products/whole-coriander-powder.webp', 'Freshly powdered whole aromatic Dhana seeds.', 'JAP-SKU-011'],
        ['cumin-seeds', 'Whole Native Cumin Seeds (Jeera)', 'Raw Spices', 219.00, 265.00, '200 g', 70, 4.9, 52, 'Rich Essential Oils', '/images/products/cumin-seeds.webp', 'Sun-cured Gujarat cumin seeds packed with aroma.', 'JAP-SKU-012'],
        ['khapli-wheat', 'Ancient Emmer (Khapli) Wheat', 'Wheat & Grains', 189.00, 230.00, '1 kg', 50, 4.9, 61, 'Diabetic Friendly', '/images/products/khapli-wheat.webp', 'Low GI indigenous grain celebrated for sustained energy.', 'JAP-SKU-013'],
        ['premium-wheat-flour', 'Chakki Fresh Sharbati Atta', 'Wheat & Grains', 119.00, 145.00, '1 kg', 150, 4.8, 88, null, '/images/products/premium-wheat-flour.webp', '100% whole grain wheat flour ground at low temperature.', 'JAP-SKU-014'],
        ['foxtail-millet', 'Organic Foxtail Millet (Kangni)', 'Ancient Millets', 149.00, 180.00, '500 g', 65, 4.8, 44, 'Superfood', '/images/products/foxtail-millet.webp', 'Gluten-free traditional grain rich in iron and phosphorus.', 'JAP-SKU-015'],
        ['pearl-millet', 'Native Desi Bajra (Pearl Millet)', 'Ancient Millets', 109.00, 135.00, '500 g', 80, 4.7, 31, null, '/images/products/pearl-millet.webp', 'Wholesome winter millet grown in dry Saurashtra soils.', 'JAP-SKU-016'],
        ['organic-sesame-seeds', 'Natural White Sesame Seeds (Til)', 'Seeds & Superfoods', 159.00, 195.00, '250 g', 55, 4.8, 36, 'Calcium Rich', '/images/products/organic-sesame-seeds.webp', 'Sun-dried whole unhulled white sesame seeds.', 'JAP-SKU-017'],
        ['flax-seeds', 'Roasted Golden Flax Seeds (Alsi)', 'Seeds & Superfoods', 169.00, 205.00, '250 g', 70, 4.9, 47, 'Omega-3', '/images/products/flax-seeds.webp', 'Nutrient-dense superfood for cardiovascular wellness.', 'JAP-SKU-018'],
        ['stoneground-besan', 'Fine Stoneground Gram Flour (Besan)', 'Stoneground Flours', 139.00, 170.00, '500 g', 85, 4.8, 59, null, '/images/products/stoneground-besan.webp', 'Silky smooth aromatic chana dal flour for pakoras and laddoos.', 'JAP-SKU-019'],
        ['natural-jaggery-powder', 'Unrefined Desi Jaggery Powder (Gud)', 'Dry Fruits & Sweeteners', 129.00, 160.00, '500 g', 95, 4.9, 73, 'Chemical Free', '/images/products/natural-jaggery-powder.webp', 'Naturally crystallised sugarcane juice without chemical bleaching.', 'JAP-SKU-020'],
        ['almonds-premium', 'Giri Mamra Almonds', 'Dry Fruits & Sweeteners', 599.00, 720.00, '500 g', 40, 5.0, 51, 'High Oil Content', '/images/products/almonds-premium.webp', 'Hand-selected unpasteurized Mamra almonds from verified orchards.', 'JAP-SKU-021'],
        ['vermicompost-plus', 'Bio-Enriched Vermicompost Fertilizer', 'Organic Fertilizers', 299.00, 360.00, '5 kg', 100, 4.9, 67, '100% Organic', '/images/products/vermicompost-plus.webp', 'Earthworm enriched organic manure for lush terrace and farm crops.', 'JAP-SKU-022'],
        ['native-vegetable-seeds', 'Indigenous Heritage Kitchen Garden Seed Kit', 'Seeds & Superfoods', 199.00, 250.00, '12 packs', 60, 4.9, 43, 'Non-Hybrid', '/images/products/native-vegetable-seeds.webp', '12 non-GMO heirloom open-pollinated vegetable varieties.', 'JAP-SKU-023'],
        ['black-pepper-whole', 'Malabar Bold Black Peppercorns', 'Raw Spices', 299.00, 365.00, '150 g', 50, 4.9, 39, 'Grade TGSEB', '/images/products/black-pepper-whole.webp', 'Large-berried Tellicherry black pepper with punchy heat.', 'JAP-SKU-024']
    ];
    $stmt = $pdo->prepare("INSERT IGNORE INTO `products` (`slug`, `name`, `category_name`, `price`, `old_price`, `unit`, `stock`, `rating`, `reviews_count`, `badge`, `image`, `description`, `sku`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    foreach ($products as $prod) {
        $stmt->execute($prod);
    }
    $response['seeds_inserted'][] = 'products (24)';
}

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
