const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    brand: { type: String, default: '' },
    price: { type: Number, default: 0 },
    images:[{
type: String, 
required: true 
    }],
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    countInStock: { type: Number, required: true },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    dateCreated: { type: Date, default: Date.now },
    discount:{
        type: String, 
        required: true,
    },
    productRAMS: [
        {
            type: String,
        }
    ],
    productSIZE: [
        {
            type: String,
        }
    ],
    productWEIGHT: [
        {
            type: String,
        }
    ],
    location:{
        type: String,
        required: true 
    },

});

productSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

productSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Products', productSchema);