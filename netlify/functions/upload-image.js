// netlify/functions/upload-image.js

// We need to install cloudinary first: npm install cloudinary
const cloudinary = require('cloudinary').v2;

// Get credentials from Netlify environment variables
const {
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET,
} = process.env;

// Configure Cloudinary
cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
});

exports.handler = async (event) => {
    // We only want to handle POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'Method Not Allowed',
        };
    }

    try {
        const { file } = JSON.parse(event.body);

        const result = await cloudinary.uploader.upload(file, {
            // Optionally, you can create a folder in Cloudinary to keep things organized
            folder: 'life-app-uploads', 
            // You can also apply transformations for optimization, e.g.,
            // transformation: [{ width: 1024, height: 1024, crop: 'limit' }],
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ secure_url: result.secure_url }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};