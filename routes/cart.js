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

// 4. ADD TO CART (Ye wala missing tha)
// 4. ADD TO CART (Updated logic)
router.post('/add', async (req, res) => {
    try {
        // Frontend se jo data aa raha hai use sahi variables mein pakdein
        const { productId, productTitle, images, rating, price, quantity, subTotal, userId } = req.body;

        let cartItem = await Cart.findOne({ productId: productId, userId: userId });

        if (cartItem) {
            cartItem.quantity = quantity;
            cartItem.subTotal = subTotal;
            cartItem = await cartItem.save();
        } else {
            // Yahan keys wahi honi chahiye jo MODEL mein hain
            cartItem = new Cart({
                productTitle, // Model mein yahi naam hai
                images,       // Model mein yahi naam hai
                rating,
                price,
                quantity,
                subTotal,
                productId,
                userId
            });
            cartItem = await cartItem.save();
        }

        res.status(201).json(cartItem);
    } catch (err) {
        // Ab yahan error message saaf dikhega agar kuch bacha hoga
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;