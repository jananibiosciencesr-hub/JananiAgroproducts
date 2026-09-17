import { products as mockProducts, categories as mockCategories } from "../data/mockData.js";
import { query, isDbConnected } from "../config/db.js";

// Helper to map DB row to product object
function formatProduct(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category_name,
    price: Number(row.price),
    oldPrice: row.old_price ? Number(row.old_price) : null,
    unit: row.unit,
    stock: row.stock,
    rating: Number(row.rating),
    reviews: row.reviews_count,
    badge: row.badge,
    image: row.image,
    description: row.description,
    origin: row.origin,
    certification: row.certification,
    active: Boolean(row.active),
    status: row.status,
    sku: row.sku
  };
}

// @desc    Get all products with search, category & price filters
// @route   GET /api/products
export const getProducts = async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, sort, limit, page } = req.query;

    if (isDbConnected()) {
      try {
        let sql = "SELECT * FROM products WHERE active = 1";
        const params = [];

        if (category && category !== "All") {
          sql += " AND (LOWER(category_name) = LOWER(?) OR LOWER(category_name) LIKE ?)";
          params.push(category, `%${category}%`);
        }
        if (search) {
          sql += " AND (LOWER(name) LIKE ? OR LOWER(category_name) LIKE ? OR LOWER(description) LIKE ?)";
          params.push(`%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`);
        }
        if (minPrice) {
          sql += " AND price >= ?";
          params.push(Number(minPrice));
        }
        if (maxPrice) {
          sql += " AND price <= ?";
          params.push(Number(maxPrice));
        }

        if (sort === "low") {
          sql += " ORDER BY price ASC";
        } else if (sort === "high") {
          sql += " ORDER BY price DESC";
        } else if (sort === "rating") {
          sql += " ORDER BY rating DESC";
        } else {
          sql += " ORDER BY id ASC";
        }

        const rows = await query(sql, params);
        if (Array.isArray(rows) && rows.length > 0) {
          const formatted = rows.map(formatProduct);
          return res.status(200).json({
            success: true,
            total: formatted.length,
            count: formatted.length,
            products: formatted,
            source: "mysql"
          });
        }
      } catch (dbErr) {
        console.warn("⚠️ [Products] DB query error, falling back to mock catalog:", dbErr.message);
      }
    }

    // Fallback to local catalog
    let filtered = [...mockProducts];

    if (category && category !== "All") {
      filtered = filtered.filter(
        (p) =>
          p.category.toLowerCase() === category.toLowerCase() ||
          p.category.toLowerCase().includes(category.toLowerCase())
      );
    }

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    if (minPrice) filtered = filtered.filter((p) => p.price >= Number(minPrice));
    if (maxPrice) filtered = filtered.filter((p) => p.price <= Number(maxPrice));

    if (sort === "low") filtered.sort((a, b) => a.price - b.price);
    else if (sort === "high") filtered.sort((a, b) => b.price - a.price);
    else if (sort === "rating") filtered.sort((a, b) => b.rating - a.rating);
    else filtered.sort((a, b) => a.id - b.id);

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 50;
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = filtered.slice(startIndex, startIndex + limitNum);

    return res.status(200).json({
      success: true,
      total: filtered.length,
      count: paginated.length,
      page: pageNum,
      products: paginated,
      source: "mock"
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single product by ID or slug
// @route   GET /api/products/:idOrSlug
export const getProductByIdOrSlug = async (req, res) => {
  try {
    const { idOrSlug } = req.params;

    if (isDbConnected()) {
      try {
        const rows = await query(
          "SELECT * FROM products WHERE id = ? OR slug = ? LIMIT 1",
          [idOrSlug, idOrSlug]
        );
        if (rows && rows.length > 0) {
          const product = formatProduct(rows[0]);
          const relatedRows = await query(
            "SELECT * FROM products WHERE category_name = ? AND id != ? LIMIT 4",
            [rows[0].category_name, rows[0].id]
          );
          return res.status(200).json({
            success: true,
            product,
            related: (relatedRows || []).map(formatProduct),
            source: "mysql"
          });
        }
      } catch (dbErr) {
        console.warn("⚠️ [Product] DB query error:", dbErr.message);
      }
    }

    const product = mockProducts.find(
      (p) => String(p.id) === idOrSlug || p.slug === idOrSlug
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product not found with identifier: ${idOrSlug}`,
      });
    }

    const related = mockProducts
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, 4);

    return res.status(200).json({
      success: true,
      product,
      related,
      source: "mock"
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all product categories
// @route   GET /api/products/categories
export const getCategories = async (req, res) => {
  try {
    if (isDbConnected()) {
      try {
        const rows = await query("SELECT * FROM categories WHERE active = 1 AND deleted_at IS NULL ORDER BY display_order ASC");
        if (Array.isArray(rows) && rows.length > 0) {
          return res.status(200).json({
            success: true,
            count: rows.length,
            categories: rows,
            source: "mysql"
          });
        }
      } catch (dbErr) {
        console.warn("⚠️ [Categories] DB error:", dbErr.message);
      }
    }

    const categoriesWithCount = mockCategories.map((cat) => ({
      ...cat,
      count: mockProducts.filter((p) => p.category.toLowerCase() === cat.name.toLowerCase()).length,
    }));

    return res.status(200).json({
      success: true,
      count: categoriesWithCount.length,
      categories: categoriesWithCount,
      source: "mock"
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single category with its products
// @route   GET /api/categories/:slug
export const getCategoryBySlug = (req, res) => {
  try {
    const { slug } = req.params;
    const category = mockCategories.find((c) => c.slug === slug);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: `Category not found with slug: ${slug}`,
      });
    }

    const categoryProducts = mockProducts.filter(
      (p) =>
        p.category.toLowerCase() === category.name.toLowerCase() ||
        p.category.toLowerCase().includes(category.name.toLowerCase())
    );

    return res.status(200).json({
      success: true,
      category,
      count: categoryProducts.length,
      products: categoryProducts,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
