import Category from '../models/Category.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to generate slug
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
};

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort('displayOrder');
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = async (req, res) => {
  try {
    const { name, nameAm, imageUrl, displayOrder } = req.body;

    console.log('🔍 Creating category with data:', { name, nameAm, imageUrl, displayOrder });

    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    // Check if category already exists by name
    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    // Generate slug from name
    let slug = generateSlug(name);

    // Check if slug already exists
    const slugExists = await Category.findOne({ slug });
    if (slugExists) {
      // If slug exists, add a random suffix
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    // Ensure imageUrl is properly saved
    let finalImageUrl = imageUrl || null;

    const category = await Category.create({
      name,
      nameAm: nameAm || '',
      slug: slug,
      imageUrl: finalImageUrl,
      displayOrder: displayOrder || 0,
    });

    console.log('✅ Category created:', category);
    console.log('✅ Image URL stored:', category.imageUrl);

    res.status(201).json(category);
  } catch (error) {
    console.error('❌ Error creating category:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Upload category image only
// @route   POST /api/categories/upload
// @access  Private/Admin
export const uploadCategoryImage = async (req, res) => {
  try {
    console.log('🔍 Upload request received');
    console.log('🔍 File:', req.file);
    
    if (!req.file) {
      console.log('❌ No file uploaded');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    let imageUrl;
    if (req.file.path && req.file.path.includes('cloudinary')) {
      imageUrl = req.file.path;
    } else {
      imageUrl = `/uploads/${req.file.filename}`;
    }
    
    console.log('✅ Image uploaded successfully:', imageUrl);
    console.log('✅ File saved at:', req.file.path);

    res.json({ 
      imageUrl,
      message: 'Image uploaded successfully' 
    });
  } catch (error) {
    console.error('❌ Error uploading image:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    console.log('🔍 Updating category with data:', req.body);

    category.name = req.body.name || category.name;
    category.nameAm = req.body.nameAm || category.nameAm;
    
    // Update slug if name changed
    if (req.body.name && req.body.name !== category.name) {
      category.slug = generateSlug(req.body.name);
    }
    
    category.imageUrl = req.body.imageUrl !== undefined ? req.body.imageUrl : category.imageUrl;
    category.displayOrder = req.body.displayOrder ?? category.displayOrder;

    const updatedCategory = await category.save();
    console.log('✅ Category updated:', updatedCategory);
    console.log('✅ Image URL stored:', updatedCategory.imageUrl);

    res.json(updatedCategory);
  } catch (error) {
    console.error('❌ Error updating category:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Delete associated image if it was uploaded
    if (category.imageUrl && category.imageUrl.startsWith('/uploads/')) {
      const filename = category.imageUrl.replace('/uploads/', '');
      const filepath = path.join(__dirname, '../uploads', filename);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
        console.log('✅ Deleted image file:', filepath);
      }
    }

    await category.deleteOne();
    console.log('✅ Category deleted:', category._id);
    
    res.json({ message: 'Category removed' });
  } catch (error) {
    console.error('❌ Error deleting category:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Debug - List all uploaded files
// @route   GET /api/categories/debug/files
// @access  Private/Admin
export const debugListFiles = async (req, res) => {
  try {
    const uploadDir = path.join(__dirname, '../uploads');
    const tomshopDir = path.join(uploadDir, 'tomshop');
    const productsDir = path.join(tomshopDir, 'products');
    
    const files = {
      uploads: [],
      tomshop: [],
      products: []
    };
    
    // Check main uploads directory
    if (fs.existsSync(uploadDir)) {
      files.uploads = fs.readdirSync(uploadDir).map(f => ({
        name: f,
        path: `/uploads/${f}`,
        exists: true
      }));
    }
    
    // Check tomshop directory
    if (fs.existsSync(tomshopDir)) {
      files.tomshop = fs.readdirSync(tomshopDir).map(f => ({
        name: f,
        path: `/uploads/tomshop/${f}`,
        exists: true
      }));
    }
    
    // Check products directory
    if (fs.existsSync(productsDir)) {
      files.products = fs.readdirSync(productsDir).map(f => ({
        name: f,
        path: `/uploads/tomshop/products/${f}`,
        exists: true
      }));
    }
    
    // Check if the Electronics image exists
    const electronicsImage = 'rmzo5lznydn5cvom02pi';
    const electronicsPath = path.join(productsDir, electronicsImage);
    
    res.json({
      success: true,
      files,
      electronicsImageExists: fs.existsSync(electronicsPath),
      electronicsPath: electronicsPath,
      uploadDirExists: fs.existsSync(uploadDir),
      tomshopDirExists: fs.existsSync(tomshopDir),
      productsDirExists: fs.existsSync(productsDir)
    });
  } catch (error) {
    console.error('❌ Error listing files:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
