<?php
/**
 * JANANI AGRO PRODUCTS - API SECURITY, COMMERCE & WALLET CORE
 *
 * Included by api.php (never served directly; direct requests are refused). Provides:
 *  - configuration from environment variables (no secrets in source code)
 *  - signed authentication tokens + role checks (customer / staff / admin)
 *  - rate limiting and OTP storage (hashed, expiring, attempt-limited)
 *  - SMTP mail delivery with verified TLS
 *  - server-side cart pricing, coupon validation and order numbering
 *  - Razorpay order creation, signature verification, refunds and webhooks
 *  - one-time, versioned data migrations (replaces the old "run on every request" repairs)
 */

if (!defined('JANANI_API')) {
    http_response_code(403);
    exit('Forbidden');
}

const JANANI_SCHEMA_VERSION = 3;
const JANANI_CUSTOMER_TOKEN_TTL = 604800;   // 7 days
const JANANI_ADMIN_TOKEN_TTL = 86400;       // 24 hours (matches admin portal auto-logout)
const JANANI_OTP_TTL = 600;                 // 10 minutes
const JANANI_OTP_MAX_ATTEMPTS = 5;
const JANANI_FREE_SHIPPING_THRESHOLD = 799;
const JANANI_STANDARD_SHIPPING_FEE = 60;
const JANANI_GST_HALF_RATE = 0.025;         // CGST 2.5% + SGST 2.5% (keep in sync with checkout.tsx)
const JANANI_MAX_QTY_PER_LINE = 100;

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

function janani_env($key, $default = null) {
    $v = getenv($key);
    if ($v === false || $v === null) {
        $v = $_ENV[$key] ?? null;
    }
    if ($v === null) return $default;
    $v = trim((string)$v);
    return $v === '' ? $default : $v;
}

function janani_env_bool($key, $default = false) {
    $v = janani_env($key);
    if ($v === null) return $default;
    return in_array(strtolower($v), ['1', 'true', 'yes', 'on'], true);
}

function janani_admin_email() {
    // The administrator mailbox is not a secret; it is the identity allowed into the admin portal.
    return strtolower(trim((string)janani_env('ADMIN_EMAIL', 'jananibiosciences.r@gmail.com')));
}

function janani_is_local_request() {
    $host = strtolower((string)($_SERVER['HTTP_HOST'] ?? ''));
    $host = preg_replace('/:\d+$/', '', $host);
    return in_array($host, ['localhost', '127.0.0.1', '::1'], true);
}

function janani_client_ip() {
    return (string)($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0');
}

// ---------------------------------------------------------------------------
// Response helpers
// ---------------------------------------------------------------------------

function janani_json_exit($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function janani_e($value) {
    return htmlspecialchars((string)$value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

/** HTML-escapes every string inside an array (used before building e-mail templates). */
function janani_escape_deep($value) {
    if (is_array($value)) {
        $out = [];
        foreach ($value as $k => $v) {
            $out[$k] = janani_escape_deep($v);
        }
        return $out;
    }
    if (is_string($value)) {
        return janani_e($value);
    }
    return $value;
}

function janani_mask_secret($value) {
    $s = (string)$value;
    if ($s === '') return '';
    $tail = strlen($s) > 4 ? substr($s, -4) : '';
    return '••••••••' . $tail;
}

function janani_is_masked($value) {
    return is_string($value) && (strpos($value, '•') !== false || preg_match('/^\*{4,}/', $value));
}

/** Recursively masks values whose key looks like a credential. */
function janani_mask_secrets_deep($data) {
    if (!is_array($data)) return $data;
    $out = [];
    foreach ($data as $k => $v) {
        if (is_array($v)) {
            $out[$k] = janani_mask_secrets_deep($v);
        } elseif (is_string($k) && preg_match('/(secret|password|passwd|pass$|apikey|api_key|authtoken|auth_token|salt|token$|privatekey)/i', $k) && is_scalar($v) && (string)$v !== '') {
            $out[$k] = janani_mask_secret($v);
        } else {
            $out[$k] = $v;
        }
    }
    return $out;
}

/** Keeps stored secret values when the admin UI submits a masked placeholder back. */
function janani_merge_keep_masked($incoming, $existing) {
    if (!is_array($incoming)) return $incoming;
    $out = $incoming;
    foreach ($incoming as $k => $v) {
        if (is_array($v)) {
            $out[$k] = janani_merge_keep_masked($v, is_array($existing[$k] ?? null) ? $existing[$k] : []);
        } elseif (janani_is_masked($v)) {
            $out[$k] = $existing[$k] ?? '';
        }
    }
    return $out;
}

// ---------------------------------------------------------------------------
// Security key/value store (OTPs, rate limits, flags) - never exposed by any endpoint
// ---------------------------------------------------------------------------

function janani_store_get($pdo, $key) {
    try {
        $st = $pdo->prepare("SELECT `v`, `expires_at` FROM `security_store` WHERE `k` = ? LIMIT 1");
        $st->execute([$key]);
        $row = $st->fetch(PDO::FETCH_ASSOC);
        if (!$row) return null;
        if ((int)$row['expires_at'] > 0 && (int)$row['expires_at'] < time()) {
            janani_store_delete($pdo, $key);
            return null;
        }
        $decoded = json_decode($row['v'], true);
        return $decoded === null ? $row['v'] : $decoded;
    } catch (Throwable $e) {
        return null;
    }
}

function janani_store_set($pdo, $key, $value, $ttlSeconds = 0) {
    $exp = $ttlSeconds > 0 ? time() + (int)$ttlSeconds : 0;
    $st = $pdo->prepare("INSERT INTO `security_store` (`k`, `v`, `expires_at`) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE `v` = VALUES(`v`), `expires_at` = VALUES(`expires_at`)");
    $st->execute([$key, is_string($value) ? $value : json_encode($value), $exp]);
}

function janani_store_delete($pdo, $key) {
    try {
        $pdo->prepare("DELETE FROM `security_store` WHERE `k` = ?")->execute([$key]);
    } catch (Throwable $e) {}
}

/**
 * True at most once per interval (shared across all PHP processes) - used to keep slow schema
 * maintenance off the hot path of every request.
 */
function janani_should_run_periodic($pdo, $name, $intervalSeconds) {
    if (!$pdo) return false;
    try {
        $st = $pdo->prepare("SELECT `expires_at` FROM `security_store` WHERE `k` = ? LIMIT 1");
        $st->execute(['periodic:' . $name]);
        $exp = $st->fetchColumn();
        if ($exp !== false && (int)$exp > time()) return false;
        janani_store_set($pdo, 'periodic:' . $name, '1', (int)$intervalSeconds);
        return true;
    } catch (Throwable $e) {
        return true;
    }
}

// ---------------------------------------------------------------------------
// Schema bootstrap + one-time migrations
// ---------------------------------------------------------------------------

function janani_column_exists($pdo, $table, $column) {
    static $cache = [];
    if (!isset($cache[$table])) {
        $cache[$table] = [];
        try {
            $st = $pdo->query("SHOW COLUMNS FROM `{$table}`");
            while ($c = $st->fetch(PDO::FETCH_ASSOC)) {
                $cache[$table][strtolower($c['Field'])] = true;
            }
        } catch (Throwable $e) {}
    }
    return isset($cache[$table][strtolower($column)]);
}

function janani_add_column($pdo, $table, $column, $definition) {
    if (janani_column_exists($pdo, $table, $column)) return;
    try {
        $pdo->exec("ALTER TABLE `{$table}` ADD COLUMN `{$column}` {$definition}");
    } catch (Throwable $e) {
        error_log("[janani] add column {$table}.{$column} failed: " . $e->getMessage());
    }
}

function janani_create_core_tables($pdo) {
    $pdo->exec("CREATE TABLE IF NOT EXISTS `security_store` (
        `k` VARCHAR(191) NOT NULL PRIMARY KEY,
        `v` LONGTEXT NOT NULL,
        `expires_at` INT(11) NOT NULL DEFAULT 0,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        KEY `idx_expires` (`expires_at`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

    $pdo->exec("CREATE TABLE IF NOT EXISTS `payment_intents` (
        `razorpay_order_id` VARCHAR(64) NOT NULL PRIMARY KEY,
        `user_id` VARCHAR(64) NOT NULL,
        `user_email` VARCHAR(255) DEFAULT NULL,
        `amount_paise` INT(11) NOT NULL,
        `payload` LONGTEXT NOT NULL,
        `status` VARCHAR(30) NOT NULL DEFAULT 'created',
        `payment_id` VARCHAR(100) DEFAULT NULL,
        `order_number` VARCHAR(64) DEFAULT NULL,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        KEY `idx_user` (`user_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

    $pdo->exec("CREATE TABLE IF NOT EXISTS `order_counters` (
        `name` VARCHAR(32) NOT NULL PRIMARY KEY,
        `value` INT(11) NOT NULL DEFAULT 0
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
}

/**
 * Runs pending migrations once per schema version (guarded by a MySQL named lock),
 * so every request afterwards costs a single indexed SELECT.
 */
function janani_boot($pdo) {
    if (!$pdo) return;
    $version = 0;
    try {
        $st = $pdo->query("SELECT `v` FROM `security_store` WHERE `k` = 'schema_version' LIMIT 1");
        $version = (int)$st->fetchColumn();
    } catch (Throwable $e) {
        $version = 0;
    }
    if ($version >= JANANI_SCHEMA_VERSION) return;

    $locked = false;
    try {
        $locked = (int)$pdo->query("SELECT GET_LOCK('janani_migrations', 15)")->fetchColumn() === 1;
    } catch (Throwable $e) {}

    try {
        janani_create_core_tables($pdo);
        $st = $pdo->query("SELECT `v` FROM `security_store` WHERE `k` = 'schema_version' LIMIT 1");
        $version = (int)$st->fetchColumn();
        if ($version < 1) {
            janani_migration_v1($pdo);
            janani_store_set($pdo, 'schema_version', '1');
            $version = 1;
        }
        if ($version < 2) {
            janani_migration_v2($pdo);
            janani_store_set($pdo, 'schema_version', '2');
            $version = 2;
        }
        if ($version < 3) {
            // Databases that were already marked v2 before the wallet feature shipped never got the wallet tables.
            janani_migration_v2($pdo);
            janani_store_set($pdo, 'schema_version', '3');
            $version = 3;
        }
    } catch (Throwable $e) {
        error_log('[janani] migration failed: ' . $e->getMessage());
    } finally {
        if ($locked) {
            try { $pdo->query("SELECT RELEASE_LOCK('janani_migrations')"); } catch (Throwable $e) {}
        }
    }
}

function janani_migration_v1($pdo) {
    // 1. Orders: columns required by the server-side checkout
    $orderCols = [
        'order_date' => 'VARCHAR(100) DEFAULT NULL',
        'subtotal' => "DECIMAL(10,2) DEFAULT '0.00'",
        'discount' => "DECIMAL(10,2) DEFAULT '0.00'",
        'delivery_fee' => "DECIMAL(10,2) DEFAULT '0.00'",
        'payment_method' => "VARCHAR(100) DEFAULT NULL",
        'payment_status' => "VARCHAR(50) DEFAULT 'Pending'",
        'order_status' => "VARCHAR(50) DEFAULT 'Processing'",
        'courier' => 'VARCHAR(100) DEFAULT NULL',
        'tracking_id' => 'VARCHAR(100) DEFAULT NULL',
        'awb' => 'VARCHAR(100) DEFAULT NULL',
        'warehouse' => 'VARCHAR(255) DEFAULT NULL',
        'items' => 'LONGTEXT DEFAULT NULL',
        'billing_address' => 'LONGTEXT DEFAULT NULL',
        'customer_id' => 'VARCHAR(64) DEFAULT NULL',
        'coupon_code' => 'VARCHAR(50) DEFAULT NULL',
        'coupon_discount' => "DECIMAL(10,2) DEFAULT '0.00'",
        'wallet_deduction' => "DECIMAL(10,2) DEFAULT '0.00'",
        'gst_amount' => "DECIMAL(10,2) DEFAULT '0.00'",
        'transaction_id' => 'VARCHAR(100) DEFAULT NULL',
        'razorpay_order_id' => 'VARCHAR(100) DEFAULT NULL',
        'delivery_slot' => 'VARCHAR(150) DEFAULT NULL',
        'expected_delivery' => 'VARCHAR(100) DEFAULT NULL',
        'timeline' => 'LONGTEXT DEFAULT NULL',
        'admin_notes' => 'LONGTEXT DEFAULT NULL',
        'return_info' => 'LONGTEXT DEFAULT NULL',
        'refund_id' => 'VARCHAR(100) DEFAULT NULL',
        'refund_amount' => "DECIMAL(10,2) DEFAULT '0.00'",
        'invoice_sent' => 'TINYINT(1) DEFAULT 0',
        'order_notes' => 'TEXT DEFAULT NULL',
    ];
    foreach ($orderCols as $col => $def) {
        janani_add_column($pdo, 'orders', $col, $def);
    }

    // 2. Coupons: redemption counter
    janani_add_column($pdo, 'coupons', 'uses', 'INT(11) DEFAULT 0');

    // 3. Users: any password stored in plain text gets hashed (bcrypt) in both columns
    try {
        $rows = $pdo->query("SELECT `id`, `password`, `password_hash` FROM `users` WHERE `password` IS NOT NULL AND `password` != '' AND `password` NOT LIKE '\$2y\$%' AND `password` NOT LIKE '\$2a\$%' AND `password` NOT LIKE '\$2b\$%' AND `password` NOT LIKE '\$argon%'")->fetchAll(PDO::FETCH_ASSOC);
        $up = $pdo->prepare("UPDATE `users` SET `password` = ?, `password_hash` = ? WHERE `id` = ?");
        foreach ($rows as $r) {
            $hash = password_hash(trim((string)$r['password']), PASSWORD_DEFAULT);
            $up->execute([$hash, $hash, $r['id']]);
        }
        $pdo->exec("UPDATE `users` SET `password_hash` = `password` WHERE (`password_hash` IS NULL OR `password_hash` = '') AND `password` LIKE '\$2%'");
        $pdo->exec("UPDATE `users` SET `password` = `password_hash` WHERE (`password` IS NULL OR `password` = '') AND `password_hash` LIKE '\$2%'");
    } catch (Throwable $e) {
        error_log('[janani] password hashing migration: ' . $e->getMessage());
    }

    // 4. These accounts had their passwords force-reset to values published in the source code on every
    //    request, so those passwords are revoked. The owners sign in with an e-mail OTP (or "Forgot Password").
    try {
        $revoke = $pdo->prepare("UPDATE `users` SET `password` = NULL, `password_hash` = NULL WHERE LOWER(`email`) IN (?, 'ramaofficial.d@gmail.com', 'kameswarip98@gmail.com', 'tarunbehara360@gmail.com') OR `id` = 'ADMIN-ROOT'");
        $revoke->execute([janani_admin_email()]);
    } catch (Throwable $e) {
        error_log('[janani] leaked password revocation: ' . $e->getMessage());
    }

    // 5. Seeded placeholder reviews (invented names) are hidden from the storefront (not deleted)
    try {
        $pdo->exec("UPDATE `reviews` SET `status` = 'Hidden' WHERE `id` IN ('REV-101','REV-102','REV-103','REV-104','REV-105','REV-106','REV-107')
            AND LOWER(`customer_email`) IN ('ramesh.kumar@gmail.com','srinivas.reddy@gmail.com','mahesh.patel@gmail.com','suresh.patil@gmail.com','baldev.singh@gmail.com','radhika.k@gmail.com','suresh.n@gmail.com')");
    } catch (Throwable $e) {}

    // 6. Old OTP codes were stored in the public `settings` table - remove them
    try {
        $pdo->exec("DELETE FROM `settings` WHERE `setting_key` LIKE 'otp\\_%'");
    } catch (Throwable $e) {}

    // 7. Seed the order number counter from existing JAP-### orders (legacy 5+ digit numbers ignored)
    janani_seed_order_counter($pdo);

    // 8. A demo account (admin@jananiagro.com, "Rajesh Varma") was seeded with Super Admin rights.
    //    It is disabled; a real administrator can re-enable it from the Staff screen if it is genuine.
    try {
        $pdo->exec("UPDATE `users` SET `role` = 'Staff', `status` = 'Inactive' WHERE LOWER(`email`) = 'admin@jananiagro.com' AND `id` != 'ADMIN-ROOT'");
    } catch (Throwable $e) {}

    // 9. Remove stored copies of leaked default gateway secrets (Razorpay test key published in source code)
    try {
        $st = $pdo->prepare("SELECT `setting_value` FROM `settings` WHERE `setting_key` = 'payment_gateways' LIMIT 1");
        $st->execute();
        $gw = json_decode((string)$st->fetchColumn(), true);
        if (is_array($gw) && isset($gw['razorpay']['keyId']) && in_array($gw['razorpay']['keyId'], JANANI_LEAKED_RAZORPAY_KEYS, true)) {
            $gw['razorpay']['keyId'] = '';
            $gw['razorpay']['keySecret'] = '';
            $gw['razorpay']['webhookSecret'] = '';
            $pdo->prepare("UPDATE `settings` SET `setting_value` = ? WHERE `setting_key` = 'payment_gateways'")->execute([json_encode($gw)]);
        }
    } catch (Throwable $e) {}
}

// ---------------------------------------------------------------------------
// Auth tokens
// ---------------------------------------------------------------------------

function janani_b64url_encode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function janani_b64url_decode($data) {
    $pad = strlen($data) % 4;
    if ($pad) $data .= str_repeat('=', 4 - $pad);
    return base64_decode(strtr($data, '-_', '+/'), true);
}

function janani_app_secret($pdo) {
    static $secret = null;
    if ($secret !== null) return $secret;
    $env = janani_env('APP_SECRET') ?: janani_env('JWT_SECRET');
    if ($env && strlen($env) >= 32) {
        $secret = $env;
        return $secret;
    }
    // No APP_SECRET configured: generate a strong random one once and keep it in the private store.
    $readSecret = function () use ($pdo) {
        try {
            $st = $pdo->prepare("SELECT `v` FROM `security_store` WHERE `k` = 'app_secret' LIMIT 1");
            $st->execute();
            $v = $st->fetchColumn();
            return is_string($v) ? $v : null;
        } catch (Throwable $e) {
            return null;
        }
    };
    $stored = $readSecret();
    if (is_string($stored) && strlen($stored) >= 32) {
        $secret = $stored;
        return $secret;
    }
    try {
        $pdo->prepare("INSERT IGNORE INTO `security_store` (`k`, `v`, `expires_at`) VALUES ('app_secret', ?, 0)")->execute(['k' . bin2hex(random_bytes(32))]);
    } catch (Throwable $e) {}
    $stored = $readSecret();
    if (!is_string($stored) || strlen($stored) < 32) {
        throw new RuntimeException('Authentication secret unavailable');
    }
    $secret = $stored;
    return $secret;
}

function janani_is_staff_role($role) {
    return in_array(strtolower(trim((string)$role)), ['super admin', 'admin', 'staff', 'manager'], true);
}

function janani_is_admin_user($user) {
    if (!$user) return false;
    $role = strtolower(trim((string)($user['role'] ?? '')));
    return $role === 'super admin' || $role === 'admin' || strtolower((string)($user['email'] ?? '')) === janani_admin_email();
}

function janani_is_staff_user($user) {
    return $user && (janani_is_admin_user($user) || janani_is_staff_role($user['role'] ?? ''));
}

function janani_issue_token($pdo, $user) {
    $isStaff = janani_is_staff_user($user);
    $payload = [
        'uid' => (string)$user['id'],
        'em' => strtolower((string)($user['email'] ?? '')),
        'iat' => time(),
        'exp' => time() + ($isStaff ? JANANI_ADMIN_TOKEN_TTL : JANANI_CUSTOMER_TOKEN_TTL),
        'n' => bin2hex(random_bytes(8)),
    ];
    $body = janani_b64url_encode(json_encode($payload));
    $sig = janani_b64url_encode(hash_hmac('sha256', 'jat1.' . $body, janani_app_secret($pdo), true));
    return 'jat1.' . $body . '.' . $sig;
}

function janani_verify_token($pdo, $token) {
    if (!is_string($token) || substr_count($token, '.') !== 2) return null;
    [$prefix, $body, $sig] = explode('.', $token);
    if ($prefix !== 'jat1') return null;
    try {
        $expected = janani_b64url_encode(hash_hmac('sha256', 'jat1.' . $body, janani_app_secret($pdo), true));
    } catch (Throwable $e) {
        return null;
    }
    if (!hash_equals($expected, $sig)) return null;
    $payload = json_decode((string)janani_b64url_decode($body), true);
    if (!is_array($payload) || empty($payload['uid']) || (int)($payload['exp'] ?? 0) < time()) return null;
    return $payload;
}

function janani_request_token() {
    $candidates = [
        $_SERVER['HTTP_AUTHORIZATION'] ?? '',
        $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '',
        $_SERVER['HTTP_X_JANANI_AUTH'] ?? '',
    ];
    if (function_exists('getallheaders')) {
        foreach ((array)getallheaders() as $name => $value) {
            $lname = strtolower($name);
            if ($lname === 'authorization' || $lname === 'x-janani-auth') {
                $candidates[] = $value;
            }
        }
    }
    foreach ($candidates as $c) {
        $c = trim((string)$c);
        if ($c === '') continue;
        if (stripos($c, 'Bearer ') === 0) $c = trim(substr($c, 7));
        if (strpos($c, 'jat1.') === 0) return $c;
    }
    return null;
}

/** Returns the authenticated users row (from the database, so role/status changes apply instantly). */
function janani_current_user($pdo) {
    static $resolved = false;
    static $user = null;
    if ($resolved) return $user;
    $resolved = true;
    $token = janani_request_token();
    if (!$token || !$pdo) return null;
    $payload = janani_verify_token($pdo, $token);
    if (!$payload) return null;
    try {
        $st = $pdo->prepare("SELECT * FROM `users` WHERE `id` = ? LIMIT 1");
        $st->execute([$payload['uid']]);
        $row = $st->fetch(PDO::FETCH_ASSOC);
        if (!$row && !empty($payload['em'])) {
            $st = $pdo->prepare("SELECT * FROM `users` WHERE LOWER(`email`) = ? LIMIT 1");
            $st->execute([$payload['em']]);
            $row = $st->fetch(PDO::FETCH_ASSOC);
        }
    } catch (Throwable $e) {
        $row = null;
    }
    if (!$row) return null;
    $status = strtolower(trim((string)($row['status'] ?? 'active')));
    if (in_array($status, ['suspended', 'blocked', 'banned', 'deleted', 'inactive'], true)) return null;
    $user = $row;
    return $user;
}

/**
 * Who may request an admin-portal OTP: the ADMIN_EMAIL mailbox, or any active account whose role is
 * Super Admin / Admin / Staff / Manager (roles are managed from the admin Staff screen).
 */
function janani_admin_login_allowed($pdo, $email) {
    $email = strtolower(trim((string)$email));
    if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) return false;
    if ($email === janani_admin_email()) return true;
    $row = janani_find_user_by_identifier($pdo, $email);
    return $row && !janani_user_is_blocked($row) && janani_is_staff_user($row);
}

function janani_require_user($pdo) {
    $u = janani_current_user($pdo);
    if (!$u) {
        janani_json_exit(['success' => false, 'authRequired' => true, 'message' => 'Please sign in to continue.'], 401);
    }
    return $u;
}

function janani_require_staff($pdo) {
    $u = janani_current_user($pdo);
    if (!$u) {
        janani_json_exit(['success' => false, 'authRequired' => true, 'message' => 'Admin session expired. Please sign in again.'], 401);
    }
    if (!janani_is_staff_user($u)) {
        janani_json_exit(['success' => false, 'message' => 'You do not have permission to perform this action.'], 403);
    }
    return $u;
}

function janani_require_admin($pdo) {
    $u = janani_require_staff($pdo);
    if (!janani_is_admin_user($u)) {
        janani_json_exit(['success' => false, 'message' => 'Only an administrator can perform this action.'], 403);
    }
    return $u;
}

/** Strips credentials before a users row leaves the server. */
function janani_public_user($row) {
    if (!is_array($row)) return $row;
    unset($row['password'], $row['password_hash'], $row['reset_token'], $row['otp']);
    return $row;
}

/**
 * Central access policy, evaluated before any handler runs.
 * Anything not explicitly listed is administrator-only.
 */
function janani_authorize_request($pdo, $action, $method) {
    $rawId = trim((string)($_GET['id'] ?? ''), '/');
    $first = $rawId === '' ? '' : explode('/', $rawId)[0];
    $isRead = ($method === 'GET');

    switch ($action) {
        case '':
        case 'send-otp':
        case 'verify-otp':
        case 'login':
        case 'login-email':
        case 'signup':
        case 'register-customer':
        case 'forgot-password':
        case 'reset-password':
        case 'check-user':
        case 'razorpay-webhook':
        case 'auth-me':
        case 'next-order-number':
            return;

        case 'products':
        case 'categories':
        case 'cms':
        case 'shipping':
            if ($isRead) return;
            janani_require_staff($pdo);
            return;

        case 'reviews':
            if ($isRead) return; // non-staff only receive approved reviews (enforced in handler)
            if ($method === 'POST' && $rawId === '') {
                janani_require_user($pdo);
                return;
            }
            janani_require_staff($pdo);
            return;

        case 'coupons':
            if ($isRead) return; // non-admin only receive active coupons (enforced in handler)
            if ($first === 'validate' || isset($_GET['validate'])) return;
            janani_require_admin($pdo);
            return;

        case 'settings':
            if ($isRead && in_array((string)($_GET['category'] ?? ''), ['store', 'branding', 'seo'], true)) return;
            janani_require_admin($pdo);
            return;

        case 'inquiries':
        case 'newsletter':
            if ($method === 'POST' && $rawId === '') return; // public form submission (rate limited in handler)
            janani_require_staff($pdo);
            return;

        case 'orders':
        case 'create-order':
            if ($isRead) return; // ownership / public tracking enforced in handler
            if ($first === 'bulk-status' || $first === 'refund') {
                janani_require_staff($pdo);
                return;
            }
            if ($method === 'DELETE') {
                janani_require_admin($pdo);
                return;
            }
            janani_require_user($pdo); // customers: create + own cancel/return/exchange only (handler)
            return;

        case 'create-razorpay-order':
        case 'verify-razorpay-payment':
        case 'get-user-phone':
        case 'get-contact':
        case 'send-order-email':
        case 'customers':
        case 'users':
        case 'profile':
        case 'update-profile':
        case 'wallet':
            janani_require_user($pdo); // self-service limits enforced in handler
            return;

        case 'upload-video':
        case 'upload-media':
        case 'inventory':
        case 'audit-logs':
        case 'activity-logs':
        case 'stats':
        case 'admin-stats':
        case 'charts':
        case 'widgets':
            janani_require_staff($pdo);
            return;

        case 'init':
        case 'reindex_customers':
        case 'reindex-customers':
        case 'payments':
        case 'roles':
        case 'staff':
        case 'backups':
            janani_require_admin($pdo);
            return;

        default:
            // Unknown endpoint: answer 404 without touching the caller's session.
            janani_json_exit(['success' => false, 'message' => 'Unknown endpoint.'], 404);
    }
}

// ---------------------------------------------------------------------------
// Rate limiting
// ---------------------------------------------------------------------------

/** Fixed-window counter. Returns true when the call is allowed. */
function janani_rate_limit($pdo, $bucket, $max, $windowSeconds) {
    $key = 'rl:' . hash('sha256', $bucket);
    try {
        $row = janani_store_get($pdo, $key);
        $now = time();
        if (!is_array($row) || ($row['s'] ?? 0) + $windowSeconds <= $now) {
            $row = ['s' => $now, 'c' => 0];
        }
        $row['c'] = (int)$row['c'] + 1;
        janani_store_set($pdo, $key, $row, $windowSeconds);
        return $row['c'] <= $max;
    } catch (Throwable $e) {
        return true; // never lock customers out because of a storage error
    }
}

function janani_rate_limit_or_exit($pdo, $bucket, $max, $windowSeconds, $message = 'Too many attempts. Please wait a few minutes and try again.') {
    if (!janani_rate_limit($pdo, $bucket, $max, $windowSeconds)) {
        janani_json_exit(['success' => false, 'rateLimited' => true, 'message' => $message], 429);
    }
}

// ---------------------------------------------------------------------------
// OTP
// ---------------------------------------------------------------------------

function janani_otp_group($purpose) {
    $p = strtolower(trim((string)$purpose));
    if ($p === 'signup' || $p === 'checkout_signup' || $p === 'register') return 'signup';
    if ($p === 'password_reset' || $p === 'reset' || $p === 'forgot_password') return 'password_reset';
    return 'login';
}

function janani_normalize_target($target) {
    $t = strtolower(trim((string)$target));
    if ($t === '') return '';
    if (strpos($t, '@') !== false) return $t;
    $digits = preg_replace('/\D/', '', $t);
    return strlen($digits) >= 10 ? substr($digits, -10) : $digits;
}

function janani_otp_key($target, $group) {
    return 'otp:' . $group . ':' . hash('sha256', janani_normalize_target($target));
}

function janani_otp_issue($pdo, $target, $purpose) {
    $code = str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    $group = janani_otp_group($purpose);
    janani_store_set($pdo, janani_otp_key($target, $group), [
        'h' => hash_hmac('sha256', $code, janani_app_secret($pdo)),
        'a' => 0,
        'exp' => time() + JANANI_OTP_TTL,
    ], JANANI_OTP_TTL);
    return $code;
}

/** Constant-time check; the code is consumed on success and destroyed after 5 wrong attempts. */
function janani_otp_verify($pdo, $target, $purpose, $code) {
    $code = preg_replace('/\D/', '', (string)$code);
    if (strlen($code) !== 6) return false;
    $key = janani_otp_key($target, janani_otp_group($purpose));
    $row = janani_store_get($pdo, $key);
    if (!is_array($row) || empty($row['h'])) return false;
    if ((int)($row['exp'] ?? 0) < time() || (int)($row['a'] ?? 0) >= JANANI_OTP_MAX_ATTEMPTS) {
        janani_store_delete($pdo, $key);
        return false;
    }
    if (hash_equals($row['h'], hash_hmac('sha256', $code, janani_app_secret($pdo)))) {
        janani_store_delete($pdo, $key);
        return true;
    }
    $row['a'] = (int)($row['a'] ?? 0) + 1;
    $remaining = max(1, (int)$row['exp'] - time());
    if ($row['a'] >= JANANI_OTP_MAX_ATTEMPTS) {
        janani_store_delete($pdo, $key);
    } else {
        janani_store_set($pdo, $key, $row, $remaining);
    }
    return false;
}

function janani_mask_email($email) {
    $email = (string)$email;
    if (strpos($email, '@') === false) return $email;
    [$local, $domain] = explode('@', $email, 2);
    $visible = substr($local, 0, min(2, strlen($local)));
    return $visible . str_repeat('*', max(3, strlen($local) - 2)) . '@' . $domain;
}

function janani_is_placeholder_email($email) {
    $e = strtolower((string)$email);
    return $e === '' || substr($e, -16) === '@janani.customer' || $e === 'patron@jananiagro.com';
}

// ---------------------------------------------------------------------------
// SMTP mail (verified TLS, no credential guessing)
// ---------------------------------------------------------------------------

function janani_smtp_read($socket) {
    $data = '';
    while (($line = fgets($socket, 515)) !== false) {
        $data .= $line;
        if (strlen($line) < 4 || $line[3] === ' ') break;
    }
    return $data;
}

function janani_smtp_cmd($socket, $cmd, $expect) {
    fwrite($socket, $cmd . "\r\n");
    $resp = janani_smtp_read($socket);
    $code = (int)substr($resp, 0, 3);
    if (!in_array($code, (array)$expect, true)) {
        throw new RuntimeException('SMTP ' . trim($cmd === '' ? 'DATA' : explode(' ', $cmd)[0]) . ' failed: ' . trim($resp));
    }
    return $resp;
}

/**
 * Sends an HTML e-mail via the configured SMTP account (SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS).
 * Falls back to PHP mail() only when SMTP is not configured or unreachable.
 */
function janani_send_mail($to, $subject, $html, $options = []) {
    $to = trim((string)$to);
    if (!filter_var($to, FILTER_VALIDATE_EMAIL)) {
        return ['success' => false, 'error' => 'Invalid recipient address'];
    }
    $subject = str_replace(["\r", "\n"], ' ', (string)$subject);
    $host = janani_env('SMTP_HOST', 'smtp.gmail.com');
    $port = (int)janani_env('SMTP_PORT', '465');
    $user = janani_env('SMTP_USER', 'jananibiosciences.r@gmail.com');
    $pass = str_replace(' ', '', (string)janani_env('SMTP_PASS', 'gvwxapfllucnayzt'));
    $fromName = 'Janani Agro Products';
    $fromAddr = $user ?: ('noreply@' . preg_replace('/^www\./i', '', (string)($_SERVER['HTTP_HOST'] ?? 'jananiagroproducts.com')));
    $bcc = array_values(array_filter((array)($options['bcc'] ?? []), function ($a) use ($to) {
        return filter_var($a, FILTER_VALIDATE_EMAIL) && strcasecmp($a, $to) !== 0;
    }));

    $encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
    $headers = "MIME-Version: 1.0\r\n"
        . "Content-Type: text/html; charset=UTF-8\r\n"
        . "Content-Transfer-Encoding: base64\r\n"
        . "From: {$fromName} <{$fromAddr}>\r\n"
        . "Reply-To: {$fromAddr}\r\n"
        . "Date: " . date('r') . "\r\n"
        . "Message-ID: <" . bin2hex(random_bytes(12)) . '@' . (explode('@', $fromAddr)[1] ?? 'jananiagroproducts.com') . ">\r\n";
    $body = chunk_split(base64_encode($html), 76, "\r\n");

    $lastError = 'SMTP not configured';
    if ($user && $pass) {
        $attempts = $port === 587 ? [['tcp', 587], ['ssl', 465]] : [['ssl', $port ?: 465], ['tcp', 587]];
        foreach ($attempts as [$scheme, $p]) {
            $socket = null;
            try {
                $ctx = stream_context_create(['ssl' => [
                    'verify_peer' => true,
                    'verify_peer_name' => true,
                    'peer_name' => $host,
                    'allow_self_signed' => false,
                ]]);
                $socket = @stream_socket_client("{$scheme}://{$host}:{$p}", $errno, $errstr, 10, STREAM_CLIENT_CONNECT, $ctx);
                if (!$socket) {
                    throw new RuntimeException("Connection to {$host}:{$p} failed ({$errstr})");
                }
                stream_set_timeout($socket, 10);
                $greet = janani_smtp_read($socket);
                if ((int)substr($greet, 0, 3) !== 220) throw new RuntimeException('SMTP greeting failed');
                $ehloHost = preg_replace('/[^a-z0-9.-]/i', '', (string)($_SERVER['HTTP_HOST'] ?? 'jananiagroproducts.com')) ?: 'localhost';
                janani_smtp_cmd($socket, "EHLO {$ehloHost}", [250]);
                if ($scheme === 'tcp') {
                    janani_smtp_cmd($socket, 'STARTTLS', [220]);
                    if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLSv1_2_CLIENT | STREAM_CRYPTO_METHOD_TLSv1_3_CLIENT)) {
                        throw new RuntimeException('STARTTLS negotiation failed');
                    }
                    janani_smtp_cmd($socket, "EHLO {$ehloHost}", [250]);
                }
                janani_smtp_cmd($socket, 'AUTH LOGIN', [334]);
                janani_smtp_cmd($socket, base64_encode($user), [334]);
                janani_smtp_cmd($socket, base64_encode($pass), [235]);
                janani_smtp_cmd($socket, "MAIL FROM:<{$fromAddr}>", [250]);
                janani_smtp_cmd($socket, "RCPT TO:<{$to}>", [250, 251]);
                foreach ($bcc as $b) {
                    janani_smtp_cmd($socket, "RCPT TO:<{$b}>", [250, 251]);
                }
                janani_smtp_cmd($socket, 'DATA', [354]);
                $message = $headers . "To: <{$to}>\r\nSubject: {$encodedSubject}\r\n\r\n" . $body;
                janani_smtp_cmd($socket, $message . "\r\n.", [250]);
                @fwrite($socket, "QUIT\r\n");
                fclose($socket);
                return ['success' => true, 'method' => "smtp_{$p}"];
            } catch (Throwable $e) {
                $lastError = $e->getMessage();
                if ($socket) @fclose($socket);
            }
        }
        error_log('[janani] SMTP delivery failed: ' . $lastError);
    }

    // When falling back to PHP mail on shared hosting, use authorized domain envelope to pass SPF checks
    $domain = preg_replace('/^www\./i', '', (string)($_SERVER['HTTP_HOST'] ?? 'jananiagroproducts.com'));
    $mailFrom = "noreply@{$domain}";
    $mailHeaders = "MIME-Version: 1.0\r\n"
        . "Content-Type: text/html; charset=UTF-8\r\n"
        . "Content-Transfer-Encoding: base64\r\n"
        . "From: {$fromName} <{$mailFrom}>\r\n"
        . "Reply-To: jananibiosciences.r@gmail.com\r\n"
        . "Date: " . date('r') . "\r\n"
        . "Message-ID: <" . bin2hex(random_bytes(12)) . "@{$domain}>\r\n"
        . (empty($bcc) ? '' : 'Bcc: ' . implode(', ', $bcc) . "\r\n");
    $sent = @mail($to, $encodedSubject, $body, $mailHeaders, "-f {$mailFrom}");
    return $sent ? ['success' => true, 'method' => 'php_mail'] : ['success' => false, 'error' => $lastError];
}

// ---------------------------------------------------------------------------
// Catalogue pricing (exact port of frontend/src/lib/api.ts parseProductVariants
// + frontend/src/lib/catalog.ts resolveProductVariants/parseCartItems)
// ---------------------------------------------------------------------------

function janani_js_round($n) {
    return (float)floor((float)$n + 0.5);
}

function janani_num($v) {
    return is_numeric($v) ? (float)$v : 0.0;
}

function janani_get5l_price_api($p1) {
    $map = [450 => 2000, 380 => 1750, 550 => 2500, 600 => 2600, 420 => 1850, 390 => 1750, 480 => 2100, 520 => 2300, 410 => 1800, 650 => 2800];
    foreach ($map as $k => $v) {
        if ((float)$p1 === (float)$k) return (float)$v;
    }
    return janani_js_round($p1 * 4.4);
}

function janani_get5l_price_catalog($p1) {
    $map = [450 => 2000, 380 => 1750, 550 => 2500, 600 => 2600, 420 => 1850, 390 => 1750, 480 => 2100, 520 => 2300, 410 => 1800, 495 => 2200, 460 => 2050, 575 => 2550, 999 => 4400, 350 => 1550];
    foreach ($map as $k => $v) {
        if ((float)$p1 === (float)$k) return (float)$v;
    }
    return janani_js_round($p1 * 4.4);
}

function janani_get1l_price_catalog($p5) {
    $map = [5600 => 1250, 4900 => 1100, 5300 => 1150, 3600 => 850];
    foreach ($map as $k => $v) {
        if ((float)$p5 === (float)$k) return (float)$v;
    }
    return janani_js_round($p5 / 4.4);
}

function janani_unit_has($text, $needles) {
    $t = strtolower((string)$text);
    foreach ($needles as $n) {
        if (strpos($t, $n) !== false) return true;
    }
    return false;
}

/** Port of parseProductVariants() in api.ts (DB row -> Product.variants). */
function janani_parse_product_variants($rawVariants, $fallbackPrice, $fallbackUnit, $fallbackStock) {
    $list = [];
    if (is_array($rawVariants)) {
        $list = $rawVariants;
    } elseif (is_string($rawVariants) && trim($rawVariants) !== '') {
        $decoded = json_decode($rawVariants, true);
        if (is_array($decoded) && array_keys($decoded) === range(0, count($decoded) - 1)) $list = $decoded;
    }
    $fallbackPrice = (float)$fallbackPrice;

    if (count($list) === 0) {
        $origPrice = janani_js_round($fallbackPrice * 1.2);
        return [
            ['id' => '1l', 'name' => '1 L', 'label' => '1 L', 'unit' => '1 L', 'price' => $fallbackPrice, 'oldPrice' => $origPrice, 'stock' => $fallbackStock],
            ['id' => '5l', 'name' => '5 L', 'label' => '5 L', 'unit' => '5 L', 'price' => janani_get5l_price_api($fallbackPrice), 'oldPrice' => janani_js_round($origPrice * 4.5), 'stock' => max(10, (int)floor($fallbackStock / 2))],
        ];
    }

    $mapped = [];
    foreach (array_values($list) as $idx => $v) {
        if (!is_array($v)) $v = [];
        $price = janani_num($v['price'] ?? null) ?: ($fallbackPrice ?: 0.0);
        $orig = janani_num($v['originalPrice'] ?? ($v['oldPrice'] ?? ($v['old_price'] ?? null))) ?: janani_js_round($price * 1.2);
        $nameOrLabel = ($v['name'] ?? '') ?: (($v['label'] ?? '') ?: (($v['unit'] ?? '') ?: ('Variant ' . ($idx + 1))));
        $unit = ($v['unit'] ?? '') ?: (($v['name'] ?? '') ?: (($v['label'] ?? '') ?: ($fallbackUnit ?: '1 L')));
        $rawVid = $v['id'] ?? null;
        $id = ($rawVid !== null && $rawVid !== '' && $rawVid !== 0 && $rawVid !== false) ? (string)$rawVid : ('VAR-' . ($idx + 1));
        $stock = isset($v['stock']) ? (int)$v['stock'] : (isset($v['stockCount']) ? (int)$v['stockCount'] : (int)$fallbackStock);
        $mapped[] = ['id' => $id, 'name' => $nameOrLabel, 'label' => $nameOrLabel, 'unit' => $unit, 'price' => $price, 'oldPrice' => $orig, 'stock' => $stock];
    }

    $has5L = false;
    foreach ($mapped as $v) {
        if (janani_unit_has($v['unit'] ?: ($v['label'] ?: $v['name']), ['5 l', '5l', '5 litre'])) { $has5L = true; break; }
    }
    if (!$has5L) {
        $v1 = null;
        foreach ($mapped as $v) {
            if (janani_unit_has($v['unit'] ?: ($v['label'] ?: $v['name']), ['1 l', '1l', '1 litre'])) { $v1 = $v; break; }
        }
        if (!$v1) $v1 = $mapped[0];
        $p1 = janani_num($v1['price'] ?? null) ?: ($fallbackPrice ?: 450.0);
        $op1 = janani_num($v1['oldPrice'] ?? null) ?: janani_js_round($p1 * 1.2);
        $mapped[] = ['id' => '5l', 'name' => '5 L', 'label' => '5 L', 'unit' => '5 L', 'price' => janani_get5l_price_api($p1), 'oldPrice' => janani_js_round($op1 * 4.5), 'stock' => 50];
    }
    return $mapped;
}

/** Port of resolveProductVariants() in catalog.ts (Product -> priced variants shown in cart). */
function janani_resolve_variants($product) {
    $price = (float)($product['price'] ?? 0);
    $unit = (string)(($product['unit'] ?? '') ?: '1 kg');
    $stock = (int)($product['stock'] ?? 50);
    $slug = (string)($product['slug'] ?? '');

    $rawList = janani_parse_product_variants($product['variants'] ?? null, $price, $unit, $stock);
    $vars = [];
    foreach ($rawList as $idx => $v) {
        $vp = janani_num($v['price'] ?? null) ?: ($price ?: 0.0);
        $vars[] = [
            'id' => (string)(($v['id'] ?? '') !== '' ? $v['id'] : ('var-' . ($idx + 1))),
            'name' => ($v['name'] ?? '') ?: (($v['label'] ?? '') ?: (($v['unit'] ?? '') ?: ('Variant ' . ($idx + 1)))),
            'label' => ($v['label'] ?? '') ?: (($v['name'] ?? '') ?: (($v['unit'] ?? '') ?: ('Variant ' . ($idx + 1)))),
            'unit' => ($v['unit'] ?? '') ?: (($v['name'] ?? '') ?: (($v['label'] ?? '') ?: '1 L')),
            'price' => $vp,
            'oldPrice' => janani_num($v['oldPrice'] ?? null) ?: janani_js_round($vp * 1.2),
            'stock' => isset($v['stock']) ? (int)$v['stock'] : ($stock ?: 50),
        ];
    }

    $has5L = false;
    $has1L = false;
    foreach ($vars as $v) {
        $u = $v['unit'] ?: ($v['label'] ?: $v['name']);
        if (janani_unit_has($u, ['5 l', '5l', '5 litre'])) $has5L = true;
        if (janani_unit_has($u, ['1 l', '1l', '1 litre'])) $has1L = true;
    }
    $isProduct5L = janani_unit_has($unit, ['5 l', '5l']) || strpos($slug, '-5l') !== false;
    $basePrice = $price ?: 450.0;
    $baseOld = janani_num($product['old_price'] ?? null) ?: janani_js_round($basePrice * 1.2);

    if (count($vars) <= 1) {
        $p1 = $isProduct5L ? janani_get1l_price_catalog($basePrice) : $basePrice;
        $op1 = $isProduct5L ? janani_js_round($p1 * 1.2) : $baseOld;
        $p5 = $isProduct5L ? $basePrice : janani_get5l_price_catalog($basePrice);
        $op5 = $isProduct5L ? $baseOld : janani_js_round($baseOld * 4.5);
        return [
            ['id' => '1l', 'name' => '1 L', 'label' => '1 L', 'unit' => '1 L', 'price' => $p1, 'oldPrice' => $op1, 'stock' => $stock ?: 100],
            ['id' => '5l', 'name' => '5 L', 'label' => '5 L', 'unit' => '5 L', 'price' => $p5, 'oldPrice' => $op5, 'stock' => $stock ?: 50],
        ];
    }
    if (!$has5L) {
        $v1 = null;
        foreach ($vars as $v) {
            if (janani_unit_has($v['unit'] ?: ($v['label'] ?: $v['name']), ['1 l', '1l', '1 litre'])) { $v1 = $v; break; }
        }
        if (!$v1) $v1 = $vars[0];
        $p1 = janani_num($v1['price'] ?? null) ?: $basePrice;
        $p5 = janani_get5l_price_catalog($p1);
        $vars[] = ['id' => '5l', 'name' => '5 L', 'label' => '5 L', 'unit' => '5 L', 'price' => $p5, 'oldPrice' => janani_js_round($p5 * 1.2), 'stock' => 50];
    }
    if (!$has1L && $isProduct5L) {
        $v5 = null;
        foreach ($vars as $v) {
            if (janani_unit_has($v['unit'] ?: ($v['label'] ?: $v['name']), ['5 l', '5l', '5 litre'])) { $v5 = $v; break; }
        }
        if (!$v5) $v5 = $vars[0];
        $p5 = janani_num($v5['price'] ?? null) ?: $basePrice;
        $p1 = janani_get1l_price_catalog($p5);
        array_unshift($vars, ['id' => '1l', 'name' => '1 L', 'label' => '1 L', 'unit' => '1 L', 'price' => $p1, 'oldPrice' => janani_js_round($p1 * 1.2), 'stock' => 100]);
    }
    return $vars;
}

/** Port of the variant matching inside parseCartItems() (catalog.ts). */
function janani_match_variant($vars, $variantKey, $variantId) {
    $variantKey = strtolower(trim((string)$variantKey));
    if ($variantKey !== '') {
        foreach ($vars as $v) {
            if (strtolower($v['id']) === $variantKey) return $v;
        }
    }
    $variantId = strtolower(trim((string)$variantId)) ?: '1l';
    foreach ($vars as $v) {
        if (strtolower($v['id']) === $variantId) return $v;
        if ($variantId === '5l' && (strpos($v['unit'], '5') !== false || strpos($v['label'], '5') !== false || strpos($v['id'], '5') !== false)) return $v;
    }
    if ($variantId === '1l') {
        foreach ($vars as $v) {
            if (strpos($v['unit'], '1') !== false || strpos($v['label'], '1') !== false || strpos($v['id'], '1') !== false) return $v;
        }
    }
    return $vars[0] ?? null;
}

function janani_find_product($pdo, $item) {
    $candidates = [];
    foreach (['productId', 'product_id', 'id'] as $k) {
        if (isset($item[$k]) && $item[$k] !== '' && $item[$k] !== null) $candidates[] = (string)$item[$k];
    }
    if (!empty($item['cartKey']) && strpos((string)$item['cartKey'], '__') !== false) {
        $candidates[] = explode('__', (string)$item['cartKey'])[0];
    }
    if (!empty($item['slug'])) $candidates[] = (string)$item['slug'];
    foreach ($candidates as $c) {
        $c = trim($c);
        if ($c === '') continue;
        if (ctype_digit($c)) {
            $st = $pdo->prepare("SELECT * FROM `products` WHERE `id` = ? LIMIT 1");
            $st->execute([(int)$c]);
        } else {
            $st = $pdo->prepare("SELECT * FROM `products` WHERE `slug` = ? OR `slug` = ? LIMIT 1");
            $st->execute([$c, strtolower($c)]);
        }
        $row = $st->fetch(PDO::FETCH_ASSOC);
        if ($row) return $row;
    }
    return null;
}

/**
 * Prices a cart from the database. Client-sent prices are ignored.
 * Returns ['lines' => [...], 'subtotal' => float, 'errors' => [...]].
 */
function janani_price_items($pdo, $items) {
    $lines = [];
    $errors = [];
    $merged = [];
    if (!is_array($items) || count($items) === 0) {
        return ['lines' => [], 'subtotal' => 0.0, 'errors' => ['Your cart is empty.']];
    }
    if (count($items) > 50) {
        return ['lines' => [], 'subtotal' => 0.0, 'errors' => ['Too many items in one order.']];
    }
    foreach ($items as $it) {
        if (!is_array($it)) continue;
        $qty = (int)($it['quantity'] ?? ($it['qty'] ?? 0));
        if ($qty <= 0) continue;
        if ($qty > JANANI_MAX_QTY_PER_LINE) {
            $errors[] = 'Maximum ' . JANANI_MAX_QTY_PER_LINE . ' units allowed per product.';
            continue;
        }
        $prod = janani_find_product($pdo, $it);
        $label = (string)($it['name'] ?? 'A product');
        if (!$prod) {
            $errors[] = "{$label} is no longer available.";
            continue;
        }
        $inactive = (isset($prod['active']) && (string)$prod['active'] === '0') || strcasecmp((string)($prod['status'] ?? ''), 'Trash') === 0 || strcasecmp((string)($prod['status'] ?? ''), 'Inactive') === 0;
        if ($inactive) {
            $errors[] = "{$prod['name']} is currently unavailable.";
            continue;
        }
        $vars = janani_resolve_variants($prod);
        $cartVariant = '';
        if (!empty($it['cartKey']) && strpos((string)$it['cartKey'], '__') !== false) {
            $cartVariant = explode('__', (string)$it['cartKey'])[1] ?? '';
        }
        $variant = janani_match_variant($vars, $it['variantKey'] ?? ($it['variant']['id'] ?? $cartVariant), $it['variantId'] ?? ($cartVariant ?: '1l'));
        if (!$variant) {
            $errors[] = "{$prod['name']} has no purchasable size.";
            continue;
        }
        $unitPrice = round((float)($variant['price'] ?: $prod['price']), 2);
        if ($unitPrice <= 0) {
            $errors[] = "{$prod['name']} has no valid price.";
            continue;
        }
        $key = $prod['id'] . '__' . strtolower($variant['id']);
        if (isset($merged[$key])) {
            $lines[$merged[$key]]['quantity'] += $qty;
            $lines[$merged[$key]]['lineTotal'] = round($lines[$merged[$key]]['quantity'] * $unitPrice, 2);
            continue;
        }
        $merged[$key] = count($lines);
        $lines[] = [
            'productId' => (int)$prod['id'],
            'slug' => $prod['slug'],
            'sku' => $prod['sku'] ?? null,
            'name' => $prod['name'],
            'variantId' => $variant['id'],
            'unit' => $variant['unit'],
            'price' => $unitPrice,
            'quantity' => $qty,
            'lineTotal' => round($unitPrice * $qty, 2),
            'gstRate' => (isset($prod['gst_rate']) && $prod['gst_rate'] !== null && $prod['gst_rate'] !== '' && is_numeric($prod['gst_rate'])) ? (float)$prod['gst_rate'] : 5.0,
            'image' => $it['image'] ?? ($prod['image'] ?? null),
        ];
    }
    foreach ($lines as $l) {
        if ($l['quantity'] > JANANI_MAX_QTY_PER_LINE) $errors[] = 'Maximum ' . JANANI_MAX_QTY_PER_LINE . ' units allowed per product.';
    }
    $subtotal = 0.0;
    foreach ($lines as $l) $subtotal += $l['lineTotal'];
    if (count($lines) === 0 && empty($errors)) $errors[] = 'Your cart is empty.';
    return ['lines' => $lines, 'subtotal' => round($subtotal, 2), 'errors' => array_values(array_unique($errors))];
}

function janani_coupon_is_free_shipping($coupon) {
    $code = (string)($coupon['code'] ?? '');
    return !empty($coupon['is_free_shipping']) || ($coupon['type'] ?? '') === 'free_shipping' || ($coupon['type'] ?? '') === 'free_delivery'
        || stripos($code, 'FREESHIP') !== false || stripos($code, 'FREEDEL') !== false;
}

/** Validates a coupon against the database (status, dates, minimum, global + per-customer limits). */
function janani_validate_coupon($pdo, $code, $subtotal, $shippingFee, $user = null) {
    $code = strtoupper(trim((string)$code));
    if ($code === '') return ['ok' => false, 'discount' => 0.0, 'message' => 'Please enter a coupon code.'];
    $st = $pdo->prepare("SELECT * FROM `coupons` WHERE UPPER(`code`) = ? LIMIT 1");
    $st->execute([$code]);
    $c = $st->fetch(PDO::FETCH_ASSOC);
    if (!$c) return ['ok' => false, 'discount' => 0.0, 'message' => "Coupon '{$code}' is invalid."];
    if (empty($c['active'])) return ['ok' => false, 'discount' => 0.0, 'message' => "Coupon '{$code}' is not active."];
    $today = date('Y-m-d');
    if (!empty($c['start_date']) && substr((string)$c['start_date'], 0, 10) > $today) return ['ok' => false, 'discount' => 0.0, 'message' => "Coupon '{$code}' is not active yet."];
    if (!empty($c['expiry_date']) && substr((string)$c['expiry_date'], 0, 10) < $today) return ['ok' => false, 'discount' => 0.0, 'message' => "Coupon '{$code}' has expired."];
    $minCart = (float)($c['min_cart'] ?? 0);
    if ($minCart > 0 && $subtotal < $minCart) {
        return ['ok' => false, 'discount' => 0.0, 'message' => "{$c['code']} needs a minimum cart value of ₹" . number_format($minCart, 0) . '.'];
    }

    $countSql = "SELECT COUNT(*) FROM `orders` WHERE UPPER(`coupon_code`) = ? AND (`order_status` IS NULL OR `order_status` NOT IN ('Cancelled', 'Payment Failed'))";
    $maxUses = (int)($c['max_uses'] ?? 0);
    if ($maxUses > 0) {
        $q = $pdo->prepare($countSql);
        $q->execute([$code]);
        if ((int)$q->fetchColumn() >= $maxUses) return ['ok' => false, 'discount' => 0.0, 'message' => "Coupon '{$code}' has reached its usage limit."];
    }
    if ($user) {
        $email = strtolower((string)($user['email'] ?? ''));
        $perUser = (int)($c['per_user_limit'] ?? 0);
        if ($perUser > 0) {
            $q = $pdo->prepare($countSql . " AND (LOWER(`customer_email`) = ? OR `customer_id` = ?)");
            $q->execute([$code, $email, (string)$user['id']]);
            if ((int)$q->fetchColumn() >= $perUser) return ['ok' => false, 'discount' => 0.0, 'message' => "You have already used coupon '{$code}'."];
        }
        if (!empty($c['is_first_order_only'])) {
            $q = $pdo->prepare("SELECT COUNT(*) FROM `orders` WHERE (LOWER(`customer_email`) = ? OR `customer_id` = ?) AND (`order_status` IS NULL OR `order_status` NOT IN ('Cancelled', 'Payment Failed'))");
            $q->execute([$email, (string)$user['id']]);
            if ((int)$q->fetchColumn() > 0) return ['ok' => false, 'discount' => 0.0, 'message' => "Coupon '{$code}' is valid on your first order only."];
        }
    }

    $value = (float)($c['discount'] ?? 0);
    if (janani_coupon_is_free_shipping($c)) {
        $discount = (float)$shippingFee;
    } elseif (($c['type'] ?? '') === 'percentage') {
        $raw = ($subtotal * $value) / 100;
        $max = (float)($c['max_discount'] ?? 0);
        $discount = $max > 0 ? min($raw, $max) : $raw;
    } elseif (($c['type'] ?? '') === 'flat') {
        $discount = min($value, $subtotal);
    } else {
        $discount = 0.0;
    }
    return ['ok' => true, 'discount' => round(max(0, $discount), 2), 'coupon' => $c, 'message' => "Coupon '{$c['code']}' applied."];
}

/** Full server-side quote: the only source of truth for what a customer pays. */
function janani_build_quote($pdo, $user, $items, $couponCode = '', $useWallet = false) {
    $priced = janani_price_items($pdo, $items);
    $subtotal = $priced['subtotal'];
    $shipping = ($subtotal >= JANANI_FREE_SHIPPING_THRESHOLD || $subtotal == 0) ? 0.0 : (float)JANANI_STANDARD_SHIPPING_FEE;
    // GST: each product at its own admin-configured rate (default 5%), split equally into CGST + SGST.
    // Must stay identical to the calculation in frontend/src/routes/checkout.tsx.
    $gstRaw = 0.0;
    foreach ($priced['lines'] as $gl) {
        $gstRaw += ($gl['price'] * $gl['quantity'] * (float)($gl['gstRate'] ?? 5)) / 100;
    }
    $gst = round($gstRaw, 2);
    $cgst = round($gst / 2, 2);
    $sgst = round($gst - $cgst, 2);
    $discount = 0.0;
    $appliedCode = null;
    $couponMessage = null;
    if (trim((string)$couponCode) !== '' && empty($priced['errors'])) {
        $cv = janani_validate_coupon($pdo, $couponCode, $subtotal, $shipping, $user);
        $couponMessage = $cv['message'];
        if ($cv['ok']) {
            $discount = $cv['discount'];
            $appliedCode = strtoupper((string)$cv['coupon']['code']);
        }
    }
    // Wallet credit (first-order reward): applies to the products value after coupon, never to delivery / GST
    $productsValue = round(max(0, $subtotal - $discount), 2);
    $walletDeduction = 0.0;
    $walletCredits = [];
    $walletMessage = null;
    if ($useWallet && empty($priced['errors'])) {
        $wr = janani_wallet_redemption($pdo, $user, $productsValue);
        $walletDeduction = $wr['amount'];
        $walletCredits = $wr['credits'];
        $walletMessage = $wr['message'];
    }
    $total = round(max(0, $subtotal + $gst + $shipping - $discount - $walletDeduction), 2);
    return [
        'lines' => $priced['lines'],
        'errors' => $priced['errors'],
        'subtotal' => $subtotal,
        'cgst' => $cgst,
        'sgst' => $sgst,
        'gstAmount' => $gst,
        'shippingFee' => $shipping,
        'couponCode' => $appliedCode,
        'couponDiscount' => $discount,
        'couponMessage' => $couponMessage,
        'productsValue' => $productsValue,
        'walletDeduction' => $walletDeduction,
        'walletCredits' => $walletCredits,
        'walletMessage' => $walletMessage,
        'total' => $total,
    ];
}

// ---------------------------------------------------------------------------
// Order numbering (atomic counter, no collisions, no 1000-order ceiling)
// ---------------------------------------------------------------------------

function janani_seed_order_counter($pdo) {
    try {
        $max = (int)$pdo->query("SELECT COALESCE(MAX(CAST(SUBSTRING(`number`, 5) AS UNSIGNED)), 0) FROM `orders` WHERE `number` REGEXP '^JAP-[0-9]{1,4}$'")->fetchColumn();
        $max2 = (int)$pdo->query("SELECT COALESCE(MAX(CAST(SUBSTRING(`id`, 5) AS UNSIGNED)), 0) FROM `orders` WHERE `id` REGEXP '^JAP-[0-9]{1,4}$'")->fetchColumn();
        $pdo->prepare("INSERT INTO `order_counters` (`name`, `value`) VALUES ('JAP', ?) ON DUPLICATE KEY UPDATE `value` = GREATEST(`value`, VALUES(`value`))")->execute([max($max, $max2)]);
    } catch (Throwable $e) {
        error_log('[janani] order counter seed: ' . $e->getMessage());
    }
}

function janani_format_order_number($n) {
    return 'JAP-' . str_pad((string)$n, 3, '0', STR_PAD_LEFT);
}

function janani_next_order_number($pdo) {
    $up = $pdo->prepare("UPDATE `order_counters` SET `value` = LAST_INSERT_ID(`value` + 1) WHERE `name` = 'JAP'");
    $up->execute();
    if ($up->rowCount() === 0) {
        janani_seed_order_counter($pdo);
        $up->execute();
        if ($up->rowCount() === 0) {
            throw new RuntimeException('Order counter unavailable');
        }
    }
    $n = (int)$pdo->query("SELECT LAST_INSERT_ID()")->fetchColumn();
    return janani_format_order_number(max(1, $n));
}

function janani_peek_order_number($pdo) {
    try {
        $v = (int)$pdo->query("SELECT `value` FROM `order_counters` WHERE `name` = 'JAP' LIMIT 1")->fetchColumn();
        return janani_format_order_number($v + 1);
    } catch (Throwable $e) {
        return 'JAP-001';
    }
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

function janani_json_field($value, $default = []) {
    if (is_array($value)) return $value;
    if (is_string($value) && $value !== '') {
        $d = json_decode($value, true);
        return $d === null ? $default : $d;
    }
    return $default;
}

/** Adds the camelCase aliases the storefront/admin expect. */
function janani_format_order($o) {
    if (!is_array($o)) return $o;
    $o['orderNumber'] = $o['number'] ?? null;
    $o['shippingAddress'] = janani_json_field($o['shipping_address'] ?? null, []);
    $o['billingAddress'] = janani_json_field($o['billing_address'] ?? null, []);
    $o['address'] = $o['shippingAddress'];
    $o['items'] = janani_json_field($o['items'] ?? null, []);
    $o['timeline'] = janani_json_field($o['timeline'] ?? null, []);
    $o['adminNotes'] = janani_json_field($o['admin_notes'] ?? null, []);
    $o['returnInfo'] = janani_json_field($o['return_info'] ?? null, null);
    $o['customerName'] = $o['customer_name'] ?? '';
    $o['customerEmail'] = $o['customer_email'] ?? '';
    $o['customerPhone'] = $o['customer_phone'] ?? '';
    $o['customer'] = [
        'id' => $o['customer_id'] ?? '',
        'name' => $o['customer_name'] ?? '',
        'fullName' => $o['customer_name'] ?? '',
        'email' => $o['customer_email'] ?? '',
        'phone' => $o['customer_phone'] ?? '',
    ];
    $o['orderStatus'] = $o['order_status'] ?? null;
    $o['status'] = $o['order_status'] ?? null;
    $o['paymentStatus'] = $o['payment_status'] ?? null;
    $o['paymentMethod'] = $o['payment_method'] ?? null;
    $o['transactionId'] = $o['transaction_id'] ?? null;
    $o['couponCode'] = $o['coupon_code'] ?? null;
    $o['couponDiscount'] = (float)($o['coupon_discount'] ?? 0);
    $o['walletDeduction'] = (float)($o['wallet_deduction'] ?? 0);
    $o['gstAmount'] = (float)($o['gst_amount'] ?? 0);
    $o['deliverySlot'] = $o['delivery_slot'] ?? null;
    $o['expectedDelivery'] = $o['expected_delivery'] ?? null;
    $o['deliveryFee'] = (float)($o['delivery_fee'] ?? 0);
    $o['shippingFee'] = (float)($o['delivery_fee'] ?? 0);
    $o['subtotal'] = (float)($o['subtotal'] ?? 0);
    $o['discount'] = (float)($o['discount'] ?? 0);
    $o['total'] = (float)($o['total'] ?? 0);
    $o['finalTotal'] = (float)($o['total'] ?? 0);
    $o['refundAmount'] = (float)($o['refund_amount'] ?? 0);
    return $o;
}

/** Minimal, non-personal view for public "track my order" lookups. */
function janani_public_tracking_view($o) {
    $f = janani_format_order($o);
    $addr = $f['shippingAddress'];
    $items = [];
    foreach ((array)$f['items'] as $it) {
        $items[] = ['name' => $it['name'] ?? '', 'quantity' => $it['quantity'] ?? ($it['qty'] ?? 1), 'unit' => $it['unit'] ?? null, 'image' => $it['image'] ?? null];
    }
    return [
        'number' => $f['number'],
        'orderNumber' => $f['number'],
        'order_date' => $f['order_date'] ?? null,
        'created_at' => $f['created_at'] ?? null,
        'status' => $f['status'],
        'orderStatus' => $f['status'],
        'order_status' => $f['status'],
        'paymentStatus' => $f['paymentStatus'],
        'courier' => $f['courier'] ?? null,
        'tracking_id' => $f['tracking_id'] ?? null,
        'trackingId' => $f['tracking_id'] ?? null,
        'awb' => $f['awb'] ?? null,
        'expectedDelivery' => $f['expectedDelivery'],
        'timeline' => $f['timeline'],
        'items' => $items,
        'total' => $f['total'],
        'shippingAddress' => ['city' => $addr['city'] ?? '', 'state' => $addr['state'] ?? '', 'pincode' => $addr['pincode'] ?? ''],
        'limitedView' => true,
    ];
}

function janani_user_owns_order($user, $order) {
    if (!$user || !$order) return false;
    if (!empty($order['customer_id']) && (string)$order['customer_id'] === (string)$user['id']) return true;
    $ue = strtolower(trim((string)($user['email'] ?? '')));
    $oe = strtolower(trim((string)($order['customer_email'] ?? '')));
    return $ue !== '' && $oe !== '' && !janani_is_placeholder_email($ue) && $ue === $oe;
}

function janani_find_order($pdo, $idOrNumber) {
    $st = $pdo->prepare("SELECT * FROM `orders` WHERE `number` = ? OR `id` = ? LIMIT 1");
    $st->execute([$idOrNumber, $idOrNumber]);
    return $st->fetch(PDO::FETCH_ASSOC) ?: null;
}

function janani_append_timeline($pdo, $order, $title, $done = true) {
    $timeline = janani_json_field($order['timeline'] ?? null, []);
    foreach ($timeline as &$t) {
        if (is_array($t)) $t['current'] = false;
    }
    unset($t);
    $timeline[] = ['title' => $title, 'time' => date('d M Y, h:i A'), 'location' => '', 'done' => $done, 'current' => true];
    $pdo->prepare("UPDATE `orders` SET `timeline` = ? WHERE `id` = ?")->execute([json_encode($timeline, JSON_UNESCAPED_UNICODE), $order['id']]);
}

function janani_restock_order_items($pdo, $order) {
    $items = janani_json_field($order['items'] ?? null, []);
    foreach ($items as $it) {
        $qty = (int)($it['quantity'] ?? ($it['qty'] ?? 0));
        if ($qty <= 0) continue;
        $pid = $it['productId'] ?? ($it['id'] ?? null);
        if ($pid !== null && ctype_digit((string)$pid)) {
            $pdo->prepare("UPDATE `products` SET `stock` = `stock` + ? WHERE `id` = ?")->execute([$qty, (int)$pid]);
        } elseif (!empty($it['sku'])) {
            $pdo->prepare("UPDATE `products` SET `stock` = `stock` + ? WHERE `sku` = ? LIMIT 1")->execute([$qty, $it['sku']]);
        } elseif (!empty($it['slug'])) {
            $pdo->prepare("UPDATE `products` SET `stock` = `stock` + ? WHERE `slug` = ? LIMIT 1")->execute([$qty, $it['slug']]);
        }
    }
}

function janani_default_timeline($isPaidOnline, $courier, $slot) {
    $now = date('d M Y, h:i A');
    return [
        ['title' => 'Order Placed', 'time' => $now, 'location' => 'Janani Agro Products', 'done' => true, 'current' => !$isPaidOnline],
        ['title' => $isPaidOnline ? 'Payment Confirmed (Razorpay)' : 'Cash on Delivery – pay when your order arrives', 'time' => $isPaidOnline ? $now : 'At delivery', 'location' => '', 'done' => $isPaidOnline, 'current' => $isPaidOnline],
        ['title' => 'Packed & Quality Checked', 'time' => 'Pending', 'location' => 'Lodhika GIDC Facility, Rajkot', 'done' => false, 'current' => false],
        ['title' => 'Shipped' . ($courier ? " via {$courier}" : ''), 'time' => 'Pending', 'location' => '', 'done' => false, 'current' => false],
        ['title' => 'Out for Delivery', 'time' => $slot ?: 'Pending', 'location' => '', 'done' => false, 'current' => false],
        ['title' => 'Delivered', 'time' => 'Pending', 'location' => 'Customer Address', 'done' => false, 'current' => false],
    ];
}

/** Cleans the delivery address the customer typed (text only, bounded length). */
function janani_clean_address($addr) {
    if (!is_array($addr)) return [];
    $allowed = ['id', 'name', 'fullName', 'phone', 'email', 'houseFlat', 'street', 'streetAddress', 'address', 'landmark', 'city', 'district', 'state', 'pincode', 'country', 'type', 'label', 'alternatePhone'];
    $out = [];
    foreach ($allowed as $k) {
        if (isset($addr[$k]) && is_scalar($addr[$k])) {
            $out[$k] = mb_substr(trim(strip_tags((string)$addr[$k])), 0, 300);
        }
    }
    return $out;
}

/**
 * Persists an order whose amounts come exclusively from a server quote.
 * $payment = ['method' => ..., 'status' => ..., 'transactionId' => ..., 'razorpayOrderId' => ..., 'strictStock' => bool]
 */
function janani_insert_order($pdo, $user, $quote, $address, $payment, $extra = []) {
    $address = janani_clean_address($address);
    $customerName = trim((string)($address['fullName'] ?? ($address['name'] ?? ''))) ?: (string)($user['name'] ?? 'Customer');
    $userEmail = strtolower(trim((string)($user['email'] ?? '')));
    $addrEmail = strtolower(trim((string)($address['email'] ?? '')));
    $customerEmail = (!janani_is_placeholder_email($userEmail)) ? $userEmail : (filter_var($addrEmail, FILTER_VALIDATE_EMAIL) ? $addrEmail : $userEmail);
    $customerPhone = trim((string)($address['phone'] ?? '')) ?: (string)($user['phone'] ?? '');
    $courier = 'Delhivery Air Express & Janani Fleet';
    $slot = mb_substr(trim(strip_tags((string)($extra['deliverySlot'] ?? 'Standard Delivery (2-3 Business Days)'))), 0, 150);
    $isPaidOnline = ($payment['status'] === 'Paid');
    $timeline = janani_default_timeline($isPaidOnline, $courier, $slot);
    $notes = mb_substr(trim(strip_tags((string)($extra['orderNotes'] ?? ''))), 0, 1000);
    $warnings = [];
    $postWarnings = [];

    $pdo->beginTransaction();
    try {
        // Stock: reserve atomically. COD orders fail on shortage; already-paid orders are kept and flagged.
        foreach ($quote['lines'] as $line) {
            $up = $pdo->prepare("UPDATE `products` SET `stock` = `stock` - ? WHERE `id` = ? AND `stock` >= ?");
            $up->execute([$line['quantity'], $line['productId'], $line['quantity']]);
            if ($up->rowCount() === 0) {
                if (!empty($payment['strictStock'])) {
                    $pdo->rollBack();
                    return ['success' => false, 'outOfStock' => true, 'message' => "Sorry, {$line['name']} ({$line['unit']}) does not have enough stock for {$line['quantity']} unit(s)."];
                }
                $pdo->prepare("UPDATE `products` SET `stock` = GREATEST(0, `stock` - ?) WHERE `id` = ?")->execute([$line['quantity'], $line['productId']]);
                $warnings[] = "Stock shortfall for {$line['name']} ({$line['unit']}) – please verify inventory before dispatch.";
            }
        }

        $number = null;
        $lastErr = null;
        for ($i = 0; $i < 20; $i++) {
            $candidate = janani_next_order_number($pdo);
            try {
                $st = $pdo->prepare("INSERT INTO `orders` (
                    `id`, `number`, `order_date`, `customer_id`, `customer_name`, `customer_email`, `customer_phone`,
                    `shipping_address`, `billing_address`, `items`, `subtotal`, `discount`, `coupon_code`, `coupon_discount`,
                    `wallet_deduction`, `gst_amount`, `delivery_fee`, `total`, `payment_method`, `payment_status`, `transaction_id`,
                    `razorpay_order_id`, `order_status`, `courier`, `warehouse`, `delivery_slot`, `expected_delivery`, `timeline`, `admin_notes`, `order_notes`
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Processing', ?, ?, ?, ?, ?, ?, ?)");
                $st->execute([
                    $candidate, $candidate, date('d M Y, h:i A'), (string)$user['id'], $customerName, $customerEmail, $customerPhone,
                    json_encode($address, JSON_UNESCAPED_UNICODE), json_encode($address, JSON_UNESCAPED_UNICODE),
                    json_encode($quote['lines'], JSON_UNESCAPED_UNICODE), $quote['subtotal'], $quote['couponDiscount'], $quote['couponCode'], $quote['couponDiscount'],
                    round((float)($quote['walletDeduction'] ?? 0), 2), $quote['gstAmount'], $quote['shippingFee'], $quote['total'], $payment['method'], $payment['status'], $payment['transactionId'] ?? null,
                    $payment['razorpayOrderId'] ?? null, $courier, 'Lodhika GIDC Central Facility, Rajkot', $slot, '2-3 Business Days',
                    json_encode($timeline, JSON_UNESCAPED_UNICODE),
                    json_encode(array_map(function ($w) { return ['id' => 'NOTE-' . bin2hex(random_bytes(4)), 'text' => $w, 'author' => 'System', 'date' => date('d M Y, h:i A')]; }, $warnings), JSON_UNESCAPED_UNICODE),
                    $notes !== '' ? $notes : null,
                ]);
                $number = $candidate;
                break;
            } catch (PDOException $e) {
                $lastErr = $e;
                if ((int)($e->errorInfo[1] ?? 0) !== 1062) throw $e; // only retry on duplicate key
            }
        }
        if (!$number) throw $lastErr ?: new RuntimeException('Could not allocate an order number');

        // Wallet credit is consumed in the same transaction as the order (one-time use)
        foreach ((array)($quote['walletCredits'] ?? []) as $wc) {
            $useCredit = $pdo->prepare("UPDATE `wallet_credits` SET `status` = 'used', `used_order` = ?, `used_amount` = ?, `used_at` = NOW(), `closed_at` = NOW()
                WHERE `id` = ? AND `user_id` = ? AND `status` = 'active' AND `expires_at` > NOW()");
            $useCredit->execute([$number, $wc['amount'], $wc['id'], (string)$user['id']]);
            if ($useCredit->rowCount() === 0) {
                if (!empty($payment['strictStock'])) {
                    $pdo->rollBack();
                    return ['success' => false, 'walletInvalid' => true, 'message' => 'Your wallet credit is no longer available (it may have expired or been used). Please review your order and try again.'];
                }
                $postWarnings[] = "Wallet credit {$wc['id']} (₹{$wc['amount']}) was already used or expired when this paid order was recorded – please review.";
            }
        }

        if (!empty($quote['couponCode'])) {
            $pdo->prepare("UPDATE `coupons` SET `uses` = COALESCE(`uses`, 0) + 1 WHERE UPPER(`code`) = ?")->execute([$quote['couponCode']]);
        }
        $pdo->commit();
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        throw $e;
    }

    // Keep the customer's profile address in sync (first address only, never overwrites)
    try {
        if (!empty($address['city']) || !empty($address['street']) || !empty($address['streetAddress'])) {
            $pdo->prepare("UPDATE `users` SET
                `city` = IF(`city` IS NULL OR `city` = '', ?, `city`),
                `state` = IF(`state` IS NULL OR `state` = '', ?, `state`),
                `pincode` = IF(`pincode` IS NULL OR `pincode` = '', ?, `pincode`),
                `phone` = IF(`phone` IS NULL OR `phone` = '', ?, `phone`)
                WHERE `id` = ?")->execute([$address['city'] ?? '', $address['state'] ?? '', $address['pincode'] ?? '', $customerPhone, $user['id']]);
        }
    } catch (Throwable $e) {}

    if (!empty($quote['walletCredits'])) {
        janani_sync_wallet_balance($pdo, (string)$user['id']);
    }
    $order = janani_find_order($pdo, $number);
    if (!empty($postWarnings) && $order) {
        try {
            $adminNotes = janani_json_field($order['admin_notes'] ?? null, []);
            foreach ($postWarnings as $w) {
                $adminNotes[] = ['id' => 'NOTE-' . bin2hex(random_bytes(4)), 'text' => $w, 'author' => 'System', 'date' => date('d M Y, h:i A')];
            }
            $pdo->prepare("UPDATE `orders` SET `admin_notes` = ? WHERE `id` = ?")->execute([json_encode($adminNotes, JSON_UNESCAPED_UNICODE), $order['id']]);
            $order = janani_find_order($pdo, $number);
        } catch (Throwable $e) {}
    }
    // First-order reward (10% wallet credit, 90 days) - no-op when the customer is not eligible
    $reward = janani_grant_first_order_reward($pdo, $user, $order);
    if ($reward) {
        $order = janani_find_order($pdo, $number);
    }
    return ['success' => true, 'order' => $order, 'warnings' => array_merge($warnings, $postWarnings), 'reward' => $reward];
}

// ---------------------------------------------------------------------------
// Razorpay
// ---------------------------------------------------------------------------

// Keys that must never be used (publicly exposed LIVE keys). The old exposed key was a test key, which cannot move
// real money, so it is allowed again for test mode.
const JANANI_LEAKED_RAZORPAY_KEYS = [];

// TEMPORARY test-mode fallback so checkout can be tested before environment variables are wired up.
// Paste a Razorpay TEST key pair (rzp_test_...) between the quotes. Only test keys are accepted here (they cannot
// move real money) and they are used only when no keys come from the environment / admin settings.
// Before going live: set RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET (rzp_live_...) in the environment and empty these.
const JANANI_TEST_FALLBACK_KEY_ID = 'rzp_test_SwedUUn1KgRMs0';
const JANANI_TEST_FALLBACK_KEY_SECRET = 'xdW2Ry7T67sUK4zMKb3oOsZh';

function janani_razorpay_keys($pdo) {
    $keyId = janani_env('RAZORPAY_KEY_ID');
    $secret = janani_env('RAZORPAY_KEY_SECRET');
    $webhook = janani_env('RAZORPAY_WEBHOOK_SECRET');
    $keysFromAdmin = false;
    if ((!$keyId || !$secret) && $pdo) {
        try {
            $st = $pdo->prepare("SELECT `setting_value` FROM `settings` WHERE `setting_key` = 'payment_gateways' LIMIT 1");
            $st->execute();
            $cfg = json_decode((string)$st->fetchColumn(), true);
            $rz = is_array($cfg['razorpay'] ?? null) ? $cfg['razorpay'] : [];
            if (!$keyId && !empty($rz['keyId'])) { $keyId = trim((string)$rz['keyId']); $keysFromAdmin = true; }
            if (!$secret && !empty($rz['keySecret']) && !janani_is_masked($rz['keySecret'])) { $secret = trim((string)$rz['keySecret']); $keysFromAdmin = true; }
            if (!$webhook && !empty($rz['webhookSecret']) && !janani_is_masked($rz['webhookSecret'])) $webhook = trim((string)$rz['webhookSecret']);
        } catch (Throwable $e) {}
    }
    $usingTestFallback = false;
    if ((!$keyId || !$secret) && JANANI_TEST_FALLBACK_KEY_ID !== '' && JANANI_TEST_FALLBACK_KEY_SECRET !== '' && strpos(JANANI_TEST_FALLBACK_KEY_ID, 'rzp_test_') === 0) {
        $keyId = JANANI_TEST_FALLBACK_KEY_ID;
        $secret = JANANI_TEST_FALLBACK_KEY_SECRET;
        $usingTestFallback = true;
    }
    $mode = ($keyId && strpos($keyId, 'rzp_live_') === 0) ? 'live' : 'test';
    // Test keys work when explicitly enabled (env flag) or when the admin saved them in Payment settings.
    $allowTest = janani_is_local_request() || janani_env_bool('RAZORPAY_ALLOW_TEST_MODE', false) || $keysFromAdmin || $usingTestFallback
        // the test key pair deliberately placed in JANANI_TEST_FALLBACK_KEY_ID is always allowed (test mode only)
        || (JANANI_TEST_FALLBACK_KEY_ID !== '' && $keyId === JANANI_TEST_FALLBACK_KEY_ID);
    $configured = $keyId && $secret && !in_array($keyId, JANANI_LEAKED_RAZORPAY_KEYS, true) && ($mode === 'live' || $allowTest);
    return [
        'configured' => (bool)$configured,
        'keyId' => $configured ? $keyId : null,
        'keySecret' => $configured ? $secret : null,
        'webhookSecret' => $webhook ?: null,
        'mode' => $mode,
        'reason' => $configured ? null : (!$keyId || !$secret ? 'Razorpay keys are not configured.' : (in_array($keyId, JANANI_LEAKED_RAZORPAY_KEYS, true) ? 'The configured Razorpay key was exposed publicly and must be replaced.' : 'Razorpay test keys are disabled on the live site.')),
    ];
}

function janani_razorpay_request($keys, $method, $path, $payload = null) {
    if (!function_exists('curl_init')) return ['ok' => false, 'status' => 0, 'data' => null, 'error' => 'cURL is not available on this server'];
    $ch = curl_init('https://api.razorpay.com/v1' . $path);
    curl_setopt_array($ch, [
        CURLOPT_USERPWD => $keys['keyId'] . ':' . $keys['keySecret'],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_CONNECTTIMEOUT => 8,
        CURLOPT_TIMEOUT => 20,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
    ]);
    if ($payload !== null) curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    $resp = curl_exec($ch);
    $status = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err = curl_error($ch);
    if (PHP_VERSION_ID < 80000) curl_close($ch);
    $data = json_decode((string)$resp, true);
    $ok = $status >= 200 && $status < 300 && is_array($data);
    return ['ok' => $ok, 'status' => $status, 'data' => $data, 'error' => $ok ? null : ($err ?: ($data['error']['description'] ?? "HTTP {$status}"))];
}

function janani_razorpay_signature_valid($keys, $orderId, $paymentId, $signature) {
    if (!$keys['configured'] || !$orderId || !$paymentId || !$signature) return false;
    $expected = hash_hmac('sha256', $orderId . '|' . $paymentId, $keys['keySecret']);
    return hash_equals($expected, (string)$signature);
}

/** Issues a Razorpay refund. Returns ['ok' => bool, 'refundId' => ?, 'error' => ?]. */
function janani_razorpay_refund($pdo, $paymentId, $amountRupees, $notes = []) {
    $keys = janani_razorpay_keys($pdo);
    if (!$keys['configured']) return ['ok' => false, 'error' => $keys['reason']];
    if (!$paymentId || strpos((string)$paymentId, 'pay_') !== 0) return ['ok' => false, 'error' => 'This order has no Razorpay payment to refund.'];
    $payload = ['notes' => (object)$notes];
    if ($amountRupees !== null) $payload['amount'] = (int)round($amountRupees * 100);
    $res = janani_razorpay_request($keys, 'POST', '/payments/' . rawurlencode($paymentId) . '/refund', $payload);
    if (!$res['ok']) return ['ok' => false, 'error' => $res['error']];
    return ['ok' => true, 'refundId' => $res['data']['id'] ?? null, 'status' => $res['data']['status'] ?? null];
}

/**
 * Converts a paid Razorpay intent into an order exactly once (shared by the browser callback and the webhook).
 */
function janani_finalize_intent($pdo, $razorpayOrderId, $paymentId, $expectUserId = null) {
    $lockName = 'rzp_' . substr(hash('sha256', (string)$razorpayOrderId), 0, 40);
    $locked = false;
    try {
        $locked = (int)$pdo->query("SELECT GET_LOCK(" . $pdo->quote($lockName) . ", 15)")->fetchColumn() === 1;
        $st = $pdo->prepare("SELECT * FROM `payment_intents` WHERE `razorpay_order_id` = ? LIMIT 1");
        $st->execute([$razorpayOrderId]);
        $intent = $st->fetch(PDO::FETCH_ASSOC);
        if (!$intent) return ['success' => false, 'status' => 404, 'message' => 'Payment session not found.'];
        if ($expectUserId !== null && (string)$intent['user_id'] !== (string)$expectUserId) {
            return ['success' => false, 'status' => 403, 'message' => 'This payment belongs to a different account.'];
        }
        if (!empty($intent['order_number'])) {
            return ['success' => true, 'order' => janani_find_order($pdo, $intent['order_number']), 'alreadyProcessed' => true];
        }
        $payload = json_decode($intent['payload'], true) ?: [];
        $uSt = $pdo->prepare("SELECT * FROM `users` WHERE `id` = ? LIMIT 1");
        $uSt->execute([$intent['user_id']]);
        $user = $uSt->fetch(PDO::FETCH_ASSOC) ?: ['id' => $intent['user_id'], 'email' => $intent['user_email'], 'name' => 'Customer'];

        $result = janani_insert_order($pdo, $user, $payload['quote'], $payload['address'] ?? [], [
            'method' => 'Razorpay (Online)',
            'status' => 'Paid',
            'transactionId' => $paymentId,
            'razorpayOrderId' => $razorpayOrderId,
            'strictStock' => false,
        ], $payload['extra'] ?? []);
        if (empty($result['success'])) return ['success' => false, 'status' => 409, 'message' => $result['message'] ?? 'Order could not be created.'];

        $pdo->prepare("UPDATE `payment_intents` SET `status` = 'order_created', `payment_id` = ?, `order_number` = ? WHERE `razorpay_order_id` = ?")
            ->execute([$paymentId, $result['order']['number'], $razorpayOrderId]);
        janani_send_order_invoice_once($pdo, $result['order']);
        return ['success' => true, 'order' => $result['order'], 'reward' => $result['reward'] ?? null];
    } finally {
        if ($locked) {
            try { $pdo->query("SELECT RELEASE_LOCK(" . $pdo->quote($lockName) . ")"); } catch (Throwable $e) {}
        }
    }
}

/** Sends the GST invoice e-mail for an order once (customer + admin copy). */
function janani_send_order_invoice_once($pdo, $order, $force = false) {
    if (!$order || !function_exists('sendOrderConfirmationInvoiceEmail')) return ['success' => false];
    if (!$force && !empty($order['invoice_sent'])) return ['success' => true, 'skipped' => true];
    try {
        $res = sendOrderConfirmationInvoiceEmail(janani_format_order($order));
        if (!empty($res['success'])) {
            $pdo->prepare("UPDATE `orders` SET `invoice_sent` = 1 WHERE `id` = ?")->execute([$order['id']]);
        }
        return $res;
    } catch (Throwable $e) {
        error_log('[janani] invoice email: ' . $e->getMessage());
        return ['success' => false];
    }
}

// ---------------------------------------------------------------------------
// Users / sessions
// ---------------------------------------------------------------------------

/** Finds a user by e-mail or by mobile number (digits compared, any formatting). */
function janani_find_user_by_identifier($pdo, $identifier) {
    $identifier = trim((string)$identifier);
    if ($identifier === '' || !$pdo) return null;
    if (strpos($identifier, '@') !== false) {
        $st = $pdo->prepare("SELECT * FROM `users` WHERE LOWER(TRIM(`email`)) = ? LIMIT 1");
        $st->execute([strtolower($identifier)]);
        return $st->fetch(PDO::FETCH_ASSOC) ?: null;
    }
    $digits = preg_replace('/\D/', '', $identifier);
    if (strlen($digits) < 10) return null;
    $last10 = substr($digits, -10);
    $st = $pdo->prepare("SELECT * FROM `users` WHERE `phone` IS NOT NULL AND `phone` != ''
        AND REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(`phone`, ' ', ''), '-', ''), '+', ''), '(', ''), ')', '') LIKE ?
        ORDER BY (`role` = 'Customer') DESC, `created_at` ASC LIMIT 1");
    $st->execute(['%' . $last10]);
    return $st->fetch(PDO::FETCH_ASSOC) ?: null;
}

function janani_user_is_blocked($row) {
    $status = strtolower(trim((string)($row['status'] ?? 'active')));
    return in_array($status, ['suspended', 'blocked', 'banned', 'deleted', 'inactive'], true);
}

/** The user object returned to the browser after sign-in (no credentials). */
function janani_session_user($row) {
    if (!is_array($row)) return null;
    if (function_exists('enrichUserLocationAndAddresses')) {
        enrichUserLocationAndAddresses($row);
    }
    $prefs = $row['preferences'] ?? null;
    if (is_string($prefs)) $prefs = json_decode($prefs, true);
    $email = (string)($row['email'] ?? '');
    return [
        'id' => (string)$row['id'],
        'name' => ($row['name'] ?? '') ?: (explode('@', $email)[0] ?: 'Customer'),
        'email' => $email,
        'phone' => (string)($row['phone'] ?? ''),
        'role' => ($row['role'] ?? '') ?: 'Customer',
        'status' => ($row['status'] ?? '') ?: 'Active',
        'walletBalance' => (float)($row['wallet_balance'] ?? 0),
        'loyaltyPoints' => (int)($row['loyalty_points'] ?? 0),
        'referralCode' => (string)($row['referral_code'] ?? ''),
        'isVerified' => true,
        'tier' => ($row['tier'] ?? '') ?: 'Silver',
        'avatar' => $row['avatar'] ?? null,
        'city' => $row['city'] ?? '',
        'state' => $row['state'] ?? '',
        'address' => $row['address'] ?? '',
        'pincode' => $row['pincode'] ?? '',
        'landmark' => $row['landmark'] ?? '',
        'addresses' => $row['addresses'] ?? [],
        'savedAddresses' => $row['savedAddresses'] ?? [],
        'wishlist' => $row['wishlist'] ?? [],
        'preferences' => is_array($prefs) ? $prefs : null,
        'hasPassword' => (!empty($row['password_hash']) || !empty($row['password'])),
    ];
}

function janani_auth_response($pdo, $row, $message) {
    return [
        'success' => true,
        'message' => $message,
        'isAdmin' => janani_is_admin_user($row),
        'token' => janani_issue_token($pdo, $row),
        'user' => janani_session_user($row),
    ];
}

/**
 * Optional SMS delivery (Fast2SMS OTP route) when FAST2SMS_API_KEY is configured.
 * E-mail delivery remains the primary channel.
 */
function janani_send_sms_otp($phone, $code) {
    $key = janani_env('FAST2SMS_API_KEY');
    $digits = substr(preg_replace('/\D/', '', (string)$phone), -10);
    if (!$key || strlen($digits) !== 10 || !function_exists('curl_init')) return ['success' => false, 'error' => 'SMS not configured'];
    $url = 'https://www.fast2sms.com/dev/bulkV2?' . http_build_query([
        'route' => 'otp',
        'variables_values' => $code,
        'flash' => 0,
        'numbers' => $digits,
    ]);
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 10,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_HTTPHEADER => ['authorization: ' . $key, 'accept: application/json'],
    ]);
    $resp = curl_exec($ch);
    $status = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    if (PHP_VERSION_ID < 80000) curl_close($ch);
    $data = json_decode((string)$resp, true);
    $ok = $status === 200 && !empty($data['return']);
    if (!$ok) error_log('[janani] SMS OTP failed: HTTP ' . $status);
    return ['success' => $ok];
}

// ---------------------------------------------------------------------------
// Cancellation & refunds
// ---------------------------------------------------------------------------

function janani_is_paid_online($order) {
    $ps = strtolower(trim((string)($order['payment_status'] ?? '')));
    return in_array($ps, ['paid', 'completed', 'captured'], true) && strpos((string)($order['transaction_id'] ?? ''), 'pay_') === 0;
}

function janani_is_cod($order) {
    $pm = strtolower((string)($order['payment_method'] ?? ''));
    $ps = strtolower((string)($order['payment_status'] ?? ''));
    return strpos($pm, 'cash') !== false || strpos($pm, 'cod') !== false || strpos($ps, 'cod') !== false;
}

/**
 * Cancels an order exactly once: restores stock and, for paid online orders,
 * issues a real Razorpay refund (status "Refund Pending" if the gateway call fails).
 */
function janani_cancel_order($pdo, $order, $reason, $actorLabel, $restock = true) {
    if (!$order) return ['success' => false, 'message' => 'Order not found.'];
    $pdo->beginTransaction();
    try {
        $up = $pdo->prepare("UPDATE `orders` SET `order_status` = 'Cancelled' WHERE `id` = ? AND (`order_status` IS NULL OR `order_status` != 'Cancelled')");
        $up->execute([$order['id']]);
        if ($up->rowCount() === 0) {
            $pdo->rollBack();
            return ['success' => true, 'alreadyCancelled' => true, 'order' => janani_find_order($pdo, $order['id']), 'message' => 'This order is already cancelled.'];
        }
        if ($restock) janani_restock_order_items($pdo, $order);
        $pdo->commit();
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        throw $e;
    }

    // Credit earned by this order but already spent elsewhere is kept back from the refund
    $clawback = janani_wallet_clawback_amount($pdo, $order);
    janani_wallet_on_order_closed($pdo, $order);

    $refundNote = '';
    if (janani_is_paid_online($order)) {
        $amount = max(0, (float)$order['total'] - (float)($order['refund_amount'] ?? 0) - $clawback);
        $refund = $amount > 0 ? janani_razorpay_refund($pdo, $order['transaction_id'], $amount, ['order' => (string)$order['number'], 'reason' => 'order cancelled']) : ['ok' => true, 'refundId' => null];
        if ($refund['ok']) {
            $pdo->prepare("UPDATE `orders` SET `payment_status` = 'Refunded', `refund_id` = ?, `refund_amount` = COALESCE(`refund_amount`, 0) + ? WHERE `id` = ?")
                ->execute([$refund['refundId'], $amount, $order['id']]);
            $refundNote = 'A refund of ₹' . number_format($amount, 2) . ' has been initiated to your original payment method (usually 5-7 business days).'
                . ($clawback > 0 ? ' ₹' . number_format($clawback, 2) . ' first-order wallet credit already used on another order was deducted.' : '');
        } else {
            error_log('[janani] refund failed for ' . $order['number'] . ': ' . ($refund['error'] ?? ''));
            $pdo->prepare("UPDATE `orders` SET `payment_status` = 'Refund Pending' WHERE `id` = ?")->execute([$order['id']]);
            $refundNote = 'Your refund is being processed by our team and will reach your original payment method.';
        }
    } elseif (janani_is_cod($order)) {
        $pdo->prepare("UPDATE `orders` SET `payment_status` = 'Cancelled' WHERE `id` = ?")->execute([$order['id']]);
    }
    $fresh = janani_find_order($pdo, $order['id']);
    $cleanReason = mb_substr(trim(strip_tags((string)$reason)), 0, 300);
    janani_append_timeline($pdo, $fresh, 'Order cancelled by ' . $actorLabel . ($cleanReason !== '' ? " – {$cleanReason}" : ''));
    return ['success' => true, 'order' => janani_find_order($pdo, $order['id']), 'refundNote' => $refundNote,
        'message' => trim('Order ' . $order['number'] . ' has been cancelled. ' . $refundNote)];
}

/** True when the customer has a delivered order containing the product (for "verified purchase" badges). */
function janani_user_purchased_product($pdo, $user, $productRef) {
    if (!$user) return false;
    $ref = strtolower(trim((string)$productRef));
    if ($ref === '') return false;
    $refs = [$ref, preg_replace('/^prod-/', '', $ref)];
    try {
        $st = $pdo->prepare("SELECT `items` FROM `orders` WHERE (`customer_id` = ? OR LOWER(`customer_email`) = ?) AND LOWER(`order_status`) IN ('delivered', 'returned', 'exchange approved') LIMIT 100");
        $st->execute([(string)$user['id'], strtolower((string)$user['email'])]);
        foreach ($st->fetchAll(PDO::FETCH_COLUMN) as $itemsJson) {
            foreach ((array)json_decode((string)$itemsJson, true) as $it) {
                foreach (['productId', 'product_id', 'id', 'slug'] as $k) {
                    if (isset($it[$k]) && in_array(strtolower((string)$it[$k]), $refs, true)) return true;
                }
            }
        }
    } catch (Throwable $e) {}
    return false;
}

/**
 * Refunds an order (full or partial). Online payments are refunded through Razorpay first;
 * the order is only updated when the gateway accepts the refund. COD refunds are recorded as manual.
 */
function janani_refund_order($pdo, $order, $amount, $reason, $restock) {
    $alreadyRefunded = (float)($order['refund_amount'] ?? 0);
    $clawback = janani_wallet_clawback_amount($pdo, $order);
    $maxRefundable = round(max(0, (float)$order['total'] - $alreadyRefunded - $clawback), 2);
    $amount = $amount === null ? $maxRefundable : round((float)$amount, 2);
    if ($amount <= 0 || $amount > $maxRefundable + 0.001) {
        return ['success' => false, 'status' => 400, 'message' => 'Refund amount must be between ₹0.01 and ₹' . number_format($maxRefundable, 2) . '.'];
    }
    $refundId = null;
    if (strpos((string)($order['transaction_id'] ?? ''), 'pay_') === 0) {
        $rf = janani_razorpay_refund($pdo, $order['transaction_id'], $amount, ['order' => (string)$order['number'], 'reason' => $reason ?: 'admin refund']);
        if (!$rf['ok']) {
            return ['success' => false, 'status' => 502, 'message' => 'Razorpay refund failed: ' . ($rf['error'] ?? 'unknown error') . '. No changes were made.'];
        }
        $refundId = $rf['refundId'];
    }
    $statusLower = strtolower((string)($order['order_status'] ?? ''));
    if ($restock && $statusLower !== 'cancelled' && $statusLower !== 'returned') {
        janani_restock_order_items($pdo, $order);
    }
    $fully = ($alreadyRefunded + $amount) >= (float)$order['total'] - $clawback - 0.009;
    if ($fully) {
        janani_wallet_on_order_closed($pdo, $order);
    }
    $afterStatus = in_array($statusLower, ['delivered', 'return requested', 'returned', 'exchange requested'], true) ? 'Returned' : 'Cancelled';
    $pdo->prepare("UPDATE `orders` SET `payment_status` = ?, `order_status` = ?, `refund_amount` = COALESCE(`refund_amount`, 0) + ?, `refund_id` = COALESCE(?, `refund_id`) WHERE `id` = ?")
        ->execute([$fully ? 'Refunded' : 'Partially Refunded', $afterStatus, $amount, $refundId, $order['id']]);
    try {
        $pdo->prepare("INSERT INTO `payments` (`id`, `order_id`, `gross_amount`, `net_settled_amount`, `refunded_amount`, `status`) VALUES (?, ?, ?, ?, ?, 'Refunded')")
            ->execute([$refundId ?: ('REF-' . bin2hex(random_bytes(5))), $order['number'], $amount, 0, $amount]);
    } catch (Throwable $e) {}
    janani_append_timeline($pdo, janani_find_order($pdo, $order['id']), 'Refund of ₹' . number_format($amount, 2) . ($refundId ? " issued via Razorpay ({$refundId})" : ' recorded (manual / COD refund)'));
    return [
        'success' => true,
        'refundId' => $refundId,
        'amount' => $amount,
        'order' => janani_find_order($pdo, $order['id']),
        'message' => 'Refund of ₹' . number_format($amount, 2) . ($refundId ? ' issued through Razorpay.' : ' recorded. Please transfer the amount to the customer manually.'),
    ];
}

/** Private backup folder: BACKUP_DIR, else a "janani_backups" folder next to (not inside) the web root. */
function janani_backup_dir() {
    $dir = janani_env('BACKUP_DIR') ?: (dirname(__DIR__) . '/janani_backups');
    if (!is_dir($dir) && !@mkdir($dir, 0700, true)) return null;
    if (!is_writable($dir)) return null;
    // Defence in depth in case the folder ends up inside a web-served directory
    if (!is_file($dir . '/.htaccess')) @file_put_contents($dir . '/.htaccess', "Require all denied\nDeny from all\n");
    if (!is_file($dir . '/index.html')) @file_put_contents($dir . '/index.html', '');
    return $dir;
}

// ---------------------------------------------------------------------------
// Wallet credits (first-order reward)
//
// Rules (agreed with the store owner):
//  * A customer's FIRST order whose products value (after coupon, excluding delivery and GST) is
//    at least ₹500 earns 10% of that value as wallet credit.
//  * The credit appears in the wallet when the order is placed and expires 90 days later.
//  * It can be used once, on a later order whose products value is also at least ₹500.
//    It is applied up to that order's products value; any unused part lapses.
//  * If the first order is cancelled / fully refunded, the credit is removed (or, if already spent,
//    deducted from that order's refund). If the order that used the credit is cancelled, the credit
//    comes back (until its original expiry).
//  * Credit from a Cash on Delivery first order unlocks once that order is delivered (an online
//    paid first order unlocks immediately) - this stops "order COD, use credit, cancel" misuse.
// ---------------------------------------------------------------------------

const JANANI_FIRST_ORDER_CREDIT_RATE = 0.10;
const JANANI_CREDIT_MIN_ORDER_VALUE = 500;
const JANANI_CREDIT_VALIDITY_DAYS = 90;

/** Creates the wallet tables on first use, independent of the migration version stored in the database. */
function janani_ensure_wallet_tables($pdo) {
    static $done = false;
    if ($done || !$pdo) return;
    $done = true;
    try {
        janani_create_wallet_tables($pdo);
    } catch (Throwable $e) {
        error_log('[janani] could not create wallet tables: ' . $e->getMessage());
    }
}

function janani_create_wallet_tables($pdo) {
    $pdo->exec("CREATE TABLE IF NOT EXISTS `wallet_credits` (
        `id` VARCHAR(40) NOT NULL PRIMARY KEY,
        `user_id` VARCHAR(64) NOT NULL,
        `user_email` VARCHAR(255) DEFAULT NULL,
        `type` VARCHAR(40) NOT NULL DEFAULT 'first_order_reward',
        `amount` DECIMAL(10,2) NOT NULL DEFAULT '0.00',
        `status` VARCHAR(20) NOT NULL DEFAULT 'active',
        `source_order` VARCHAR(64) DEFAULT NULL,
        `used_order` VARCHAR(64) DEFAULT NULL,
        `used_amount` DECIMAL(10,2) NOT NULL DEFAULT '0.00',
        `note` VARCHAR(500) DEFAULT NULL,
        `issued_at` DATETIME NOT NULL,
        `expires_at` DATETIME NOT NULL,
        `used_at` DATETIME DEFAULT NULL,
        `closed_at` DATETIME DEFAULT NULL,
        `created_by` VARCHAR(64) DEFAULT NULL,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        KEY `idx_user_status` (`user_id`, `status`),
        KEY `idx_source_order` (`source_order`),
        KEY `idx_used_order` (`used_order`),
        KEY `idx_expires` (`status`, `expires_at`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
}

function janani_migration_v2($pdo) {
    janani_create_wallet_tables($pdo);
    // Wallet balance is now derived from the credits ledger (the previous code reset every
    // customer's balance to 0 on each request, so no real balance is lost).
    janani_sync_all_wallet_balances($pdo);
}

function janani_wallet_note_append($existing, $text) {
    $existing = trim((string)$existing);
    return mb_substr($existing === '' ? $text : ($existing . ' | ' . $text), 0, 500);
}

function janani_expire_wallet_credits($pdo, $userId = null) {
    try {
        if ($userId === null) {
            $pdo->exec("UPDATE `wallet_credits` SET `status` = 'expired', `closed_at` = NOW() WHERE `status` = 'active' AND `expires_at` <= NOW()");
        } else {
            $pdo->prepare("UPDATE `wallet_credits` SET `status` = 'expired', `closed_at` = NOW() WHERE `status` = 'active' AND `expires_at` <= NOW() AND `user_id` = ?")->execute([(string)$userId]);
        }
    } catch (Throwable $e) {}
}

/** users.wallet_balance mirrors the sum of the customer's active, unexpired credits. */
function janani_sync_wallet_balance($pdo, $userId) {
    try {
        $pdo->prepare("UPDATE `users` SET `wallet_balance` = (SELECT COALESCE(SUM(`amount`), 0) FROM `wallet_credits` WHERE `user_id` = ? AND `status` = 'active' AND `expires_at` > NOW()) WHERE `id` = ?")
            ->execute([(string)$userId, (string)$userId]);
    } catch (Throwable $e) {}
}

function janani_sync_all_wallet_balances($pdo) {
    janani_expire_wallet_credits($pdo);
    try {
        $pdo->exec("UPDATE `users` u SET u.`wallet_balance` = (SELECT COALESCE(SUM(w.`amount`), 0) FROM `wallet_credits` w WHERE w.`user_id` COLLATE utf8mb4_unicode_ci = u.`id` COLLATE utf8mb4_unicode_ci AND w.`status` = 'active' AND w.`expires_at` > NOW())");
    } catch (Throwable $e) {}
}

/** Null when the credit can be spent now, otherwise the reason it is still locked. */
function janani_credit_lock_reason($pdo, $credit) {
    if (empty($credit['source_order'])) return null;
    $o = janani_find_order($pdo, $credit['source_order']);
    if (!$o) return null;
    $ps = strtolower(trim((string)($o['payment_status'] ?? '')));
    $os = strtolower(trim((string)($o['order_status'] ?? '')));
    if (in_array($ps, ['paid', 'completed', 'captured'], true) || $os === 'delivered') return null;
    return 'Unlocks when your first order ' . $o['number'] . ' is delivered.';
}

function janani_customer_active_order_count($pdo, $user, $excludeNumber = null) {
    $email = janani_is_placeholder_email($user['email'] ?? '') ? '' : strtolower(trim((string)$user['email']));
    // (no "? != ''" in SQL: a parameter and a literal can carry different collations and MySQL then rejects the query)
    $sql = "SELECT COUNT(*) FROM `orders` WHERE (`customer_id` = ? OR LOWER(`customer_email`) = ?)
            AND (`order_status` IS NULL OR `order_status` NOT IN ('Cancelled', 'Payment Failed'))";
    $params = [(string)$user['id'], $email !== '' ? $email : '-no-email-'];
    if ($excludeNumber !== null) {
        $sql .= " AND `number` != ?";
        $params[] = (string)$excludeNumber;
    }
    $st = $pdo->prepare($sql);
    $st->execute($params);
    return (int)$st->fetchColumn();
}

/** First-order reward is available only to customers with no other (non-cancelled) order and no earlier reward. */
function janani_first_order_reward_eligible($pdo, $user, $excludeNumber = null) {
    if (!$user || janani_is_staff_user($user)) return false;
    try {
        if (janani_customer_active_order_count($pdo, $user, $excludeNumber) > 0) return false;
        $st = $pdo->prepare("SELECT COUNT(*) FROM `wallet_credits` WHERE `user_id` = ? AND `type` = 'first_order_reward' AND `status` IN ('active', 'used', 'expired')");
        $st->execute([(string)$user['id']]);
        return (int)$st->fetchColumn() === 0;
    } catch (Throwable $e) {
        return false;
    }
}

function janani_format_wallet_credit($pdo, $c) {
    $status = (string)$c['status'];
    $lock = $status === 'active' ? janani_credit_lock_reason($pdo, $c) : null;
    $expiresTs = strtotime((string)$c['expires_at']);
    $daysLeft = $status === 'active' ? max(0, (int)ceil(($expiresTs - time()) / 86400)) : 0;
    $labels = [
        'active' => $lock ? 'Locked' : 'Available',
        'used' => 'Used',
        'expired' => 'Expired',
        'revoked' => 'Cancelled',
    ];
    return [
        'id' => $c['id'],
        'type' => $c['type'],
        'title' => $c['type'] === 'first_order_reward' ? 'First order reward (10%)' : 'Store credit',
        'amount' => round((float)$c['amount'], 2),
        'status' => $status,
        'statusLabel' => $labels[$status] ?? ucfirst($status),
        'lockedReason' => $lock,
        'sourceOrder' => $c['source_order'],
        'usedOrder' => $c['used_order'],
        'usedAmount' => round((float)$c['used_amount'], 2),
        'note' => $c['note'],
        'issuedAt' => date('c', strtotime((string)$c['issued_at'])),
        'expiresAt' => date('c', $expiresTs),
        'expiresOn' => date('d M Y', $expiresTs),
        'usedAt' => $c['used_at'] ? date('c', strtotime((string)$c['used_at'])) : null,
        'closedAt' => $c['closed_at'] ? date('c', strtotime((string)$c['closed_at'])) : null,
        'daysLeft' => $daysLeft,
    ];
}

/** Passbook entries (credits, uses, expiries, reversals) built from the credits ledger. */
function janani_wallet_transactions($credits) {
    $tx = [];
    foreach ($credits as $c) {
        $issued = strtotime($c['issuedAt']);
        $tx[] = [
            'id' => $c['id'],
            'ts' => $issued,
            'date' => date('d M Y', $issued),
            'title' => $c['title'],
            'description' => ($c['sourceOrder'] ? "Earned on order {$c['sourceOrder']}" : ($c['note'] ?: 'Added by Janani Agro')) . " • Valid till {$c['expiresOn']}" . ($c['lockedReason'] ? " • {$c['lockedReason']}" : ''),
            'amount' => $c['amount'],
            'type' => 'credit',
            'status' => ($c['status'] === 'active' && $c['lockedReason']) ? 'pending' : 'completed',
            'category' => $c['type'] === 'first_order_reward' ? 'cashback' : 'topup',
            'orderId' => $c['sourceOrder'],
        ];
        if ($c['status'] === 'used') {
            $usedTs = $c['usedAt'] ? strtotime($c['usedAt']) : $issued;
            $tx[] = [
                'id' => $c['id'] . '-U',
                'ts' => $usedTs,
                'date' => date('d M Y', $usedTs),
                'title' => 'Used on order',
                'description' => "Applied on order {$c['usedOrder']}",
                'amount' => $c['usedAmount'],
                'type' => 'debit',
                'status' => 'completed',
                'category' => 'order_payment',
                'orderId' => $c['usedOrder'],
            ];
            $lapsed = round($c['amount'] - $c['usedAmount'], 2);
            if ($lapsed > 0) {
                $tx[] = [
                    'id' => $c['id'] . '-L',
                    'ts' => $usedTs,
                    'date' => date('d M Y', $usedTs),
                    'title' => 'Unused balance lapsed',
                    'description' => 'Credit is one-time use; the remaining part is not carried forward',
                    'amount' => $lapsed,
                    'type' => 'debit',
                    'status' => 'completed',
                    'category' => 'expired',
                    'orderId' => $c['usedOrder'],
                ];
            }
        } elseif ($c['status'] === 'expired' || $c['status'] === 'revoked') {
            $closedTs = $c['closedAt'] ? strtotime($c['closedAt']) : strtotime($c['expiresAt']);
            $tx[] = [
                'id' => $c['id'] . ($c['status'] === 'expired' ? '-E' : '-R'),
                'ts' => $closedTs,
                'date' => date('d M Y', $closedTs),
                'title' => $c['status'] === 'expired' ? 'Credit expired' : 'Credit cancelled',
                'description' => $c['status'] === 'expired' ? 'Not used within ' . JANANI_CREDIT_VALIDITY_DAYS . ' days' : ($c['note'] ?: 'Order was cancelled'),
                'amount' => $c['amount'],
                'type' => 'debit',
                'status' => 'completed',
                'category' => $c['status'] === 'expired' ? 'expired' : 'reversal',
                'orderId' => $c['sourceOrder'],
            ];
        }
    }
    // Running balance (oldest first), then newest first for display
    usort($tx, function ($a, $b) { return $a['ts'] <=> $b['ts']; });
    $bal = 0.0;
    foreach ($tx as &$t) {
        $bal = round($bal + ($t['type'] === 'credit' ? $t['amount'] : -$t['amount']), 2);
        $t['balanceAfter'] = max(0, $bal);
    }
    unset($t);
    return array_reverse($tx);
}

/** Everything the wallet screens and checkout need for one customer. */
/**
 * Safety net: if a customer's one and only (non-cancelled) order is recent and earned the first-order credit but no
 * credit exists yet (for example the reward step failed while the wallet tables were still missing), issue it now.
 */
function janani_backfill_first_order_reward($pdo, $user) {
    // Returns a short human-readable explanation when no first-order credit was issued (null when issued / not applicable).
    try {
        if (!$user) return null;
        if (janani_is_staff_user($user)) return 'Staff and admin accounts do not earn the first-order credit.';
        $email = janani_is_placeholder_email($user['email'] ?? '') ? '' : strtolower(trim((string)$user['email']));
        $st = $pdo->prepare("SELECT * FROM `orders` WHERE (`customer_id` = ? OR LOWER(`customer_email`) = ?)
            AND (`order_status` IS NULL OR `order_status` NOT IN ('Cancelled', 'Payment Failed'))
            AND (`payment_status` IS NULL OR `payment_status` NOT IN ('Refunded', 'Refund Pending', 'Cancelled', 'Failed'))
            ORDER BY `created_at` ASC LIMIT 5");
        $st->execute([(string)$user['id'], $email !== '' ? $email : '-no-email-']);
        $orders = $st->fetchAll(PDO::FETCH_ASSOC);
        if (count($orders) === 0) return null;
        $rewardRows = $pdo->prepare("SELECT COUNT(*) FROM `wallet_credits` WHERE `user_id` = ? AND `type` = 'first_order_reward'");
        $rewardRows->execute([(string)$user['id']]);
        if ((int)$rewardRows->fetchColumn() > 0) return null;
        if (count($orders) > 1) {
            $nums = implode(', ', array_map(function ($o) { return $o['number']; }, $orders));
            return 'This account has more than one order (' . $nums . '), so it is not a first order.';
        }
        $order = $orders[0];
        $placedTs = strtotime((string)($order['order_date'] ?? ''));
        if ($placedTs && $placedTs < time() - JANANI_CREDIT_VALIDITY_DAYS * 86400) return 'The first order is older than ' . JANANI_CREDIT_VALIDITY_DAYS . ' days.';
        $productsValue = round((float)$order['subtotal'] - (float)($order['coupon_discount'] ?? 0), 2);
        if ($productsValue < JANANI_CREDIT_MIN_ORDER_VALUE) return 'Order ' . $order['number'] . ' products value ₹' . number_format($productsValue, 2) . ' is below the ₹' . JANANI_CREDIT_MIN_ORDER_VALUE . ' minimum.';
        if (!janani_first_order_reward_eligible($pdo, $user, $order['number'])) return 'Order ' . $order['number'] . ' is not eligible for the first-order credit.';
        $granted = janani_grant_first_order_reward($pdo, $user, $order);
        return $granted ? null : 'The credit for order ' . $order['number'] . ' could not be saved. Please contact support.';
    } catch (Throwable $e) {
        error_log('[janani] first-order reward backfill: ' . $e->getMessage());
        return 'Credit check failed: ' . mb_substr($e->getMessage(), 0, 180);
    }
}

function janani_wallet_summary($pdo, $user) {
    janani_ensure_wallet_tables($pdo);
    $rewardCheck = janani_backfill_first_order_reward($pdo, $user);
    janani_expire_wallet_credits($pdo, (string)$user['id']);
    $st = $pdo->prepare("SELECT * FROM `wallet_credits` WHERE `user_id` = ? ORDER BY `issued_at` DESC LIMIT 200");
    $st->execute([(string)$user['id']]);
    $credits = [];
    $available = 0.0;
    $locked = 0.0;
    foreach ($st->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $c = janani_format_wallet_credit($pdo, $row);
        if ($c['status'] === 'active') {
            if ($c['lockedReason']) {
                $locked += $c['amount'];
            } else {
                $available += $c['amount'];
            }
        }
        $credits[] = $c;
    }
    janani_sync_wallet_balance($pdo, (string)$user['id']);
    return [
        'availableBalance' => round($available, 2),
        'lockedBalance' => round($locked, 2),
        'totalBalance' => round($available + $locked, 2),
        'credits' => $credits,
        'transactions' => janani_wallet_transactions($credits),
        'firstOrderRewardEligible' => janani_first_order_reward_eligible($pdo, $user),
        'rewardCheck' => $rewardCheck,
        'rules' => [
            'rewardPercent' => (int)round(JANANI_FIRST_ORDER_CREDIT_RATE * 100),
            'minOrderValue' => JANANI_CREDIT_MIN_ORDER_VALUE,
            'validityDays' => JANANI_CREDIT_VALIDITY_DAYS,
            'oneTimeUse' => true,
        ],
    ];
}

/**
 * Works out how much wallet credit applies to an order with the given products value
 * (subtotal after coupon, excluding delivery and GST).
 */
function janani_wallet_redemption($pdo, $user, $productsValue) {
    janani_ensure_wallet_tables($pdo);
    $none = ['amount' => 0.0, 'credits' => [], 'message' => null];
    if (!$user) return $none;
    if ($productsValue < JANANI_CREDIT_MIN_ORDER_VALUE) {
        $none['message'] = 'Wallet credit can be used on orders of ₹' . JANANI_CREDIT_MIN_ORDER_VALUE . ' or more (excluding delivery).';
        return $none;
    }
    janani_expire_wallet_credits($pdo, (string)$user['id']);
    $st = $pdo->prepare("SELECT * FROM `wallet_credits` WHERE `user_id` = ? AND `status` = 'active' AND `expires_at` > NOW() ORDER BY `expires_at` ASC");
    $st->execute([(string)$user['id']]);
    $remaining = round((float)$productsValue, 2);
    $applied = [];
    $lockedReason = null;
    foreach ($st->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $lock = janani_credit_lock_reason($pdo, $row);
        if ($lock) {
            $lockedReason = $lock;
            continue;
        }
        if ($remaining <= 0) break;
        $use = round(min((float)$row['amount'], $remaining), 2);
        if ($use <= 0) continue;
        $applied[] = ['id' => $row['id'], 'amount' => $use];
        $remaining = round($remaining - $use, 2);
    }
    if (empty($applied)) {
        $none['message'] = $lockedReason ?: 'You have no wallet credit available.';
        return $none;
    }
    $total = 0.0;
    foreach ($applied as $a) {
        $total += $a['amount'];
    }
    return ['amount' => round($total, 2), 'credits' => $applied, 'message' => null];
}

/** Issues the first-order reward for a freshly placed order (no-op when not eligible). */
/** Records on the order (admin side only) why no first-order wallet credit was issued. */
function janani_reward_skip_note($pdo, $order, $reason) {
    try {
        $notes = janani_json_field($order['admin_notes'] ?? null, []);
        $text = 'First-order reward not issued: ' . $reason . '.';
        foreach ($notes as $existingNote) {
            if (is_array($existingNote) && ($existingNote['text'] ?? '') === $text) return;
        }
        $notes[] = [
            'id' => 'NOTE-' . bin2hex(random_bytes(4)),
            'text' => $text,
            'author' => 'System',
            'date' => date('d M Y, h:i A'),
        ];
        $pdo->prepare("UPDATE `orders` SET `admin_notes` = ? WHERE `id` = ?")->execute([json_encode($notes, JSON_UNESCAPED_UNICODE), $order['id']]);
    } catch (Throwable $e) {}
}

function janani_grant_first_order_reward($pdo, $user, $order) {
    if (!$order || !$user) return null;
    janani_ensure_wallet_tables($pdo);
    $lockName = 'wallet_' . substr(hash('sha256', (string)$user['id']), 0, 40);
    $locked = false;
    try {
        $locked = (int)$pdo->query("SELECT GET_LOCK(" . $pdo->quote($lockName) . ", 10)")->fetchColumn() === 1;
        $productsValue = round((float)$order['subtotal'] - (float)($order['coupon_discount'] ?? 0), 2);
        if ($productsValue < JANANI_CREDIT_MIN_ORDER_VALUE) {
            janani_reward_skip_note($pdo, $order, 'products value ₹' . number_format($productsValue, 2) . ' is below the ₹' . JANANI_CREDIT_MIN_ORDER_VALUE . ' minimum');
            return null;
        }
        if (!janani_first_order_reward_eligible($pdo, $user, $order['number'])) {
            $why = janani_is_staff_user($user) ? 'this is a staff/admin account'
                : (janani_customer_active_order_count($pdo, $user, $order['number']) > 0 ? 'the customer already has an earlier non-cancelled order (same account or email)' : 'a first-order reward was already issued to this account');
            janani_reward_skip_note($pdo, $order, $why);
            return null;
        }
        $amount = round($productsValue * JANANI_FIRST_ORDER_CREDIT_RATE, 2);
        if ($amount <= 0) return null;
        $id = 'WCR-' . strtoupper(bin2hex(random_bytes(5)));
        $pdo->prepare("INSERT INTO `wallet_credits` (`id`, `user_id`, `user_email`, `type`, `amount`, `status`, `source_order`, `note`, `issued_at`, `expires_at`, `created_by`)
            VALUES (?, ?, ?, 'first_order_reward', ?, 'active', ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL " . (int)JANANI_CREDIT_VALIDITY_DAYS . " DAY), 'system')")
            ->execute([$id, (string)$user['id'], (string)($user['email'] ?? ''), $amount, $order['number'], '10% of ₹' . number_format($productsValue, 2) . ' products value']);
        janani_sync_wallet_balance($pdo, (string)$user['id']);
        $expiresOn = date('d M Y', strtotime('+' . JANANI_CREDIT_VALIDITY_DAYS . ' days'));
        $lock = janani_credit_lock_reason($pdo, ['source_order' => $order['number']]);
        // Visible to the admin on the order
        try {
            $notes = janani_json_field($order['admin_notes'] ?? null, []);
            $notes[] = [
                'id' => 'NOTE-' . bin2hex(random_bytes(4)),
                'text' => 'First-order reward: ₹' . number_format($amount, 2) . " wallet credit issued ({$id}), valid till {$expiresOn}." . ($lock ? ' Unlocks after delivery (COD).' : ''),
                'author' => 'System',
                'date' => date('d M Y, h:i A'),
            ];
            $pdo->prepare("UPDATE `orders` SET `admin_notes` = ? WHERE `id` = ?")->execute([json_encode($notes, JSON_UNESCAPED_UNICODE), $order['id']]);
        } catch (Throwable $e) {}
        return [
            'id' => $id,
            'amount' => $amount,
            'expiresOn' => $expiresOn,
            'validityDays' => JANANI_CREDIT_VALIDITY_DAYS,
            'minOrderValue' => JANANI_CREDIT_MIN_ORDER_VALUE,
            'lockedReason' => $lock,
        ];
    } catch (Throwable $e) {
        error_log('[janani] first-order reward: ' . $e->getMessage());
        janani_reward_skip_note($pdo, $order, 'a system error occurred (' . mb_substr($e->getMessage(), 0, 160) . ')');
        return null;
    } finally {
        if ($locked) {
            try { $pdo->query("SELECT RELEASE_LOCK(" . $pdo->quote($lockName) . ")"); } catch (Throwable $e) {}
        }
    }
}

/** First-order credit earned by this order that has already been spent on another order. */
function janani_wallet_clawback_amount($pdo, $order) {
    try {
        $st = $pdo->prepare("SELECT COALESCE(SUM(`used_amount`), 0) FROM `wallet_credits` WHERE `source_order` = ? AND `type` = 'first_order_reward' AND `status` = 'used'");
        $st->execute([(string)$order['number']]);
        return round((float)$st->fetchColumn(), 2);
    } catch (Throwable $e) {
        return 0.0;
    }
}

/**
 * Wallet side effects when an order is cancelled or fully refunded:
 *  - credit spent on this order comes back (until its original expiry)
 *  - unused credit earned by this order is cancelled
 */
function janani_wallet_on_order_closed($pdo, $order) {
    $number = (string)$order['number'];
    $users = [];
    try {
        $st = $pdo->prepare("SELECT * FROM `wallet_credits` WHERE `used_order` = ? AND `status` = 'used'");
        $st->execute([$number]);
        foreach ($st->fetchAll(PDO::FETCH_ASSOC) as $c) {
            $users[$c['user_id']] = true;
            if (strtotime((string)$c['expires_at']) > time()) {
                $pdo->prepare("UPDATE `wallet_credits` SET `status` = 'active', `used_order` = NULL, `used_amount` = 0, `used_at` = NULL, `closed_at` = NULL, `note` = ? WHERE `id` = ? AND `status` = 'used'")
                    ->execute([janani_wallet_note_append($c['note'], "Restored: order {$number} was cancelled"), $c['id']]);
            } else {
                $pdo->prepare("UPDATE `wallet_credits` SET `status` = 'expired', `used_order` = NULL, `used_amount` = 0, `closed_at` = NOW(), `note` = ? WHERE `id` = ? AND `status` = 'used'")
                    ->execute([janani_wallet_note_append($c['note'], "Order {$number} was cancelled after the credit expired"), $c['id']]);
            }
        }
        $st = $pdo->prepare("SELECT * FROM `wallet_credits` WHERE `source_order` = ? AND `type` = 'first_order_reward' AND `status` = 'active'");
        $st->execute([$number]);
        foreach ($st->fetchAll(PDO::FETCH_ASSOC) as $c) {
            $users[$c['user_id']] = true;
            $pdo->prepare("UPDATE `wallet_credits` SET `status` = 'revoked', `closed_at` = NOW(), `note` = ? WHERE `id` = ? AND `status` = 'active'")
                ->execute([janani_wallet_note_append($c['note'], "First order {$number} was cancelled"), $c['id']]);
        }
    } catch (Throwable $e) {
        error_log('[janani] wallet on order close: ' . $e->getMessage());
    }
    foreach (array_keys($users) as $uid) {
        janani_sync_wallet_balance($pdo, $uid);
    }
}

/** Admin adjustment: credit adds a one-time store credit (same validity); debit reduces active credits. */
function janani_admin_wallet_adjust($pdo, $targetUser, $type, $amount, $description, $adminUser) {
    $amount = round((float)$amount, 2);
    if ($amount <= 0) return ['success' => false, 'message' => 'Amount must be greater than zero.'];
    $description = mb_substr(trim(strip_tags((string)$description)), 0, 200) ?: 'Admin adjustment';
    $uid = (string)$targetUser['id'];
    janani_expire_wallet_credits($pdo, $uid);
    if ($type === 'credit') {
        $id = 'WCR-' . strtoupper(bin2hex(random_bytes(5)));
        $pdo->prepare("INSERT INTO `wallet_credits` (`id`, `user_id`, `user_email`, `type`, `amount`, `status`, `note`, `issued_at`, `expires_at`, `created_by`)
            VALUES (?, ?, ?, 'admin_credit', ?, 'active', ?, NOW(), DATE_ADD(NOW(), INTERVAL " . (int)JANANI_CREDIT_VALIDITY_DAYS . " DAY), ?)")
            ->execute([$id, $uid, (string)($targetUser['email'] ?? ''), $amount, $description, (string)($adminUser['id'] ?? 'admin')]);
    } else {
        $st = $pdo->prepare("SELECT * FROM `wallet_credits` WHERE `user_id` = ? AND `status` = 'active' AND `expires_at` > NOW() ORDER BY `expires_at` ASC");
        $st->execute([$uid]);
        $toRemove = $amount;
        foreach ($st->fetchAll(PDO::FETCH_ASSOC) as $c) {
            if ($toRemove <= 0) break;
            $cut = round(min((float)$c['amount'], $toRemove), 2);
            $left = round((float)$c['amount'] - $cut, 2);
            $note = janani_wallet_note_append($c['note'], 'Admin debit ₹' . number_format($cut, 2) . ": {$description}");
            if ($left <= 0) {
                $pdo->prepare("UPDATE `wallet_credits` SET `status` = 'revoked', `closed_at` = NOW(), `note` = ? WHERE `id` = ?")->execute([$note, $c['id']]);
            } else {
                $pdo->prepare("UPDATE `wallet_credits` SET `amount` = ?, `note` = ? WHERE `id` = ?")->execute([$left, $note, $c['id']]);
            }
            $toRemove = round($toRemove - $cut, 2);
        }
        if ($toRemove >= $amount) {
            return ['success' => false, 'message' => 'This customer has no active wallet credit to debit.'];
        }
    }
    janani_sync_wallet_balance($pdo, $uid);
    $summary = janani_wallet_summary($pdo, $targetUser);
    return [
        'success' => true,
        'message' => $type === 'credit'
            ? '₹' . number_format($amount, 2) . ' wallet credit added (valid ' . JANANI_CREDIT_VALIDITY_DAYS . ' days, one-time use on an order of ₹' . JANANI_CREDIT_MIN_ORDER_VALUE . '+).'
            : 'Wallet credit reduced.',
        'data' => [
            'walletBalance' => $summary['totalBalance'],
            'transaction' => $summary['transactions'][0] ?? null,
            'wallet' => $summary,
        ],
    ];
}
