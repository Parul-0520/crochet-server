require('dotenv').config(); // Standard way
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv/config');
const authJwt = require('./helper/jwt.js');

// 1. MIDDLEWARES 
app.use(cors()); 
app.use(express.json()); 
app.use(bodyParser.json());

// 2. STATIC FOLDER
app.use('/uploads', express.static(__dirname + '/uploads'));

const categoryRoutes = require('./routes/categories');
const productRoutes = require('./routes/products'); 
const userRoutes = require('./routes/user');
const cartRoutes = require('./routes/cart');
const searchRoutes = require('./routes/search'); 
const ordersRoutes = require('./routes/orders');
const myListSchema = require('./routes/myList.js');
const productReviews = require('./routes/productReviews');

// 4. JWT AUTHENTICATION
app.use(authJwt()); 


// 5. ROUTES USAGE 
app.use('/api/products', productRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/user', userRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/my-List', myListSchema);
app.use('/api/orders', ordersRoutes); 
app.use('/api/search', searchRoutes); // ✅ Usage
app.use('/api/productReviews', productReviews);

// 6. DATABASE CONNECTION
mongoose.connect(process.env.CONNECTION_STRING)
.then(() => {
    console.log('Database Connection is ready...');
    app.listen(process.env.PORT || 4000, () => {
        console.log(`Server running at https://crochet-server-jbov.onrender.com`);
    });
})
.catch(err => {
    console.log("Database Connection Error: ", err);
});