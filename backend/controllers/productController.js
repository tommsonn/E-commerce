import Product from '../models/Product.js';
import Category from '../models/Category.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { cloudinary } from '../config/cloudinary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Get all products (with filters, search, sorting)
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const pageSize = 12;
    const page = Number(req.query.page) || 1;
    
    const keyword = req.query.search
      ? {
          $text: { $search: req.query.search },
        }
      : {};

    const category = req.query.category
      ? { categoryId: await getCategoryId(req.query.category) }
      : {};

    const priceRange = {};
    if (req.query.minPrice) priceRange.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) priceRange.$lte = Number(req.query.maxPrice);
    
    const priceFilter = Object.keys(priceRange).length > 0
      ? { price: priceRange }
      : {};

    const isActive = req.query.isActive !== undefined 
      ? { isActive: req.query.isActive === 'true' }
      : { isActive: true };

    const query = {
      ...keyword,
      ...category,
      ...priceFilter,
      ...isActive,
    };

    const sortOrder = {};
    if (req.query.sort === 'price_asc') sortOrder.price = 1;
    else if (req.query.sort === 'price_desc') sortOrder.price = -1;
    else if (req.query.sort === 'name') sortOrder.name = 1;
    else sortOrder.createdAt = -1;

    const count = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('categoryId', 'name nameAm slug')
      .sort(sortOrder)
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({
      products,
      page,
      pages: Math.ceil(count / pageSize),
      total: count,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to get category ID from slug
const getCategoryId = async (slug) => {
  const category = await Category.findOne({ slug });
  return category?._id;
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
export const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ 
      isFeatured: true, 
      isActive: true 
    })
      .populate('categoryId', 'name nameAm slug')
      .limit(8);
    
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single product by slug
// @route   GET /api/products/:slug
// @access  Public
export const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ 
      slug: req.params.slug,
      isActive: true 
    }).populate('categoryId', 'name nameAm slug');

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('categoryId', 'name nameAm slug');

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create product with images
// @route   POST /api/products/with-images
// @access  Private/Admin
export const createProductWithImages = async (req, res) => {
  try {
    console.log('📦 Creating product with images...');
    console.log('Request body:', req.body);
    console.log('Files:', req.files);

    const {
      name,
      nameAm,
      description,
      descriptionAm,
      price,
      compareAtPrice,
      categoryId,
      stockQuantity,
      isFeatured,
      isActive,
      existingImages
    } = req.body;

    // Process uploaded files - get Cloudinary URLs
    let images = [];
    if (req.files && req.files.length > 0) {
      // If using Cloudinary, the URL is in file.path
      images = req.files.map(file => file.path || `/uploads/${file.filename}`);
      console.log('📸 Uploaded images:', images);
    }

    // Add existing images if provided
    if (existingImages) {
      try {
        const parsedImages = JSON.parse(existingImages);
        images = [...images, ...parsedImages];
        console.log('➕ Added existing images:', parsedImages);
      } catch (e) {
        console.error('Error parsing existing images:', e);
      }
    }

    // If no images at all, use placeholder
    if (images.length === 0) {
      images = ['https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg'];
    }

    const product = await Product.create({
      name,
      nameAm: nameAm || '',
      description: description || '',
      descriptionAm: descriptionAm || '',
      price: Number(price),
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
      images,
      categoryId,
      stockQuantity: Number(stockQuantity),
      isFeatured: isFeatured === 'true' || isFeatured === true,
      isActive: isActive === 'true' || isActive !== false,
    });

    console.log('✅ Product created successfully:', product.name);
    res.status(201).json(product);
  } catch (error) {
    console.error('❌ Error creating product:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = req.body.name || product.name;
      product.nameAm = req.body.nameAm || product.nameAm;
      product.description = req.body.description || product.description;
      product.descriptionAm = req.body.descriptionAm || product.descriptionAm;
      product.price = req.body.price || product.price;
      product.compareAtPrice = req.body.compareAtPrice !== undefined ? req.body.compareAtPrice : product.compareAtPrice;
      product.categoryId = req.body.categoryId || product.categoryId;
      product.stockQuantity = req.body.stockQuantity !== undefined ? req.body.stockQuantity : product.stockQuantity;
      product.isActive = req.body.isActive !== undefined ? req.body.isActive : product.isActive;
      product.isFeatured = req.body.isFeatured !== undefined ? req.body.isFeatured : product.isFeatured;

      // Handle images update
      if (req.body.images) {
        try {
          product.images = JSON.parse(req.body.images);
        } catch (e) {
          product.images = req.body.images;
        }
      }

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Upload product images only
// @route   POST /api/products/upload
// @access  Private/Admin
export const uploadProductImages = async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    // Get URLs from Cloudinary or local path
    const imageUrls = files.map(file => file.path || `/uploads/${file.filename}`);
    res.json({ images: imageUrls });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      // Delete images from Cloudinary if they're Cloudinary URLs
      if (product.images && product.images.length > 0) {
        for (const imageUrl of product.images) {
          if (imageUrl.includes('cloudinary')) {
            try {
              // Extract public ID from Cloudinary URL
              const urlParts = imageUrl.split('/');
              const filenameWithExtension = urlParts[urlParts.length - 1];
              const publicId = `tomshop/products/${filenameWithExtension.split('.')[0]}`;
              await cloudinary.uploader.destroy(publicId);
            } catch (cloudinaryError) {
              console.error('Error deleting from Cloudinary:', cloudinaryError);
            }
          } else if (imageUrl.startsWith('/uploads/')) {
            // Delete local file
            const filename = imageUrl.replace('/uploads/', '');
            const filepath = path.join(__dirname, '../uploads', filename);
            if (fs.existsSync(filepath)) {
              fs.unlinkSync(filepath);
            }
          }
        }
      }

      await product.deleteOne();
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete product image
// @route   DELETE /api/products/:productId/images/:imageIndex
// @access  Private/Admin
export const deleteProductImage = async (req, res) => {
  try {
    const { productId, imageIndex } = req.params;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const index = parseInt(imageIndex);
    if (index < 0 || index >= product.images.length) {
      return res.status(400).json({ message: 'Invalid image index' });
    }

    // Get image path and delete file
    const imageUrl = product.images[index];
    
    // Delete from Cloudinary if it's a Cloudinary URL
    if (imageUrl.includes('cloudinary')) {
      try {
        const urlParts = imageUrl.split('/');
        const filenameWithExtension = urlParts[urlParts.length - 1];
        const publicId = `tomshop/products/${filenameWithExtension.split('.')[0]}`;
        await cloudinary.uploader.destroy(publicId);
      } catch (cloudinaryError) {
        console.error('Error deleting from Cloudinary:', cloudinaryError);
      }
    } else if (imageUrl.startsWith('/uploads/')) {
      // Delete local file
      const filename = imageUrl.replace('/uploads/', '');
      const filepath = path.join(__dirname, '../uploads', filename);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    }

    // Remove from array
    product.images.splice(index, 1);
    await product.save();

    res.json({ message: 'Image deleted successfully', images: product.images });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Toggle product active status
// @route   PATCH /api/products/:id/toggle-active
// @access  Private/Admin
export const toggleProductActive = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (product) {
      product.isActive = !product.isActive;
      await product.save();
      res.json({ isActive: product.isActive });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Toggle product featured status
// @route   PATCH /api/products/:id/toggle-featured
// @access  Private/Admin
export const toggleProductFeatured = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (product) {
      product.isFeatured = !product.isFeatured;
      await product.save();
      res.json({ isFeatured: product.isFeatured });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};