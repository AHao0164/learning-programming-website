const User = require('../../models/user.model');

// @desc    Lấy top 10 học viên điểm cao nhất
// @route   GET /api/v1/users/leaderboard
exports.getLeaderboard = async (req, res) => {
    try {
        const topUsers = await User.find({ 
            role: 'student',
            status: { $ne: 'locked' }
        })
            .sort({ xp: -1 })
            .limit(10)
            .select('name xp avatar status')
            .lean();

        res.status(200).json({ success: true, data: topUsers });
    } catch (error) {
        console.error("❌ Lỗi API Leaderboard:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};