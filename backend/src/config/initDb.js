import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PORT = Number(process.env.DB_PORT) || 3306;
const DB_USER = process.env.DB_USER || "u409810820_Jananiagropro";
const DB_PASSWORD = process.env.DB_PASSWORD || "Jananiagro@123";
const DB_NAME = process.env.DB_NAME || "u409810820_Jananiagro";

export async function initDatabase() {
  let connection;
  const results = {
    connected: false,
    databaseCreated: false,
    tablesCreated: [],
    seedsInserted: [],
    errors: []
  };

  try {
    // Step 1: Connect to MySQL server (try to connect directly or connect to host)
    try {
      connection = await mysql.createConnection({
        host: DB_HOST,
        port: DB_PORT,
        user: DB_USER,
        password: DB_PASSWORD,
        charset: "utf8mb4"
      });
      console.log(`🔌 [MySQL Init] Connected to MySQL host ${DB_HOST}:${DB_PORT}`);

      // Step 2: Try creating the database if it doesn't exist
      try {
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        console.log(`📦 [MySQL Init] Database \`${DB_NAME}\` verified/created.`);
        results.databaseCreated = true;
      } catch (dbErr) {
        console.log(`ℹ️ [MySQL Init] Note on CREATE DATABASE (${dbErr.message}) - Hostinger user may only have privileges directly on \`${DB_NAME}\`.`);
      }
      await connection.end();
    } catch (hostErr) {
      console.log(`ℹ️ [MySQL Init] Host-level connection skipped: ${hostErr.message}. Connecting directly to database \`${DB_NAME}\`...`);
    }

    // Step 3: Connect directly to the targeted database
    connection = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      charset: "utf8mb4"
    });
    results.connected = true;
    console.log(`🎯 [MySQL Init] Successfully connected to \`${DB_NAME}\`! Creating tables...`);

    // 1. Users / Customers table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(50),
        password VARCHAR(255),
        role VARCHAR(50) DEFAULT 'Customer',
        wallet_balance DECIMAL(10,2) DEFAULT 0.00,
        loyalty_points INT DEFAULT 0,
        tier VARCHAR(50) DEFAULT 'Silver',
        status VARCHAR(50) DEFAULT 'Active',
        referral_code VARCHAR(50),
        is_verified BOOLEAN DEFAULT TRUE,
        preferences JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    results.tablesCreated.push("users");

    // 2. Categories table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        level INT DEFAULT 1,
        parent_id VARCHAR(64) NULL,
        parent_name VARCHAR(255) NULL,
        image VARCHAR(500),
        product_count INT DEFAULT 0,
        active BOOLEAN DEFAULT TRUE,
        featured BOOLEAN DEFAULT FALSE,
        trending BOOLEAN DEFAULT FALSE,
        display_order INT DEFAULT 0,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    results.tablesCreated.push("categories");

    // 3. Products table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        slug VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        category_name VARCHAR(255) NOT NULL,
        category_id VARCHAR(64) NULL,
        price DECIMAL(10,2) NOT NULL,
        old_price DECIMAL(10,2),
        unit VARCHAR(50) DEFAULT '1 kg',
        stock INT DEFAULT 50,
        rating DECIMAL(2,1) DEFAULT 4.8,
        reviews_count INT DEFAULT 0,
        badge VARCHAR(100) NULL,
        image VARCHAR(500),
        description TEXT,
        origin VARCHAR(255) DEFAULT 'Lodhika GIDC, Gujarat',
        certification VARCHAR(255) DEFAULT 'Certified Organic & NPOP Verified',
        active BOOLEAN DEFAULT TRUE,
        status VARCHAR(50) DEFAULT 'Active',
        sku VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    results.tablesCreated.push("products");

    // 4. Orders table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(64) PRIMARY KEY,
        number VARCHAR(64) UNIQUE NOT NULL,
        order_date VARCHAR(100),
        customer_name VARCHAR(255),
        customer_email VARCHAR(255),
        customer_phone VARCHAR(50),
        shipping_address JSON,
        items JSON,
        subtotal DECIMAL(10,2) DEFAULT 0.00,
        discount DECIMAL(10,2) DEFAULT 0.00,
        delivery_fee DECIMAL(10,2) DEFAULT 0.00,
        total DECIMAL(10,2) NOT NULL,
        payment_method VARCHAR(100) DEFAULT 'UPI / Online',
        payment_status VARCHAR(50) DEFAULT 'Paid',
        order_status VARCHAR(50) DEFAULT 'Processing',
        courier VARCHAR(100) DEFAULT 'Delhivery Air Express',
        tracking_id VARCHAR(100),
        awb VARCHAR(100),
        warehouse VARCHAR(255) DEFAULT 'Lodhika GIDC Central Facility',
        timeline JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    results.tablesCreated.push("orders");

    // 5. Coupons table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS coupons (
        id VARCHAR(64) PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        type VARCHAR(50) DEFAULT 'percentage',
        discount DECIMAL(10,2) NOT NULL,
        min_cart DECIMAL(10,2) DEFAULT 0.00,
        max_discount DECIMAL(10,2) DEFAULT 0.00,
        start_date DATE,
        expiry_date DATE,
        uses INT DEFAULT 0,
        max_uses INT DEFAULT 1000,
        per_user_limit INT DEFAULT 1,
        is_first_order_only BOOLEAN DEFAULT FALSE,
        is_free_shipping BOOLEAN DEFAULT FALSE,
        user_specific_tier VARCHAR(50) DEFAULT 'All',
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    results.tablesCreated.push("coupons");

    // 6. Settings table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        setting_key VARCHAR(100) UNIQUE NOT NULL,
        setting_value JSON NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    results.tablesCreated.push("settings");

    // 7. Reviews table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id VARCHAR(64) PRIMARY KEY,
        product_id VARCHAR(64) NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        customer_id VARCHAR(64),
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255),
        rating INT DEFAULT 5,
        title VARCHAR(255),
        comment TEXT,
        verified_purchase BOOLEAN DEFAULT TRUE,
        status VARCHAR(50) DEFAULT 'Approved',
        helpful_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    results.tablesCreated.push("reviews");

    // 8. CMS Banners table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS cms_banners (
        id VARCHAR(64) PRIMARY KEY,
        type VARCHAR(50) DEFAULT 'hero',
        title VARCHAR(255) NOT NULL,
        subtitle VARCHAR(255),
        image_url VARCHAR(500),
        cta_label VARCHAR(100),
        cta_url VARCHAR(255),
        badge VARCHAR(100),
        slide_order INT DEFAULT 1,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    results.tablesCreated.push("cms_banners");

    // 9. Payments table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id VARCHAR(64) PRIMARY KEY,
        order_id VARCHAR(64) NOT NULL,
        customer_name VARCHAR(255),
        customer_email VARCHAR(255),
        gateway VARCHAR(50) DEFAULT 'Razorpay',
        method VARCHAR(50) DEFAULT 'UPI',
        gross_amount DECIMAL(10,2) NOT NULL,
        gateway_fee DECIMAL(10,2) DEFAULT 0.00,
        net_settled_amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'INR',
        status VARCHAR(50) DEFAULT 'Captured',
        refunded_amount DECIMAL(10,2) DEFAULT 0.00,
        bank_utr VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    results.tablesCreated.push("payments");

    // 10. Inquiries table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS inquiries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        business_name VARCHAR(255),
        service VARCHAR(100),
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        quantity VARCHAR(100),
        message TEXT,
        status VARCHAR(50) DEFAULT 'New',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    results.tablesCreated.push("inquiries");

    // 11. Activity logs table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id VARCHAR(64) PRIMARY KEY,
        actor_name VARCHAR(255),
        actor_email VARCHAR(255),
        actor_role VARCHAR(100),
        action VARCHAR(255),
        module VARCHAR(100),
        severity VARCHAR(50) DEFAULT 'low',
        ip_address VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    results.tablesCreated.push("activity_logs");

    console.log(`✅ [MySQL Init] All 11 tables verified/created successfully.`);

    // Auto-migrate any missing columns for future client requirements
    const schemasToCheck = {
      users: { avatar: "VARCHAR(500)", preferences: "JSON" },
      products: { cost_price: "DECIMAL(10,2)", gallery: "JSON", features: "JSON", nutrition_facts: "JSON", tags: "JSON", hsn_code: "VARCHAR(50)", tax_rate: "DECIMAL(5,2) DEFAULT 0.00" },
      orders: { billing_address: "JSON", tax_amount: "DECIMAL(10,2) DEFAULT 0.00", delivery_slot: "VARCHAR(100)", customer_notes: "TEXT" }
    };
    for (const [table, cols] of Object.entries(schemasToCheck)) {
      try {
        const [existing] = await connection.query(`SHOW COLUMNS FROM \`${table}\``);
        const existingNames = existing.map(c => c.Field.toLowerCase());
        for (const [colName, colDef] of Object.entries(cols)) {
          if (!existingNames.includes(colName.toLowerCase())) {
            await connection.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${colName}\` ${colDef}`);
            console.log(`✨ [Auto-Migration] Added missing column ${table}.${colName}`);
          }
        }
      } catch (e) {
        console.warn(`[Auto-Migration] Notice on ${table}:`, e.message);
      }
    }

    // ==========================================
    // SEEDING DEFAULT JANANI AGRO DATA IF EMPTY
    // ==========================================

    // Seed Categories if empty
    const [catRows] = await connection.query(`SELECT COUNT(*) as count FROM categories`);
    if (catRows[0].count === 0) {
      console.log(`🌱 [MySQL Seed] Seeding categories...`);
      const categoriesSeed = [
        ["cat-oils", "Cold Pressed Oils", "cold-pressed-oils", 1, null, null, "/images/categories/oils.webp", 4, 1, 1, 1],
        ["cat-rice", "Organic Rice", "organic-rice", 1, null, null, "/images/categories/rice.webp", 3, 1, 1, 0],
        ["cat-pulses", "Pulses & Dals", "pulses", 1, null, null, "/images/categories/pulses.webp", 3, 1, 1, 0],
        ["cat-spices", "Raw Spices", "spices", 1, null, null, "/images/categories/spices.webp", 4, 1, 1, 1],
        ["cat-wheat", "Wheat & Grains", "wheat", 1, null, null, "/images/categories/wheat.webp", 2, 1, 0, 0],
        ["cat-millets", "Ancient Millets", "millets", 1, null, null, "/images/categories/millets.webp", 2, 1, 0, 1],
        ["cat-seeds", "Seeds & Superfoods", "seeds", 1, null, null, "/images/categories/seeds.webp", 3, 1, 0, 0],
        ["cat-flours", "Stoneground Flours", "flours", 1, null, null, "/images/categories/flours.webp", 2, 1, 0, 0],
        ["cat-dryfruits", "Dry Fruits & Sweeteners", "dry-fruits", 1, null, null, "/images/categories/dryfruits.webp", 2, 1, 0, 0],
        ["cat-fertilizers", "Organic Fertilizers", "organic-fertilizers", 1, null, null, "/images/categories/fertilizers.webp", 1, 1, 0, 0]
      ];
      for (const [id, name, slug, level, parentId, parentName, img, count, active, featured, trending] of categoriesSeed) {
        await connection.query(
          `INSERT IGNORE INTO categories (id, name, slug, level, parent_id, parent_name, image, product_count, active, featured, trending) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [id, name, slug, level, parentId, parentName, img, count, active, featured, trending]
        );
      }
      results.seedsInserted.push("categories (10)");
    }

    // Seed Products if empty
    const [prodRows] = await connection.query(`SELECT COUNT(*) as count FROM products`);
    if (prodRows[0].count === 0) {
      console.log(`🌱 [MySQL Seed] Seeding 24 organic products...`);
      const productsSeed = [
        ["wood-pressed-groundnut-oil", "Wood Pressed Groundnut Oil", "Cold Pressed Oils", 399, 480, "1 L", 85, 4.9, 86, "Bestseller", "/images/products/wood-pressed-groundnut-oil.webp", "Slow wood-pressed from Saurashtra native groundnuts. 100% natural, chemical-free.", "JAP-SKU-001"],
        ["cold-pressed-mustard-oil", "Cold Pressed Mustard Oil", "Cold Pressed Oils", 329, 395, "1 L", 60, 4.8, 54, "Pure Kachi Ghani", "/images/products/cold-pressed-mustard-oil.webp", "Traditional Kachi Ghani extracted from whole yellow and brown mustard seeds.", "JAP-SKU-002"],
        ["virgin-coconut-oil", "Cold Pressed Virgin Coconut Oil", "Cold Pressed Oils", 449, 540, "500 ml", 45, 4.9, 42, "Pure Aroma", "/images/products/virgin-coconut-oil.webp", "Cold extracted from freshly grated coconut milk. Raw, unrefined, and aromatic.", "JAP-SKU-003"],
        ["organic-basmati-rice", "Royal Aged Organic Basmati Rice", "Organic Rice", 249, 299, "1 kg", 120, 4.9, 112, "Heritage Reserve", "/images/products/organic-basmati-rice.webp", "Aged 2 years for elongated grain fluffiness and authentic aroma.", "JAP-SKU-004"],
        ["brown-rice", "Traditional Brown Basmati Rice", "Organic Rice", 219, 260, "1 kg", 75, 4.7, 38, null, "/images/products/brown-rice.webp", "Unpolished nutrient-rich brown rice rich in dietary fibre.", "JAP-SKU-005"],
        ["unpolished-toor-dal", "Unpolished Organic Toor Dal", "Pulses & Dals", 199, 240, "1 kg", 90, 4.8, 64, "High Protein", "/images/products/unpolished-toor-dal.webp", "Zero water polish, enzyme-rich farm fresh toor dal that cooks easily.", "JAP-SKU-006"],
        ["organic-green-gram", "Organic Whole Moong (Green Gram)", "Pulses & Dals", 179, 215, "500 g", 65, 4.8, 41, null, "/images/products/organic-green-gram.webp", "High-sprouting native whole green moong for nutritious daily meals.", "JAP-SKU-007"],
        ["split-bengal-gram", "Organic Chana Dal (Bengal Gram)", "Pulses & Dals", 149, 180, "500 g", 70, 4.7, 29, null, "/images/products/split-bengal-gram.webp", "Stone-milled pesticide-free split Bengal gram dal.", "JAP-SKU-008"],
        ["lakadong-turmeric-powder", "Lakadong High-Curcumin Turmeric Powder", "Raw Spices", 189, 230, "200 g", 80, 5.0, 95, "7.8% Curcumin", "/images/products/lakadong-turmeric-powder.webp", "Organically harvested Meghalaya Lakadong turmeric with superior medicinal potency.", "JAP-SKU-009"],
        ["kashmiri-red-chilli-powder", "Kashmiri Mild Red Chilli Powder", "Raw Spices", 169, 205, "200 g", 60, 4.8, 48, "Vibrant Colour", "/images/products/kashmiri-red-chilli-powder.webp", "Stemless sun-dried Kashmiri chillies delivering vivid crimson shade and mild heat.", "JAP-SKU-010"],
        ["whole-coriander-powder", "Stone Ground Coriander Powder", "Raw Spices", 139, 170, "200 g", 55, 4.7, 33, null, "/images/products/whole-coriander-powder.webp", "Freshly powdered whole aromatic Dhana seeds.", "JAP-SKU-011"],
        ["cumin-seeds", "Whole Native Cumin Seeds (Jeera)", "Raw Spices", 219, 265, "200 g", 70, 4.9, 52, "Rich Essential Oils", "/images/products/cumin-seeds.webp", "Sun-cured Gujarat cumin seeds packed with aroma.", "JAP-SKU-012"],
        ["khapli-wheat", "Ancient Emmer (Khapli) Wheat", "Wheat & Grains", 189, 230, "1 kg", 50, 4.9, 61, "Diabetic Friendly", "/images/products/khapli-wheat.webp", "Low GI indigenous grain celebrated for sustained energy.", "JAP-SKU-013"],
        ["premium-wheat-flour", "Chakki Fresh Sharbati Atta", "Wheat & Grains", 119, 145, "1 kg", 150, 4.8, 88, null, "/images/products/premium-wheat-flour.webp", "100% whole grain wheat flour ground at low temperature.", "JAP-SKU-014"],
        ["foxtail-millet", "Organic Foxtail Millet (Kangni)", "Ancient Millets", 149, 180, "500 g", 65, 4.8, 44, "Superfood", "/images/products/foxtail-millet.webp", "Gluten-free traditional grain rich in iron and phosphorus.", "JAP-SKU-015"],
        ["pearl-millet", "Native Desi Bajra (Pearl Millet)", "Ancient Millets", 109, 135, "500 g", 80, 4.7, 31, null, "/images/products/pearl-millet.webp", "Wholesome winter millet grown in dry Saurashtra soils.", "JAP-SKU-016"],
        ["organic-sesame-seeds", "Natural White Sesame Seeds (Til)", "Seeds & Superfoods", 159, 195, "250 g", 55, 4.8, 36, "Calcium Rich", "/images/products/organic-sesame-seeds.webp", "Sun-dried whole unhulled white sesame seeds.", "JAP-SKU-017"],
        ["flax-seeds", "Roasted Golden Flax Seeds (Alsi)", "Seeds & Superfoods", 169, 205, "250 g", 70, 4.9, 47, "Omega-3", "/images/products/flax-seeds.webp", "Nutrient-dense superfood for cardiovascular wellness.", "JAP-SKU-018"],
        ["stoneground-besan", "Fine Stoneground Gram Flour (Besan)", "Stoneground Flours", 139, 170, "500 g", 85, 4.8, 59, null, "/images/products/stoneground-besan.webp", "Silky smooth aromatic chana dal flour for pakoras and laddoos.", "JAP-SKU-019"],
        ["natural-jaggery-powder", "Unrefined Desi Jaggery Powder (Gud)", "Dry Fruits & Sweeteners", 129, 160, "500 g", 95, 4.9, 73, "Chemical Free", "/images/products/natural-jaggery-powder.webp", "Naturally crystallised sugarcane juice without chemical bleaching.", "JAP-SKU-020"],
        ["almonds-premium", "Giri Mamra Almonds", "Dry Fruits & Sweeteners", 599, 720, "500 g", 40, 5.0, 51, "High Oil Content", "/images/products/almonds-premium.webp", "Hand-selected unpasteurized Mamra almonds from verified orchards.", "JAP-SKU-021"],
        ["vermicompost-plus", "Bio-Enriched Vermicompost Fertilizer", "Organic Fertilizers", 299, 360, "5 kg", 100, 4.9, 67, "100% Organic", "/images/products/vermicompost-plus.webp", "Earthworm enriched organic manure for lush terrace and farm crops.", "JAP-SKU-022"],
        ["native-vegetable-seeds", "Indigenous Heritage Kitchen Garden Seed Kit", "Seeds & Superfoods", 199, 250, "12 packs", 60, 4.9, 43, "Non-Hybrid", "/images/products/native-vegetable-seeds.webp", "12 non-GMO heirloom open-pollinated vegetable varieties.", "JAP-SKU-023"],
        ["black-pepper-whole", "Malabar Bold Black Peppercorns", "Raw Spices", 299, 365, "150 g", 50, 4.9, 39, "Grade TGSEB", "/images/products/black-pepper-whole.webp", "Large-berried Tellicherry black pepper with punchy heat.", "JAP-SKU-024"]
      ];

      for (const [slug, name, cat, price, oldPrice, unit, stock, rating, reviews, badge, img, desc, sku] of productsSeed) {
        await connection.query(
          `INSERT IGNORE INTO products (slug, name, category_name, price, old_price, unit, stock, rating, reviews_count, badge, image, description, sku) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [slug, name, cat, price, oldPrice, unit, stock, rating, reviews, badge, img, desc, sku]
        );
      }
      results.seedsInserted.push("products (24)");
    }

    // Seed Coupons if empty
    const [coupRows] = await connection.query(`SELECT COUNT(*) as count FROM coupons`);
    if (coupRows[0].count === 0) {
      console.log(`🌱 [MySQL Seed] Seeding promo coupons...`);
      const couponsSeed = [
        ["coup-1", "JANANI10", "10% Off Storewide", "Save 10% on your entire basket of organic essentials", "percentage", 10.0, 499.0, 200.0, "2026-01-01", "2026-12-31", 142, 1000, 1, 1],
        ["coup-2", "HARVEST15", "15% Harvest Fest Savings", "15% off orders above ₹999 on cold pressed oils and pulses", "percentage", 15.0, 999.0, 350.0, "2026-01-01", "2026-12-31", 88, 500, 1, 1],
        ["coup-3", "FREESHIP", "Free Priority Delivery", "Complimentary delivery anywhere in India on orders ₹499+", "percentage", 0.0, 499.0, 60.0, "2026-01-01", "2026-12-31", 110, 2000, 2, 1],
        ["coup-4", "BILONA20", "Flat 20% on Desi Ghee", "Exclusive discount on Vedic A2 Gir Cow Bilona Ghee", "percentage", 20.0, 1200.0, 500.0, "2026-01-01", "2026-12-31", 64, 300, 1, 1]
      ];
      for (const [id, code, title, desc, type, discount, minCart, maxDiscount, start, end, uses, maxUses, perUser, active] of couponsSeed) {
        await connection.query(
          `INSERT IGNORE INTO coupons (id, code, title, description, type, discount, min_cart, max_discount, start_date, expiry_date, uses, max_uses, per_user_limit, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [id, code, title, desc, type, discount, minCart, maxDiscount, start, end, uses, maxUses, perUser, active]
        );
      }
      results.seedsInserted.push("coupons (4)");
    }

    // Seed Settings if empty
    const [setRows] = await connection.query(`SELECT COUNT(*) as count FROM settings`);
    if (setRows[0].count === 0) {
      console.log(`🌱 [MySQL Seed] Seeding store settings...`);
      const defaultSettings = {
        store: {
          storeName: "Janani Agro Products",
          legalBusinessName: "Janani Agro Industries Private Limited",
          supportEmail: "care@jananiagro.com",
          supportPhone: "+91 98480 22338",
          storeAddress: "Plot No. 42-B, Lodhika GIDC Industrial Area, Metoda",
          city: "Rajkot",
          state: "Gujarat",
          pincode: "360021",
          country: "India",
          fssaiLicenseNo: "10722026000412",
          cinNumber: "U01111GJ2022PTC132890",
          gstin: "29AABCI9928P1Z8",
          defaultCurrency: "INR (₹)",
          defaultTimezone: "Asia/Kolkata (IST)",
          weightUnit: "kg / g",
          dimensionsUnit: "cm",
          orderIdPrefix: "JAP-",
          orderIdPadding: 6,
          maintenanceMode: false,
          operatingHours: "Monday – Saturday: 9:00 AM – 7:00 PM IST"
        },
        shipping: {
          defaultWarehouse: "Lodhika GIDC Central Facility",
          courier: "Delhivery Air Express",
          freeDeliveryThreshold: 799,
          standardDeliveryFee: 60
        }
      };

      await connection.query(
        `INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
        ["store_profile", JSON.stringify(defaultSettings.store)]
      );
      await connection.query(
        `INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
        ["shipping_rules", JSON.stringify(defaultSettings.shipping)]
      );
      results.seedsInserted.push("settings");
    }

    // Seed Admin / Demo User if empty
    const [userRows] = await connection.query(`SELECT COUNT(*) as count FROM users`);
    if (userRows[0].count === 0) {
      console.log(`🌱 [MySQL Seed] Seeding default users...`);
      const usersSeed = [
        ["STAFF-001", "Rajesh Varma", "admin@jananiagro.com", "+91 98480 22338", "Super Admin", 250.0, 500, "Platinum", "Active", "JANANI8492"],
        ["CUST-001", "Dr. Ananya Iyer", "dr.ananya@heritagehealth.org", "+91 98450 11223", "Customer", 420.0, 850, "Gold", "Active", "JANANI3821"],
        ["CUST-002", "Vikramaditya Rao", "vikram.rao@technocorp.in", "+91 99800 44556", "Customer", 150.0, 320, "Silver", "Active", "JANANI9104"]
      ];
      for (const [id, name, email, phone, role, wallet, points, tier, status, ref] of usersSeed) {
        await connection.query(
          `INSERT IGNORE INTO users (id, name, email, phone, role, wallet_balance, loyalty_points, tier, status, referral_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [id, name, email, phone, role, wallet, points, tier, status, ref]
        );
      }
      results.seedsInserted.push("users (3)");
    }

    // Seed Orders if empty
    const [orderRows] = await connection.query(`SELECT COUNT(*) as count FROM orders`);
    if (orderRows[0].count === 0) {
      console.log(`🌱 [MySQL Seed] Seeding initial orders...`);
      const ordersSeed = [
        [
          "JAP-849201",
          "JAP-849201",
          "11 Sep 2026, 14:20",
          "Rajesh Varma",
          "rajesh.varma@gmail.com",
          "+91 98480 22338",
          JSON.stringify({ name: "Rajesh Varma", street: "Flat 402, Green Palms, Indiranagar", city: "Bengaluru", state: "Karnataka", pincode: "560038" }),
          JSON.stringify([{ productId: 1, title: "Wood Pressed Groundnut Oil (5L)", price: 1850, quantity: 1, subtotal: 1850 }]),
          2450.0, 245.0, 0.0, 2205.0,
          "UPI Instant", "Paid", "Delivered",
          "Delhivery Air Express", "DEL-8492048194", "DEL-8492048194"
        ],
        [
          "JAP-849202",
          "JAP-849202",
          "10 Sep 2026, 18:45",
          "Dr. Ananya Iyer",
          "dr.ananya@heritagehealth.org",
          "+91 98450 11223",
          JSON.stringify({ name: "Dr. Ananya Iyer", street: "Villa 14, Palm Meadows, Whitefield", city: "Bengaluru", state: "Karnataka", pincode: "560066" }),
          JSON.stringify([{ productId: 4, title: "Royal Aged Basmati Rice (5kg)", price: 1200, quantity: 2, subtotal: 2400 }]),
          3890.0, 583.0, 0.0, 3307.0,
          "Razorpay (Credit Card)", "Paid", "In Transit",
          "Delhivery Air Express", "DEL-8492048195", "DEL-8492048195"
        ]
      ];

      for (const [id, num, dt, name, email, phone, addr, items, sub, disc, ship, total, method, payStat, ordStat, courier, trk, awb] of ordersSeed) {
        await connection.query(
          `INSERT IGNORE INTO orders (id, number, order_date, customer_name, customer_email, customer_phone, shipping_address, items, subtotal, discount, delivery_fee, total, payment_method, payment_status, order_status, courier, tracking_id, awb) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [id, num, dt, name, email, phone, addr, items, sub, disc, ship, total, method, payStat, ordStat, courier, trk, awb]
        );
      }
      results.seedsInserted.push("orders (2)");
    }

    await connection.end();
    console.log(`🎉 [MySQL Init] Complete database setup finished successfully!`);
    return { success: true, ...results };
  } catch (err) {
    if (connection) {
      try { await connection.end(); } catch (e) {}
    }
    console.error(`❌ [MySQL Init Error]`, err);
    results.errors.push(err.message);
    return { success: false, ...results, error: err.message };
  }
}

// Allow direct CLI execution: node src/config/initDb.js
if (process.argv[1]?.endsWith("initDb.js")) {
  initDatabase().then((res) => {
    console.log("\nSummary of Database Setup:");
    console.log(JSON.stringify(res, null, 2));
    process.exit(res.success ? 0 : 1);
  });
}
