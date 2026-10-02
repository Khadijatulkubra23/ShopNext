const mongoose = require("mongoose");
const Product = require("../models/Product");

const getProducts = async (req, res) => {
  try {
    const { search, category, sort, minPrice, maxPrice, featured } = req.query;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 12, 50);

    const filter = {};

    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.name = { $regex: escaped, $options: "i" };
    }
    if (category && mongoose.isValidObjectId(category)) filter.category = category;
    if (featured === "true") filter.featured = true;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const sortOptions = {
      newest: { createdAt: -1 },
      "price-asc": { price: 1 },
      "price-desc": { price: -1 },
      name: { name: 1 },
    };

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .populate("category", "name")
      .sort(sortOptions[sort] || sortOptions.newest)
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ products, page, pages: Math.ceil(total / limit), total });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "category",
      "name"
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch product",
      error: error.message,
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      image,
      category,
      stock,
      featured,
    } = req.body;

    if (!name || !description || price === undefined || !category) {
      return res.status(400).json({
        message: "Name, description, price, and category are required",
      });
    }

    const product = await Product.create({
      name,
      description,
      price,
      image,
      category,
      stock,
      featured,
    });

    const populatedProduct = await product.populate("category", "name");

    res.status(201).json({
      message: "Product created successfully",
      product: populatedProduct,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create product",
      error: error.message,
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate("category", "name");

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update product",
      error: error.message,
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete product",
      error: error.message,
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};