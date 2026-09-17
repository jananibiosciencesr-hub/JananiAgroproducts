<?php
/**
 * JANANI AGRO PRODUCTS - NATIVE HOSTINGER PHP REST API
 * Provides live MySQL CRUD endpoints on Hostinger shared hosting:
 * - /api.php?action=products
 * - /api.php?action=categories
 * - /api.php?action=orders
 * - /api.php?action=coupons
 * - /api.php?action=settings
 * - /api.php?action=inquiries
 * - /api.php?action=newsletter
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$db_host = 'localhost';
$db_name = 'u409810820_Jananiagro';
$db_user = 'u409810820_Jananiagropro';
$db_pass = 'Jananiagro@123';

try {
    $pdo = new PDO("mysql:host={$db_host};dbname={$db_name};charset=utf8mb4", $db_user, $db_pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database connection failed: ' . $e->getMessage()
    ]);
    exit;
}

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

// Helper to get JSON request body
function getJsonBody() {
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?: [];
}

try {
    switch ($action) {
        case 'init':
            // Include and run db_init.php
            require_once __DIR__ . '/db_init.php';
            exit;

        case 'products':
            if ($method === 'GET') {
                $category = $_GET['category'] ?? null;
                $search = $_GET['search'] ?? null;
                $slug = $_GET['slug'] ?? null;
                $id = $_GET['id'] ?? null;

                if ($slug || $id) {
                    $stmt = $pdo->prepare("SELECT * FROM `products` WHERE `slug` = :slug OR `id` = :id LIMIT 1");
                    $stmt->execute([':slug' => $slug, ':id' => $id]);
                    $prod = $stmt->fetch();
                    echo json_encode(['success' => true, 'product' => $prod ?: null]);
                    exit;
                }

                $query = "SELECT * FROM `products` WHERE `active` = 1";
                $params = [];

                if ($category && $category !== 'All') {
                    $query .= " AND `category_name` = :cat";
                    $params[':cat'] = $category;
                }
                if ($search) {
                    $query .= " AND (`name` LIKE :search OR `description` LIKE :search)";
                    $params[':search'] = "%{$search}%";
                }

                $query .= " ORDER BY `id` ASC";
                $stmt = $pdo->prepare($query);
                $stmt->execute($params);
                $products = $stmt->fetchAll();

                echo json_encode(['success' => true, 'count' => count($products), 'products' => $products]);
            } elseif ($method === 'POST') {
                $body = getJsonBody();
                $stmt = $pdo->prepare("INSERT INTO `products` (`slug`, `name`, `category_name`, `price`, `old_price`, `unit`, `stock`, `badge`, `image`, `description`, `sku`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                $stmt->execute([
                    $body['slug'] ?? uniqid('prod-'),
                    $body['name'] ?? 'New Product',
                    $body['category_name'] ?? 'General',
                    $body['price'] ?? 0,
                    $body['old_price'] ?? null,
                    $body['unit'] ?? '1 kg',
                    $body['stock'] ?? 50,
                    $body['badge'] ?? null,
                    $body['image'] ?? '/images/products/placeholder.webp',
                    $body['description'] ?? '',
                    $body['sku'] ?? 'JAP-' . rand(100, 999)
                ]);
                echo json_encode(['success' => true, 'message' => 'Product added successfully']);
            }
            break;

        case 'categories':
            $stmt = $pdo->query("SELECT * FROM `categories` WHERE `active` = 1 ORDER BY `display_order` ASC");
            $categories = $stmt->fetchAll();
            echo json_encode(['success' => true, 'categories' => $categories]);
            break;

        case 'coupons':
            $stmt = $pdo->query("SELECT * FROM `coupons` WHERE `active` = 1");
            $coupons = $stmt->fetchAll();
            echo json_encode(['success' => true, 'coupons' => $coupons]);
            break;

        case 'orders':
            if ($method === 'GET') {
                $orderNumber = $_GET['number'] ?? null;
                if ($orderNumber) {
                    $stmt = $pdo->prepare("SELECT * FROM `orders` WHERE `number` = :num OR `id` = :num LIMIT 1");
                    $stmt->execute([':num' => $orderNumber]);
                    $order = $stmt->fetch();
                    echo json_encode(['success' => true, 'order' => $order ?: null]);
                    exit;
                }
                $stmt = $pdo->query("SELECT * FROM `orders` ORDER BY `created_at` DESC LIMIT 100");
                $orders = $stmt->fetchAll();
                echo json_encode(['success' => true, 'orders' => $orders]);
            } elseif ($method === 'POST') {
                $body = getJsonBody();
                $orderId = 'JAP-' . rand(100000, 999999);
                $stmt = $pdo->prepare("INSERT INTO `orders` (`id`, `number`, `order_date`, `customer_name`, `customer_email`, `customer_phone`, `shipping_address`, `items`, `subtotal`, `discount`, `delivery_fee`, `total`, `payment_method`, `payment_status`, `order_status`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                $stmt->execute([
                    $orderId,
                    $orderId,
                    date('d M Y, H:i'),
                    $body['customer_name'] ?? 'Customer',
                    $body['customer_email'] ?? '',
                    $body['customer_phone'] ?? '',
                    json_encode($body['shipping_address'] ?? []),
                    json_encode($body['items'] ?? []),
                    $body['subtotal'] ?? 0,
                    $body['discount'] ?? 0,
                    $body['delivery_fee'] ?? 0,
                    $body['total'] ?? 0,
                    $body['payment_method'] ?? 'UPI / Online',
                    $body['payment_status'] ?? 'Paid',
                    'Processing'
                ]);
                echo json_encode(['success' => true, 'orderId' => $orderId, 'message' => 'Order placed successfully']);
            }
            break;

        case 'settings':
            $stmt = $pdo->query("SELECT `setting_key`, `setting_value` FROM `settings`");
            $settings = [];
            while ($row = $stmt->fetch()) {
                $settings[$row['setting_key']] = json_decode($row['setting_value'], true);
            }
            echo json_encode(['success' => true, 'settings' => $settings]);
            break;

        case 'inquiries':
            if ($method === 'POST') {
                $body = getJsonBody();
                $stmt = $pdo->prepare("INSERT INTO `inquiries` (`name`, `business_name`, `service`, `email`, `phone`, `quantity`, `message`) VALUES (?, ?, ?, ?, ?, ?, ?)");
                $stmt->execute([
                    $body['name'] ?? '',
                    $body['business_name'] ?? '',
                    $body['service'] ?? 'General',
                    $body['email'] ?? '',
                    $body['phone'] ?? '',
                    $body['quantity'] ?? '',
                    $body['message'] ?? ''
                ]);
                echo json_encode(['success' => true, 'message' => 'Inquiry submitted successfully']);
            }
            break;

        case 'newsletter':
            if ($method === 'POST') {
                $body = getJsonBody();
                $stmt = $pdo->prepare("INSERT IGNORE INTO `newsletter_subscribers` (`email`, `source`) VALUES (?, ?)");
                $stmt->execute([$body['email'] ?? '', $body['source'] ?? 'website']);
                echo json_encode(['success' => true, 'message' => 'Subscribed successfully']);
            }
            break;

        default:
            echo json_encode([
                'success' => true,
                'name' => 'Janani Agro Products API',
                'version' => '2.0.0',
                'endpoints' => [
                    '/api.php?action=init',
                    '/api.php?action=products',
                    '/api.php?action=categories',
                    '/api.php?action=orders',
                    '/api.php?action=coupons',
                    '/api.php?action=settings',
                    '/api.php?action=inquiries',
                    '/api.php?action=newsletter'
                ]
            ]);
            break;
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
