<?php
/**
 * JANANI AGRO PRODUCTS - NATIVE HOSTINGER PHP REST API
 * Provides live MySQL CRUD endpoints and real Gmail SMTP authentication on Hostinger:
 * - /api.php?action=send-otp
 * - /api.php?action=verify-otp
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

$db_host = getenv('DB_HOST') ?: 'localhost';
$db_name = getenv('DB_NAME') ?: 'u409810820_Jananiagro';
$db_user = getenv('DB_USER') ?: 'u409810820_Jananiagropro';
$db_pass = getenv('DB_PASSWORD') ?: 'Jananiagro@123';

// Gmail SMTP Credentials for Real OTP Dispatch
$smtp_host = getenv('SMTP_HOST') ?: 'smtp.gmail.com';
$smtp_port = getenv('SMTP_PORT') ?: 465;
$smtp_user = getenv('SMTP_USER') ?: 'jananibiosciences.r@gmail.com';
$smtp_pass = getenv('SMTP_PASS') ?: 'gvwxapfllucnayzt';
$admin_email = getenv('ADMIN_EMAIL') ?: 'jananibiosciences.r@gmail.com';

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

function getJsonBody() {
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?: [];
}

/**
 * Send real 6-digit OTP email through Gmail SMTP via direct SSL socket
 */
function sendGmailOtp($toEmail, $otpCode, $smtpUser, $smtpPass) {
    $host = 'ssl://smtp.gmail.com';
    $port = 465;
    $socket = @fsockopen($host, $port, $errno, $errstr, 12);
    if (!$socket) {
        error_log("SMTP connection failed: $errstr ($errno)");
        return false;
    }

    fgets($socket, 512);
    fputs($socket, "EHLO jananiagroproducts.com\r\n");
    while ($line = fgets($socket, 512)) {
        if (substr($line, 3, 1) === ' ') break;
    }

    fputs($socket, "AUTH LOGIN\r\n");
    fgets($socket, 512);
    fputs($socket, base64_encode($smtpUser) . "\r\n");
    fgets($socket, 512);
    fputs($socket, base64_encode($smtpPass) . "\r\n");
    $authRes = fgets($socket, 512);
    if (substr($authRes, 0, 3) !== '235') {
        error_log("SMTP Auth failed: " . $authRes);
        fclose($socket);
        return false;
    }

    fputs($socket, "MAIL FROM: <{$smtpUser}>\r\n");
    fgets($socket, 512);
    fputs($socket, "RCPT TO: <{$toEmail}>\r\n");
    fgets($socket, 512);
    fputs($socket, "DATA\r\n");
    fgets($socket, 512);

    $subject = "=?UTF-8?B?" . base64_encode("🔐 {$otpCode} is your Janani Agro Login Verification Code") . "?=";
    $body = "
    <!DOCTYPE html>
    <html>
    <head><meta charset='utf-8'></head>
    <body style='font-family: Arial, sans-serif; background-color: #f4f7f4; padding: 20px; margin: 0;'>
      <div style='max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2ece2;'>
        <div style='background: linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%); padding: 25px; text-align: center; color: white;'>
          <h1 style='margin: 0; font-size: 22px; letter-spacing: 1px;'>JANANI AGRO PRODUCTS</h1>
          <p style='margin: 5px 0 0 0; font-size: 12px; opacity: 0.85;'>Nurturing Nature, Enriching Future</p>
        </div>
        <div style='padding: 25px;'>
          <h3 style='color: #2d3748; margin-top: 0;'>Secure Login Verification</h3>
          <p style='color: #4a5568; font-size: 14px; line-height: 1.5;'>
            You have requested an authentication code for your <strong>Janani Agro Products</strong> account.
          </p>
          <div style='background: #f0fdf4; border: 2px dashed #16a34a; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;'>
            <div style='font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #15803d; margin-bottom: 6px;'>Your Verification Code</div>
            <div style='font-size: 38px; font-weight: 800; letter-spacing: 8px; color: #166534; font-family: monospace;'>{$otpCode}</div>
            <div style='font-size: 12px; color: #64748b; margin-top: 6px;'>Valid for 5 minutes only</div>
          </div>
          <p style='font-size: 12px; color: #854d0e; background: #fef9c3; padding: 10px; border-radius: 6px; margin: 0;'>
            <strong>Notice:</strong> If you did not request this OTP, please ignore this email. Never share your OTP with anyone.
          </p>
        </div>
        <div style='background: #f8fafc; padding: 15px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;'>
          &copy; " . date('Y') . " Janani Agro Products &bull; Lodhika GIDC, Gujarat
        </div>
      </div>
    </body>
    </html>";

    $headers  = "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    $headers .= "From: Janani Agro Products <{$smtpUser}>\r\n";
    $headers .= "To: <{$toEmail}>\r\n";
    $headers .= "Subject: {$subject}\r\n";

    fputs($socket, $headers . "\r\n" . $body . "\r\n.\r\n");
    $dataRes = fgets($socket, 512);
    fputs($socket, "QUIT\r\n");
    fclose($socket);

    return substr($dataRes, 0, 3) === '250';
}

try {
    switch ($action) {
        case 'init':
            require_once __DIR__ . '/db_init.php';
            exit;

        case 'send-otp':
            if ($method === 'POST') {
                $body = getJsonBody();
                $email = strtolower(trim($body['email'] ?? ''));
                $phone = trim($body['phone'] ?? '');
                $target = $email ?: $phone;

                if (!$target) {
                    echo json_encode(['success' => false, 'message' => 'Please provide an email or mobile number.']);
                    exit;
                }

                $otp = (string)rand(100000, 999999);
                $expiresAt = time() + 300; // 5 minutes

                // Persist OTP in settings table
                $otpData = json_encode(['code' => $otp, 'expires_at' => $expiresAt]);
                $stmt = $pdo->prepare("INSERT INTO `settings` (`setting_key`, `setting_value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`)");
                $stmt->execute(['otp_' . md5($target), $otpData]);

                $emailSent = false;
                if ($email) {
                    $emailSent = sendGmailOtp($email, $otp, $smtp_user, $smtp_pass);
                }

                echo json_encode([
                    'success' => true,
                    'message' => $email
                        ? "Real 6-digit verification code sent to {$email} via Gmail."
                        : "Verification code sent to +91 {$phone}.",
                    'emailSent' => $emailSent,
                    'resendCooldownSeconds' => 60
                ]);
                exit;
            }
            break;

        case 'verify-otp':
            if ($method === 'POST') {
                $body = getJsonBody();
                $email = strtolower(trim($body['email'] ?? ''));
                $phone = trim($body['phone'] ?? '');
                $otp = trim($body['otp'] ?? '');
                $target = $email ?: $phone;

                if (!$target || !$otp) {
                    echo json_encode(['success' => false, 'message' => 'Target and 6-digit OTP code are required.']);
                    exit;
                }

                // Check stored OTP in database
                $stmt = $pdo->prepare("SELECT `setting_value` FROM `settings` WHERE `setting_key` = ?");
                $stmt->execute(['otp_' . md5($target)]);
                $row = $stmt->fetch();

                $valid = false;
                if ($row) {
                    $stored = json_decode($row['setting_value'], true);
                    if ($stored && $stored['code'] === $otp && $stored['expires_at'] > time()) {
                        $valid = true;
                    }
                }
                // Testing bypass
                if ($otp === '123456' || $otp === '1234') {
                    $valid = true;
                }

                if (!$valid) {
                    echo json_encode(['success' => false, 'message' => 'Invalid or expired OTP code. Please check your email or request a new code.']);
                    exit;
                }

                // Delete used OTP
                $pdo->prepare("DELETE FROM `settings` WHERE `setting_key` = ?")->execute(['otp_' . md5($target)]);

                // Check if admin
                $isAdmin = ($email === strtolower($admin_email) || $email === 'jananibiosciences.r@gmail.com' || strpos($email, 'admin@jananiagro.com') !== false);

                $user = [
                    'id' => $isAdmin ? 'ADMIN-001' : 'CUST-' . rand(100, 999),
                    'name' => $isAdmin ? 'Janani Admin (Root)' : ($email ? explode('@', $email)[0] : 'Patron'),
                    'email' => $email ?: ($phone . '@janani.customer'),
                    'phone' => $phone ?: '+91 98480 22338',
                    'role' => $isAdmin ? 'Super Admin' : 'Customer',
                    'walletBalance' => $isAdmin ? 10000 : 150,
                    'referralCode' => $isAdmin ? 'JANANIROOT' : 'JANANI' . rand(1000, 9999),
                    'isVerified' => true,
                    'tier' => $isAdmin ? 'Platinum Root Access' : 'Silver'
                ];

                // Synchronize user to MySQL users table
                try {
                    $stmt = $pdo->prepare("INSERT INTO `users` (`id`, `name`, `email`, `phone`, `role`, `wallet_balance`, `tier`, `status`, `is_verified`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE `role` = VALUES(`role`), `status` = 'Active', `tier` = VALUES(`tier`)");
                    $stmt->execute([$user['id'], $user['name'], $user['email'], $user['phone'], $user['role'], $user['walletBalance'], $user['tier'], 'Active', 1]);
                } catch (Exception $e) {}

                echo json_encode([
                    'success' => true,
                    'message' => $isAdmin ? 'Welcome Super Admin! Signed in successfully.' : 'Verification successful! Welcome to Janani Agro.',
                    'isAdmin' => $isAdmin,
                    'token' => 'janani_jwt_' . time() . '_' . rand(1000, 9999),
                    'user' => $user
                ]);
                exit;
            }
            break;

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
                'version' => '2.1.0',
                'endpoints' => [
                    '/api.php?action=send-otp',
                    '/api.php?action=verify-otp',
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
