const Category = require('../models/Category');

// Get all categories or render management page
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.render('categories', {
      title: 'Manage Categories',
      categories,
      error: req.query.error || null,
      success: req.query.success || null
    });
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).render('error', { title: 'Error', message: 'Failed to fetch categories' });
  }
};

// Create a new category
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.redirect('/categories?error=Category name is required');
    }

    const existing = await Category.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } });
    if (existing) {
      return res.redirect('/categories?error=Category already exists');
    }

    const category = new Category({ name: name.trim(), description });
    await category.save();

    res.redirect('/categories?success=Category created successfully');
  } catch (err) {
    console.error('Error creating category:', err);
    res.redirect('/categories?error=Failed to create category');
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.redirect('/categories?success=Category deleted successfully');
  } catch (err) {
    console.error('Error deleting category:', err);
    res.redirect('/categories?error=Failed to delete category');
  }
};
