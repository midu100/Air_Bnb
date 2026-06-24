const cloudinary = require("cloudinary").v2;

const claudinaryConfig = () => {
  cloudinary.config({
    cloud_name: process.env.CLAUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SEC,
  });
};

module.exports = claudinaryConfig
