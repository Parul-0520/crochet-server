const { Cart } = require('../models/cart');
const express = require('express');
const router = express.Router();

// 1. GET ALL CART ITEMS
router.get('/', async (req, res) => {
    const { userId } = req.query;
    if (!userId || userId === "undefined") {
        return res.status(200).json([]); 
    }
    const cartList = await Cart.find({ userId: userId });
    res.status(200).json(cartList);
});

// 2. EMPTY CART 
router.delete('/empty/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        await Cart.deleteMany({ userId: userId });
        res.status(200).json({ success: true, message: "Cart cleared" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 3. DELETE SINGLE ITEM
router.delete('/:id', async (req, res) => {
    try {
        const cartItem = await Cart.findByIdAndDelete(req.params.id);
        if (cartItem) {
            return res.status(200).json({ success: true, message: 'Item removed!' });
        } else {
            return res.status(404).json({ success: false, message: 'Item not found!' });
        }
    } catch (err) {
        return res.status(400).json({ success: false, error: err.message });
    }
});

module.exports = router;