// backend/controllers/course/course.controller.js

const Course = require('../../models/course.model');
const Chapter = require('../../models/chapter.model'); 
const Lesson = require('../../models/lesson.model');  
const Enrollment = require('../../models/enrollment.model');

// @desc    Lấy danh sách tất cả khóa học (kèm số học viên)
// @route   GET /api/v1/courses
// @access  Public
exports.getCourses = async (req, res) => {
    try {
        const { page = 1, limit = 9, filter, level, search } = req.query;
        
        // Build query
        const query = { isPublished: true };
        
        // Filter by price (free/paid)
        if (filter === 'free') {
            query.price = 0;
        } else if (filter === 'pro') {
            query.price = { $gt: 0 };
        }
        
        // Filter by level
        if (level) {
            query.level = level;
        }
        
        // Search by title
        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }
        
        // Count total documents
        const total = await Course.countDocuments(query);
        
        // Fetch paginated courses
        const courses = await Course.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const coursesWithStudentCount = await Promise.all(
            courses.map(async (course) => {
                const studentCount = await Enrollment.countDocuments({ courseId: course._id });
                return {
                    ...course.toObject(),
                    studentCount
                };
            })
        );

        res.status(200).json({ 
            success: true, 
            count: coursesWithStudentCount.length,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit),
            data: coursesWithStudentCount 
        });
    } catch (error) {
        console.error("Lỗi lấy danh sách khóa học:", error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// @desc    Lấy chi tiết 1 khóa học theo slug (Kèm Syllabus)
// @route   GET /api/v1/courses/:slug
// @access  Public
exports.getCourseBySlug = async (req, res, next) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug, isPublished: true }).lean();

    if (!course) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy khóa học' });
    }

    const chapters = await Chapter.find({ courseId: course._id }).sort('order').lean();

    for (let chapter of chapters) {
      const lessons = await Lesson.find({ chapterId: chapter._id })
                                  .select('title slug order type duration isFreePreview') 
                                  .sort('order')
                                  .lean();
      chapter.lessons = lessons;
    }

    course.chapters = chapters;

    res.status(200).json({
      success: true,
      data: course
    });
  } catch (err) {
    console.error('Lỗi lấy chi tiết khóa học:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};