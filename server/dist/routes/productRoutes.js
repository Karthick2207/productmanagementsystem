"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Product_1 = require("../models/Product");
const router = express_1.default.Router();
// GET all products (with pagination and search)
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const search = req.query.search;
        const query = {};
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }
        const skip = (page - 1) * limit;
        const products = await Product_1.Product.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const total = await Product_1.Product.countDocuments(query);
        res.json({
            products: products.map(p => ({
                id: p._id,
                name: p.name,
                price: p.price,
                stock: p.stock
            })),
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            totalCount: total
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error fetching products' });
    }
});
// GET single product by ID
router.get('/:id', async (req, res) => {
    try {
        const product = await Product_1.Product.findById(req.params.id);
        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }
        res.json({
            id: product._id,
            name: product.name,
            price: product.price,
            stock: product.stock
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error fetching product' });
    }
});
// POST new product
router.post('/', async (req, res) => {
    try {
        const { name, price, stock } = req.body;
        if (!name || price === undefined || stock === undefined) {
            res.status(400).json({ message: 'All fields are required' });
            return;
        }
        const newProduct = new Product_1.Product({ name, price, stock });
        const savedProduct = await newProduct.save();
        res.status(201).json({
            id: savedProduct._id,
            name: savedProduct.name,
            price: savedProduct.price,
            stock: savedProduct.stock
        });
    }
    catch (error) {
        res.status(400).json({ message: error.message || 'Error creating product' });
    }
});
// PUT update product
router.put('/:id', async (req, res) => {
    try {
        const { name, price, stock } = req.body;
        if (!name || price === undefined || stock === undefined) {
            res.status(400).json({ message: 'All fields are required' });
            return;
        }
        const updatedProduct = await Product_1.Product.findByIdAndUpdate(req.params.id, { name, price, stock }, { new: true, runValidators: true });
        if (!updatedProduct) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }
        res.json({
            id: updatedProduct._id,
            name: updatedProduct.name,
            price: updatedProduct.price,
            stock: updatedProduct.stock
        });
    }
    catch (error) {
        res.status(400).json({ message: error.message || 'Error updating product' });
    }
});
// DELETE product
router.delete('/:id', async (req, res) => {
    try {
        const deletedProduct = await Product_1.Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }
        res.json({ message: 'Product deleted successfully', id: deletedProduct._id });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting product' });
    }
});
exports.default = router;
