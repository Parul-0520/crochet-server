const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    userid: { type: String, required: true }, 
    name: String,
    phoneNumber: String,
    pincode: String,
    products: Array,
    amount: Number,
    paymentId: String,
    email: String,
    address: String,
    date: String,
    status: { type: String, default: 'Pending' }
});

exports.Order = mongoose.model('Order', orderSchema);