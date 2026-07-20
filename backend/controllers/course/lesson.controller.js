const Lesson = require('../../models/lesson.model');

// @desc    Lấy chi tiết 1 bài học theo slug
// @route   GET /api/v1/lessons/:slug
// @access  Public (Tạm thời để public để test, sau này sẽ chặn Auth)
exports.getLessonBySlug = async (req, res, next) => {
  try {
    const lesson = await Lesson.findOne({ slug: req.params.slug }).lean();

    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài học' });
    }

    res.status(200).json({ success: true, data: lesson });
  } catch (err) {
    console.error('Lỗi lấy bài học:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};