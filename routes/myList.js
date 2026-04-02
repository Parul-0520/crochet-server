const { MyList } = require('../models/myList');
const express = require('express');
const router = express.Router();

// 1. GET ALL LIST ITEMS 
router.get('/', async (req, res) => {
    try {
        const { userId } = req.query;
        
        if (!userId || userId === "undefined") {
            return res.status(200).json([]); 
        }

        const myList = await MyList.find({ userId: userId });
        res.status(200).json(myList);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 2. ADD TO LIST
router.post('/add', async (req, res) => {
    try {
        const { productId, userId, quantity, price } = req.body;

        let item = await MyList.findOne({ productId: productId, userId: userId });

        if (item) {
            let newQuantity = parseInt(item.quantity || 0) + parseInt(quantity || 1);
            item.quantity = newQuantity;
            
            if(price) item.subTotal = newQuantity * parseFloat(price); 

            const updatedItem = await item.save();
            return res.status(200).json(updatedItem);

        } else {
            let newList = new MyList({
                productTitle: req.body.productTitle,
                images: req.body.images,
                rating: req.body.rating,
                price: req.body.price,
                productId: productId,
                userId: userId,
                quantity: quantity || 1,
                subTotal: price ? (quantity || 1) * parseFloat(price) : 0
            });

            const savedItem = await newList.save();
            return res.status(201).json(savedItem);
        }
    } catch (err) {
        console.error("Backend Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// 3. DELETE FROM LIST
router.delete('/:id', async (req, res) => {
    try {
        const item = await MyList.findByIdAndDelete(req.params.id);
        if (item) {
            return res.status(200).json({ success: true, message: 'Item removed!' });
        } else {
            return res.status(404).json({ success: false, message: 'Item not found!' });
        }
    } catch (err) {
        return res.status(400).json({ success: false, error: err.message });
    }
});

// 4. UPDATE LIST ITEM 
router.put('/:id', async (req, res) => {
    try {
        const updatedItem = await MyList.findByIdAndUpdate(
            req.params.id,
            {
                quantity: req.body.quantity,
                subTotal: req.body.subTotal
            },
            { new: true }
        );

        if (!updatedItem) return res.status(404).send('Item not found!');
        res.status(200).json(updatedItem);
    } catch (err) {
        res.status(500).json({ error: err.message, success: false });
    }
});

module.exports = router;