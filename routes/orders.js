const { Order } = require('../models/orders');
const express = require('express');
const router = express.Router();

router.post('/create', async (req, res) => {
    try {
        const orderInfo = req.body.data ? req.body.data : req.body;

        console.log("Backend received this:", orderInfo); 

        const order = new Order({
            userid: orderInfo.userid,
            name: orderInfo.name,
            phoneNumber: orderInfo.phoneNumber,
            address: orderInfo.address,
            pincode: orderInfo.pincode,
            amount: orderInfo.amount,
            paymentId: orderInfo.paymentId,
            email: orderInfo.email,
            products: orderInfo.products,
            date: orderInfo.date
        });

        const savedOrder = await order.save();
        res.status(201).json(savedOrder);
        
    } catch (err) {
        console.error("MERE BHAI ERROR YE HAI ->", err.message); 
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/', async (req, res) => {
    const orderList = await Order.find(req.query.userid ? { userid: req.query.userid } : {});
    res.send(orderList);
});

module.exports = router;