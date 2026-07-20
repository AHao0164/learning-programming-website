const Enrollment = require('../../models/enrollment.model');
const Course = require('../../models/course.model');

// @desc    Đăng ký khóa học
// @route   POST /api/v1/enrollments
// @access  Private (Chỉ user đã đăng nhập)
exports.enrollCourse = async (req, res) => {
    try {
        const { courseId } = req.body;
        const userId = req.user.id;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy khóa học' });
        }

        const existingEnrollment = await Enrollment.findOne({ userId, courseId });
        if (existingEnrollment) {
            return res.status(400).json({ success: false, message: 'Bạn đã đăng ký khóa học này rồi' });
        }

        if (course.price > 0) {
            return res.status(402).json({ 
                success: false, 
                requiresPayment: true,
                message: 'Khóa học này trả phí. Tính năng thanh toán đang được phát triển!' 
            });
        }

        const enrollment = await Enrollment.create({
            userId,
            courseId,
            enrolledPrice: 0
        });

        res.status(201).json({ 
            success: true, 
            message: 'Đăng ký khóa học thành công!',
            data: enrollment 
        });

    } catch (error) {
        console.error("Lỗi đăng ký khóa học:", error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// @desc    Kiểm tra trạng thái đăng ký của 1 khóa học
// @route   GET /api/v1/enrollments/check/:courseId
// @access  Private
exports.checkEnrollmentStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const { courseId } = req.params;

        const enrollment = await Enrollment.findOne({ userId, courseId });
        
        res.status(200).json({ 
            success: true, 
            isEnrolled: !!enrollment,
            progress: enrollment ? enrollment.progress : 0
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// @desc    Lấy danh sách khóa học của tôi (My Courses)
// @route   GET /api/v1/enrollments/my-courses
// @access  Private
exports.getMyCourses = async (req, res) => {
    try {
        const userId = req.user.id;

        const enrollments = await Enrollment.find({ userId })
            .populate('courseId', 'title slug thumbnail price level') 
            .sort({ createdAt: -1 });

        const myCourses = enrollments
            .filter(e => e.courseId)
            .map(e => ({
                enrollmentId: e._id,
                enrolledAt: e.createdAt,
                progress: e.progress,
                lastLessonSlug: e.lastLessonSlug,
                status: e.status,
                ...e.courseId._doc 
            }));

        res.status(200).json({ success: true, data: myCourses });
    } catch (error) {
        console.error("Lỗi lấy My Courses:", error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// @desc    Cập nhật bài học cuối cùng và tiến độ
// @route   PUT /api/v1/enrollments/last-accessed
// @access  Private
exports.updateLastAccessed = async (req, res) => {
    try {
        const userId = req.user.id;
        const { courseId, lessonSlug, progress } = req.body;

        const updated = await Enrollment.findOneAndUpdate(
            { userId, courseId },
            { 
                ...(lessonSlug && { lastLessonSlug: lessonSlug }),
                ...(progress !== undefined && { progress })
            },
            { new: true }
        );

        res.status(200).json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};