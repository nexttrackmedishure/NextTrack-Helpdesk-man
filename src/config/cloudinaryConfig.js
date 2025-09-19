const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dtywyqkfg',
  api_key: '765689473539249',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'your_api_secret_here'
});

module.exports = cloudinary;
