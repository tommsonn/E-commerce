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
    const slug = generateSlug(name);

    // Check if slug already exists
    const slugExists = await Category.findOne({ slug });
    if (slugExists) {
      // If slug exists, add a random suffix
      const uniqueSlug = `${slug}-${Date.now().toString().slice(-4)}`;
      slug = uniqueSlug;
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

    const imageUrl = `/uploads/${req.file.filename}`;
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
