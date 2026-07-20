const express = require('express');
const router = express.Router();
const { getAllBlogs, getBlogBySlug, getLatestBlogs, createBlog, updateBlog, deleteBlog } = require('../../controllers/blog/blog.controller');
const { protect } = require('../../middlewares/auth.middleware');

// Public routes
router.get('/', getAllBlogs);
router.get('/featured/latest', getLatestBlogs);
router.get('/:slug', getBlogBySlug);

// Protected routes (Admin)
router.post('/', protect, createBlog);
router.put('/:id', protect, updateBlog);
router.delete('/:id', protect, deleteBlog);

module.exports = router;
