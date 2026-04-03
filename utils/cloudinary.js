const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Sabse pehle ensure karo ki dotenv yahan bhi load ho
require('dotenv').config(); 

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // .env wala naam match karo
  api_key: process.env.CLOUDINARY_API_KEY,      // .env wala naam match karo
  api_secret: process.env.CLOUDINARY_API_SECRET // .env wala naam match karo
});

// Debugging: Terminal mein check karne ke liye (Ye line error pakad legi)
console.log("Cloudinary API Key Loaded:", process.env.CLOUDINARY_API_KEY);

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ecommerce_products',
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});

const upload = multer({ storage: storage });
module.exports = upload;