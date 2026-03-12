// Get the API base URL from environment variables with a hardcoded fallback for production
const API_URL = import.meta.env.VITE_API_URL || 'https://e-commerce-backend-9dhw.onrender.com/api';
const BASE_URL = API_URL.replace('/api', '');

// Force production URL if we're in production mode
const FINAL_BASE_URL = import.meta.env.PROD 
  ? 'https://e-commerce-backend-9dhw.onrender.com' 
  : BASE_URL;

console.log('🔧 Image Utils - Mode:', import.meta.env.MODE);
console.log('🔧 Image Utils - API_URL:', API_URL);
console.log('🔧 Image Utils - BASE_URL:', BASE_URL);
console.log('🔧 Image Utils - FINAL_BASE_URL:', FINAL_BASE_URL);

/**
 * Get the full URL for an image
 * @param imagePath - The image path from the database (can be full URL, /uploads/... path)
 * @returns Full URL to the image
 */
export const getImageUrl = (imagePath: string | undefined | null): string => {
  console.log('🖼️ getImageUrl called with:', imagePath);
  
  if (!imagePath) {
    console.log('🖼️ No image path provided, using placeholder');
    return 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=400';
  }
  
  // If it's already a full URL (starts with http), return as is
  if (imagePath.startsWith('http')) {
    console.log('🖼️ Using full URL (already has http):', imagePath);
    return imagePath;
  }
  
  // For any path that starts with /uploads/, append to FINAL_BASE_URL
  if (imagePath.startsWith('/uploads/')) {
    const fullUrl = `${FINAL_BASE_URL}${imagePath}`;
    console.log('🖼️ Constructed URL with full path:', fullUrl);
    return fullUrl;
  }
  
  console.log('🖼️ Using path as-is:', imagePath);
  return imagePath;
};

/**
 * Check if image is from Cloudinary
 */
export const isCloudinaryImage = (imagePath: string | undefined | null): boolean => {
  if (!imagePath) return false;
  return imagePath.includes('cloudinary.com');
};

/**
 * Get optimized Cloudinary URL with transformations
 */
export const getOptimizedImageUrl = (
  imagePath: string | undefined | null, 
  width?: number, 
  height?: number
): string => {
  if (!imagePath) return getImageUrl(imagePath);
  
  const fullUrl = getImageUrl(imagePath);
  
  if (!fullUrl.includes('cloudinary.com')) {
    return fullUrl;
  }
  
  // Add transformations to Cloudinary URL
  const transformations: string[] = [];
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (transformations.length === 0) return fullUrl;
  
  // Insert transformations before the upload part of the URL
  return fullUrl.replace('/upload/', `/upload/${transformations.join(',')}/`);
};

/**
 * Get multiple image URLs (for product galleries)
 */
export const getImageUrls = (images: (string | undefined | null)[]): string[] => {
  return images
    .filter(img => img) // Remove null/undefined
    .map(img => getImageUrl(img as string));
};

/**
 * Get placeholder image URL
 */
export const getPlaceholderImage = (text?: string): string => {
  const defaultText = text || 'No+Image';
  return `https://via.placeholder.com/400x400/indigo/white?text=${encodeURIComponent(defaultText)}`;
};

/**
 * Debug function to check image loading
 */
export const debugImage = async (url: string): Promise<boolean> => {
  console.log('🔍 Testing image URL:', url);
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      console.log('✅ Image loaded successfully:', url);
      resolve(true);
    };
    img.onerror = () => {
      console.error('❌ Image failed to load:', url);
      resolve(false);
    };
    img.src = url;
  });
};

// Make it available globally for console debugging
if (typeof window !== 'undefined') {
  (window as any).getImageUrl = getImageUrl;
  (window as any).debugImage = debugImage;
  console.log('✅ Image utils available in console: try getImageUrl() or debugImage()');
}

export default {
  getImageUrl,
  isCloudinaryImage,
  getOptimizedImageUrl,
  getImageUrls,
  getPlaceholderImage,
  debugImage
};
