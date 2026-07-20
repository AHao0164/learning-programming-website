const Progress = require('../../models/progress.model');
const User = require('../../models/user.model'); 

exports.markLessonCompleted = async (req, res) => {
    try {
        const { lessonId, courseId } = req.body;
        const userId = req.body.userId || req.user?.id; 

        if (!userId || !lessonId) {
            return res.status(400).json({ success: false, message: 'Thiếu thông tin User hoặc Lesson' });
        }

        const existingProgress = await Progress.findOne({ userId, lessonId });

        if (existingProgress) {
            return res.status(200).json({ 
                success: true, 
                isNewCompletion: false,
                message: 'Đã lưu tiến độ (Học lại, không cộng XP)' 
            });
        }

        await Progress.create({ userId, lessonId, courseId });

        const user = await User.findById(userId);
        
        user.xp = (user.xp || 0) + 10;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null;
        if (lastActive) lastActive.setHours(0, 0, 0, 0);

        if (!lastActive) {
            user.streak = 1;
        } else {
            const diffTime = Math.abs(today - lastActive);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

            if (diffDays === 1) {
                user.streak = (user.streak || 0) + 1;
            } else if (diffDays > 1) {
                user.streak = 1; 
            }
        }

        user.lastActiveDate = new Date();
        const todayStr = new Date().toISOString().split('T')[0]; 
        
        let currentActivity = 0;
        if (user.activityLog && user.activityLog.get(todayStr)) {
            currentActivity = user.activityLog.get(todayStr);
        }

        await User.updateOne(
            { _id: userId },
            { 
                $set: { 
                    xp: user.xp, 
                    streak: user.streak, 
                    lastActiveDate: user.lastActiveDate,
                    [`activityLog.${todayStr}`]: currentActivity + 1
                } 
            }
        );
        res.status(200).json({ 
            success: true, 
            isNewCompletion: true,
            user: { xp: user.xp, streak: user.streak, activityLog: user.activityLog },
            message: 'Đã lưu tiến độ và cộng điểm!' 
        });

    } catch (error) {
        console.error("❌ LỖI LƯU TIẾN ĐỘ:", error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// 2. Lấy danh sách các bài đã hoàn thành để hiển thị tích xanh
exports.getUserProgress = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.query.userId || req.user?.id;

        if (!userId) {
            return res.status(400).json({ success: false, message: 'Không xác định được sinh viên' });
        }

        const completedLessons = await Progress.find({ userId, courseId }).select('lessonId');
        
        const lessonIds = completedLessons.map(p => p.lessonId.toString());

        res.status(200).json({ success: true, data: lessonIds });
    } catch (error) {
        console.error("❌ LỖI LẤY TIẾN ĐỘ:", error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// @desc    Lấy thống kê Dashboard (Tổng bài đã học, Hoạt động gần đây)
// @route   GET /api/v1/progress/dashboard
// @access  Private
exports.getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;

        const completedCount = await Progress.countDocuments({ userId });

        const recentActivities = await Progress.find({ userId })
            .sort({ createdAt: -1 })
            .limit(3)
            .populate('lessonId', 'title')
            .select('createdAt lessonId');

        res.status(200).json({
            success: true,
            data: {
                completedLessons: completedCount,
                recentActivities: recentActivities
            }
        });
    } catch (error) {
        console.error("Lỗi lấy thống kê Dashboard:", error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};