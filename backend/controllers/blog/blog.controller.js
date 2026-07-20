const Blog = require('../../models/blog.model');

// @desc    Lấy tất cả bài viết (có phân trang)
// @route   GET /api/v1/blogs
// @access  Public
exports.getAllBlogs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 15;
        const skip = (page - 1) * limit;

        const [blogs, total] = await Promise.all([
            Blog.find({ isPublished: true })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Blog.countDocuments({ isPublished: true })
        ]);

        res.status(200).json({
            success: true,
            data: blogs,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                hasNextPage: page < Math.ceil(total / limit),
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        console.error("Lỗi lấy danh sách blog:", error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// @desc    Lấy 1 bài viết theo slug
// @route   GET /api/v1/blogs/:slug
// @access  Public
exports.getBlogBySlug = async (req, res) => {
    try {
        const blog = await Blog.findOne({ 
            slug: req.params.slug, 
            isPublished: true 
        });

        if (!blog) {
            return res.status(404).json({ 
                success: false, 
                message: 'Không tìm thấy bài viết' 
            });
        }

        blog.views += 1;
        await blog.save();

        res.status(200).json({
            success: true,
            data: blog
        });
    } catch (error) {
        console.error("Lỗi lấy blog:", error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// @desc    Lấy bài viết nổi bật (mới nhất)
// @route   GET /api/v1/blogs/featured/latest
// @access  Public
exports.getLatestBlogs = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 6;
        const blogs = await Blog.find({ isPublished: true })
            .sort({ createdAt: -1 })
            .limit(limit);

        res.status(200).json({
            success: true,
            data: blogs
        });
    } catch (error) {
        console.error("Lỗi lấy blog nổi bật:", error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// @desc    Tạo bài viết mới (Admin)
// @route   POST /api/v1/blogs
// @access  Private/Admin
exports.createBlog = async (req, res) => {
    try {
        const blog = await Blog.create(req.body);
        res.status(201).json({
            success: true,
            data: blog
        });
    } catch (error) {
        console.error("Lỗi tạo blog:", error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// @desc    Cập nhật bài viết (Admin)
// @route   PUT /api/v1/blogs/:id
// @access  Private/Admin
exports.updateBlog = async (req, res) => {
    try {
        const blog = await Blog.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!blog) {
            return res.status(404).json({ 
                success: false, 
                message: 'Không tìm thấy bài viết' 
            });
        }

        res.status(200).json({
            success: true,
            data: blog
        });
    } catch (error) {
        console.error("Lỗi cập nhật blog:", error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// @desc    Xóa bài viết (Admin)
// @route   DELETE /api/v1/blogs/:id
// @access  Private/Admin
exports.deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findByIdAndDelete(req.params.id);

        if (!blog) {
            return res.status(404).json({ 
                success: false, 
                message: 'Không tìm thấy bài viết' 
            });
        }

        res.status(200).json({
            success: true,
            message: 'Xóa bài viết thành công'
        });
    } catch (error) {
        console.error("Lỗi xóa blog:", error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};
