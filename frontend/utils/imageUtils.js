// Get the base URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'https://e-commerce-backend-9dhw.onrender.com/api';
const BASE_URL = API_URL.replace('/api', '');

console.log('🔧 Image Base URL:', BASE_URL);

/**
 * Get the full URL for an image
 * @param {string} imagePath - The image path from the database
 * @returns {string} Full image URL
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return '/placeholder-image.jpg';
  }
  
  // If it's already a full URL, return it
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Remove any leading slashes
  const cleanPath = imagePath.replace(/^\/+/, '');
  
  // Construct the full URL
  const fullUrl = `${BASE_URL}/uploads/${cleanPath}`;
  
  // Log for debugging (remove in production)
  if (import.meta.env.DEV) {
    console.log('🖼️ Image URL:', fullUrl);
  }
  
  return fullUrl;
};

/**
 * Debug function to check image paths
 * @param {Array} products - List of products to debug
 */
export const debugImages = (products) => {
  console.log('🔍 IMAGE DEBUG INFO:');
  products.forEach((product, index) => {
    console.log(`\n📦 Product ${index + 1}: ${product.name}`);
    console.log(`   Original path: "${product.image}"`);
    console.log(`   Full URL: ${getImageUrl(product.image)}`);
  });
};