const Category = require('../models/category');
const express = require('express');
const router = express.Router();

// 1. GET ALL CATEGORIES
router.get('/', async (req, res) => {
    try {
        const categoryList = await Category.find();
        if (!categoryList) {
            return res.status(500).json({ success: false });
        }
        res.status(200).send(categoryList);
    } catch (err) {
        res.status(500).json({ error: err.message, success: false });
    }
});

// 2. GET SINGLE CATEGORY
router.get('/:id', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found!' });
        }
        res.status(200).send(category);
    } catch (err) {
        res.status(500).json({ success: false, message: "Invalid ID format" });
    }
});

// 3. CREATE CATEGORY
router.post('/create', async (req, res) => {
    try {
        let category = new Category({
            name: req.body.name,
            images: req.body.images,
            color: req.body.color
        });

        category = await category.save();
        if (!category) return res.status(404).send('The category cannot be created!');

        res.status(201).send(category);
    } catch (err) {
        res.status(500).json({ error: err.message, success: false });
    }
});

// 4. UPDATE CATEGORY
router.put('/:id', async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                images: req.body.images,
                color: req.body.color
            },
            { new: true }
        );

        if (!category) return res.status(404).send('Category not found!');
        res.send(category);
    } catch (err) {
        res.status(500).json({ error: err.message, success: false });
    }
});

// 5. DELETE CATEGORY 
router.delete('/:id', async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (category) {
            return res.status(200).json({ success: true, message: 'Category deleted!' });
        } else {
            return res.status(404).json({ success: false, message: 'Category not found!' });
        }
    } catch (err) {
        return res.status(400).json({ success: false, error: err.message });
    }
});

module.exports = router;