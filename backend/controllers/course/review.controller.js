const Review = require('../../models/review.model');
const Enrollment = require('../../models/enrollment.model');

// @desc    Lấy tất cả đánh giá của 1 khóa học
// @route   GET /api/v1/reviews/:courseId
exports.getCourseReviews = async (req, res) => {
    try {
        const { courseId } = req.params;
        const reviews = await Review.find({ courseId })
            .populate('userId', 'name avatar')
            .sort({ createdAt: -1 });

        const averageRating = reviews.length > 0 
            ? (reviews.reduce((acc, item) => acc + item.rating, 0) / reviews.length).toFixed(1) 
            : 0;

        res.status(200).json({ 
            success: true, 
            count: reviews.length, 
            averageRating,
            data: reviews 
        });
    } catch (error) {
        console.error("Lỗi lấy đánh giá:", error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// @desc    Xóa đánh giá (Admin hoặc chủ nhân đánh giá)
// @route   DELETE /api/v1/reviews/:reviewId
exports.deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đánh giá' });
        }

        if (req.user.role !== 'admin' && review.userId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Bạn không có quyền xóa đánh giá này' });
        }

        await Review.findByIdAndDelete(reviewId);

        res.status(200).json({ success: true, message: 'Đã xóa đánh giá thành công' });
    } catch (error) {
        console.error("Lỗi xóa đánh giá:", error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// @desc    Thêm đánh giá mới
// @route   POST /api/v1/reviews/:courseId
exports.createReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const { courseId } = req.params;
        const userId = req.user.id;

        const enrollment = await Enrollment.findOne({ userId, courseId });
        if (!enrollment) {
            return res.status(403).json({ success: false, message: 'Bạn chưa đăng ký khóa học này!' });
        }
        if (enrollment.progress < 100) {
            return res.status(403).json({ success: false, message: 'Bạn phải hoàn thành 100% khóa học mới có thể để lại đánh giá!' });
        }

        const existingReview = await Review.findOne({ courseId, userId });
        if (existingReview) {
            return res.status(400).json({ success: false, message: 'Bạn đã đánh giá khóa học này rồi!' });
        }

        let review = await Review.create({ rating, comment, courseId, userId });
        
        review = await review.populate('userId', 'name avatar');

        res.status(201).json({ success: true, data: review, message: 'Cảm ơn bạn đã đánh giá!' });
    } catch (error) {
        console.error("Lỗi tạo đánh giá:", error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};