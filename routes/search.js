const Product = require('../models/products.js'); 
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const query = req.query.q;

        if (!query) {
            return res.status(200).json([]); 
        }

        // Database search logic
        const items = await Product.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { brand: { $regex: query, $options: 'i' } },
                { catName: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ]
        });

        res.status(200).json(items);

    } catch (err) {
        console.error("Search API Error:", err); 
        res.status(500).json({ 
            msg: 'Server error', 
            error: err.message 
        });
    }
});

module.exports = router;