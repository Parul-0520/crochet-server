const ProductReviews = require('../models/productReviews'); 
const express = require('express');
const router = express.Router();

// GET all reviews
router.get('/', async (req, res) => {
    let reviews = [];
    try {
        if (req.query.productId !== undefined && req.query.productId !== null && req.query.productId !== "") {
            reviews = await ProductReviews.find({ productId: req.query.productId });
        } else {
            reviews = await ProductReviews.find();
        }

        if (!reviews) {
            return res.status(500).json({ success: false });
        }
        return res.status(200).json(reviews);
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

// GET single review by ID
router.get('/:id', async (req, res) => {
    try {
        const review = await ProductReviews.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ message: 'The review with given ID was not found.' });
        }
        return res.status(200).send(review);
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

// POST add a new review
router.post('/add', async (req, res) => {
    try {
        let review = new ProductReviews({
            customerName: req.body.customerName,
            customerId: req.body.customerId, 
            review: req.body.review,
            customerRating: req.body.customerRating,
            productId: req.body.productId
        });

        // Save review
        review = await review.save();

        if (!review) {
            return res.status(500).json({
                success: false,
                message: "Review could not be saved"
            });
        }

        return res.status(201).json(review);

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;