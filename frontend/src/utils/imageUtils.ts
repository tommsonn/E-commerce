// Get the API base URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'https://e-commerce-backend-9dhw.onrender.com/api';
const BASE_URL = API_URL.replace('/api', '');

export const getImageUrl = (imagePath: string | undefined | null): string => {
  if (!imagePath) {
    return 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=400';
  }
  
  // If it's already a full URL (Cloudinary or other), return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // If it's a local upload path, prepend the BASE_URL
  if (imagePath.startsWith('/uploads/')) {
    return `${BASE_URL}${imagePath}`;
  }
  
  // Default fallback
  return imagePath;
};

// Helper to check if image is from Cloudinary
export const isCloudinaryImage = (imagePath: string | undefined | null): boolean => {
  if (!imagePath) return false;
  return imagePath.includes('cloudinary.com');
};

// Helper to get Cloudinary optimization URL
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
  
  if (transformations.length > 0) {
    // Insert transformations before the upload part of the URL
    return fullUrl.replace('/upload/', `/upload/${transformations.join(',')}/`);
  }
  
  return fullUrl;
};

// Helper to get multiple image URLs (for product galleries)
export const getImageUrls = (images: (string | undefined | null)[]): string[] => {
  return images.filter(img => img).map(img => getImageUrl(img as string));
};