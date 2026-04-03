const Products = require('../models/products'); 
const Category = require('../models/category');
const express = require('express');
const router = express.Router();
const upload = require('../utils/cloudinary');

// 1. GET ALL PRODUCTS
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const perPage = 150;
        let filter = {};

        // 1. Featured Filter
        if (req.query.isFeatured) {
            filter.isFeatured = req.query.isFeatured === 'true';
        }

        // 2. Location Filter
        if (req.query.location && req.query.location !== "All") {
            filter.location = req.query.location;
        }

        const totalPosts = await Products.countDocuments(filter);
        const totalPages = Math.ceil(totalPosts / perPage);

        const productList = await Products.find(filter)
            .populate('category')
            .skip((page - 1) * perPage)
            .limit(perPage);

        return res.status(200).json({
            "products": productList,
            "totalPages": totalPages,
            "page": page
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// NEW: GET RELATED PRODUCTS BY HASHTAGS
router.get('/related', async (req, res) => {
    try {
        const tags = req.query.tags ? req.query.tags.split(',') : [];
        
        if (tags.length === 0) {
            return res.status(200).json([]);
        }

        const searchPattern = tags.join('|');

        const relatedProducts = await Products.find({
            description: { $regex: searchPattern, $options: 'i' }
        }).limit(10);

        res.status(200).json(relatedProducts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 6. GET NEW ARRIVALS
router.get('/new-arrivals', async (req, res) => {
    try {
        const newProducts = await Products.find()
            .populate('category')
            .sort({ _id: -1 }) 
            .limit(10); 

        if (!newProducts) {
            return res.status(500).json({ success: false });
        }

        res.status(200).json({
            "products": newProducts
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. GET ONLY FEATURED PRODUCTS
router.get('/featured', async (req, res) => {
    try {
        const featuredProductList = await Products.find({ isFeatured: true }).populate('category');
        if (!featuredProductList || featuredProductList.length === 0) {
            return res.status(404).json({ success: false, message: "No featured products found" });
        }
        res.status(200).json({ "products": featuredProductList });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. GET SINGLE PRODUCT
router.get('/:id', async (req, res) => {
    try {
        const product = await Products.findById(req.params.id).populate('category');
        if (!product) {
            return res.status(404).json({ success: false, message: 'The product with the given ID was not found' });
        }
        res.status(200).send(product);
    } catch (err) {
        res.status(500).json({ success: false, message: "Invalid Product ID format" });
    }
});

// 3. CREATE PRODUCT
router.post('/create', upload.array('images', 10), async (req, res) => {
    try {
        if (!req.body.category) return res.status(400).send("Category ID is required");
        
        const category = await Category.findById(req.body.category);
        if (!category) return res.status(404).send("Invalid category");

        const imagesPaths = req.files.map(file => file.path);

        let product = new Products({
            name: req.body.name,
            description: req.body.description,
            images: imagesPaths.length > 0 ? imagesPaths : req.body.images, 
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category, 
            countInStock: req.body.countInStock || 0,
            rating: req.body.rating || 0,
            numReviews: req.body.numReviews || 0,
            isFeatured: req.body.isFeatured || false,
            discount: req.body.discount, 
            productRAMS: req.body.productRAMS, 
            productSIZE: req.body.productSIZE, 
            productWEIGHT: req.body.productWEIGHT, 
            location: req.body.location,
        });

        product = await product.save();
        res.status(201).json(product);
    } catch (err) {
        res.status(500).json({ error: err.message, success: false });
    }
});

// 4. UPDATE PRODUCT
router.put('/:id', async (req, res) => {
    try {
        if (req.body.category) {
            const category = await Category.findById(req.body.category);
            if (!category) return res.status(404).send("Invalid category");
        }
        const product = await Products.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                description: req.body.description,
                images: req.body.images,
                brand: req.body.brand,
                price: req.body.price,
                category: req.body.category, 
                countInStock: req.body.countInStock,
                rating: req.body.rating,
                numReviews: req.body.numReviews,
                isFeatured: req.body.isFeatured,
            },
            { new: true }
        );
        if (!product) return res.status(404).send('The product cannot be updated!');
        res.send(product);
    } catch (err) {
        res.status(500).json({ error: err.message, success: false });
    }
});

module.exports = router;