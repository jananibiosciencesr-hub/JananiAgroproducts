import { products, categories } from "../data/mockData.js";

// @desc    Get all products with search, category & price filters
// @route   GET /api/products
export const getProducts = (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, sort, limit, page } = req.query;

    let filtered = [...products];

    // Category filter
    if (category && category !== "All") {
      filtered = filtered.filter(
        (p) =>
          p.category.toLowerCase() === category.toLowerCase() ||
          p.category.toLowerCase().includes(category.toLowerCase())
      );
    }

    // Search query filter
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    // Price range filter
    if (minPrice) {
      filtered = filtered.filter((p) => p.price >= Number(minPrice));
    }
    if (maxPrice) {
      filtered = filtered.filter((p) => p.price <= Number(maxPrice));
    }

    // Sorting
    if (sort === "low") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sort === "high") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sort === "rating") {
      filtered.sort((a, b) => b.rating - a.rating);
    } else {
      // featured / id
      filtered.sort((a, b) => a.id - b.id);
    }

    const total = filtered.length;

    // Optional pagination
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 50;
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = filtered.slice(startIndex, startIndex + limitNum);

    return res.status(200).json({
      success: true,
      total,
      count: paginated.length,
      page: pageNum,
      products: paginated,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single product by ID or slug
// @route   GET /api/products/:idOrSlug
export const getProductByIdOrSlug = (req, res) => {
  try {
    const { idOrSlug } = req.params;

    const product = products.find(
      (p) => String(p.id) === idOrSlug || p.slug === idOrSlug
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product not found with identifier: ${idOrSlug}`,
      });
    }

    // Find related products in same category
    const related = products
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, 4);

    return res.status(200).json({
      success: true,
      product,
      related,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all product categories
// @route   GET /api/categories
export const getCategories = (req, res) => {
  try {
    const categoriesWithCount = categories.map((cat) => ({
      ...cat,
      count: products.filter((p) => p.category.toLowerCase() === cat.name.toLowerCase()).length,
    }));

    return res.status(200).json({
      success: true,
      count: categoriesWithCount.length,
      categories: categoriesWithCount,
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
    const category = categories.find((c) => c.slug === slug);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: `Category not found with slug: ${slug}`,
      });
    }

    const categoryProducts = products.filter(
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
