import api from './api';

export interface Product {
  _id: string;
  name: string;
  nameAm?: string;
  slug: string;
  description?: string;
  descriptionAm?: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  categoryId: string;
  stockQuantity: number;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  nameAm?: string;
  slug: string;
  imageUrl?: string;
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductData {
  name: string;
  nameAm?: string;
  description?: string;
  descriptionAm?: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  categoryId: string;
  stockQuantity: number;
  isFeatured?: boolean;
  isActive?: boolean;
}

export interface ProductsResponse {
  products: Product[];
  page: number;
  pages: number;
  total: number;
}

export const productService = {
  // ============== PRODUCT APIs ==============
  
  // Get all products with filters
  async getProducts(params?: {
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    page?: number;
    limit?: number;
    isActive?: boolean;
  }): Promise<ProductsResponse> {
    const response = await api.get('/products', { params });
    return response.data;
  },

  // Get featured products
  async getFeaturedProducts(): Promise<Product[]> {
    const response = await api.get('/products/featured');
    return response.data;
  },

  // Get single product by slug
  async getProductBySlug(slug: string): Promise<Product> {
    const response = await api.get(`/products/${slug}`);
    return response.data;
  },

  // Get single product by ID (admin)
  async getProductById(id: string): Promise<Product> {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // ============== CATEGORY APIs ==============
  
  // Get all categories
  async getCategories(): Promise<Category[]> {
    const response = await api.get('/categories');
    return response.data;
  },

  // ADMIN: Create category
  async createCategory(data: {
    name: string;
    nameAm?: string;
    imageUrl?: string;
    displayOrder?: number;
  }): Promise<Category> {
    console.log('Creating category with data:', data); // Debug log
    const response = await api.post('/categories', data);
    return response.data;
  },

  // ADMIN: Create category with image upload
  async createCategoryWithImage(formData: FormData): Promise<Category> {
    const response = await api.post('/categories/with-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // ADMIN: Upload category image only
  async uploadCategoryImage(formData: FormData): Promise<{ imageUrl: string }> {
    const response = await api.post('/categories/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // ADMIN: Update category
  async updateCategory(id: string, data: Partial<Category>): Promise<Category> {
    console.log('Updating category with data:', data); // Debug log
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },

  // ADMIN: Delete category
  async deleteCategory(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },

  // ============== ADMIN PRODUCT APIs ==============
  
  // ADMIN: Create new product (traditional)
  async createProduct(data: CreateProductData): Promise<Product> {
    const response = await api.post('/products', data);
    return response.data;
  },

  // ADMIN: Create product with image upload
  async createProductWithImages(formData: FormData): Promise<Product> {
    const response = await api.post('/products/with-images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // ADMIN: Upload product images only
  async uploadImages(files: File[]): Promise<{ images: string[] }> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    const response = await api.post('/products/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // ADMIN: Update product
  async updateProduct(id: string, data: Partial<CreateProductData>): Promise<Product> {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },

  // ADMIN: Delete product
  async deleteProduct(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  // ADMIN: Toggle product status (active/inactive)
  async toggleProductStatus(id: string, isActive: boolean): Promise<Product> {
    const response = await api.put(`/products/${id}`, { isActive });
    return response.data;
  },

  // ADMIN: Toggle featured status
  async toggleFeatured(id: string, isFeatured: boolean): Promise<Product> {
    const response = await api.put(`/products/${id}`, { isFeatured });
    return response.data;
  },

  // ADMIN: Delete product image
  async deleteProductImage(productId: string, imageIndex: number): Promise<{ message: string; images: string[] }> {
    const response = await api.delete(`/products/${productId}/images/${imageIndex}`);
    return response.data;
  },

  // ============== UTILITY METHODS ==============
  
  // Calculate discount percentage
  calculateDiscount(price: number, compareAtPrice?: number): number {
    if (!compareAtPrice || compareAtPrice <= price) return 0;
    return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
  },

  // Format price with ETB
  formatPrice(price: number): string {
    return `${price.toLocaleString()} ETB`;
  },

  // Get product name based on language
  getProductName(product: Product, language: 'en' | 'am'): string {
    return language === 'am' && product.nameAm ? product.nameAm : product.name;
  },

  // Get category name based on language
  getCategoryName(category: Category, language: 'en' | 'am'): string {
    return language === 'am' && category.nameAm ? category.nameAm : category.name;
  }
};