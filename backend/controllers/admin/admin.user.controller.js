const User = require('../../models/user.model');
const Enrollment = require('../../models/enrollment.model'); 
const Progress = require('../../models/progress.model');
const Course = require('../../models/course.model');
const Chapter = require('../../models/chapter.model'); 
const Lesson = require('../../models/lesson.model');

const createFuzzyRegex = (str) => {
    const map = {
        'a': '[aAáÁàÀảẢãÃạẠăĂắẮằẰẳẲẵẴặẶâÂấẤầẦẩẨẫẪậẬ]',
        'e': '[eEéÉèÈẻẺẽẼẹẸêÊếẾềỀểỂễỄệỆ]',
        'i': '[iIíÍìÌỉỈĩĨịỊ]',
        'o': '[oOóÓòÒỏỎõÕọỌôÔốỐồỒổỔỗỖộỘơƠớỚờỜởỞỡỠợỢ]',
        'u': '[uUúÚùÙủỦũŨụỤưƯứỨừỪửỬữỮựỰ]',
        'y': '[yYýÝỳỲỷỶỹỸỵỴ]',
        'd': '[dDđĐ]'
    };
    return str.split('').map(char => {
        const lowerChar = char.toLowerCase();
        if (map[lowerChar]) return map[lowerChar];
        return char.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }).join('');
};

// @desc    Lấy danh sách tất cả học viên (Có phân trang & tìm kiếm)
// @route   GET /api/v1/admin/users
exports.getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 7;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';

        let query = { role: { $ne: 'admin' } };

        if (search) {
            const fuzzyRegex = new RegExp(createFuzzyRegex(search), 'i');
            query.$or = [
                { name: fuzzyRegex },
                { email: fuzzyRegex }
            ];
        }

        const total = await User.countDocuments(query);
        const users = await User.find(query)
            .select('-password')
            .sort('-createdAt')
            .skip(skip)
            .limit(limit);

        res.status(200).json({ 
            success: true, 
            data: users,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Khóa / Mở khóa tài khoản
// @route   PATCH /api/v1/admin/users/:userId/status
exports.toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
        }

        const currentStatus = user.status || 'active';
        const nextStatus = currentStatus === 'active' ? 'locked' : 'active';

        await User.findByIdAndUpdate(req.params.userId, { status: nextStatus });

        res.status(200).json({ 
            success: true, 
            message: nextStatus === 'active' ? 'Đã mở khóa tài khoản' : 'Đã khóa tài khoản',
            status: nextStatus 
        });
    } catch (error) {
        console.error("❌ Lỗi toggle status:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Lấy báo cáo tiến độ học tập của 1 học viên
// @route   GET /api/v1/admin/users/:userId/progress
exports.getUserProgressAdmin = async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId).select('createdAt');
        if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy user' });

        const enrollments = await Enrollment.find({ userId });
        
        let enrolledCourses = [];

        for (let en of enrollments) {
            const course = await Course.findById(en.courseId);
            if (!course) continue;

            const completedLessons = await Progress.countDocuments({ 
                userId: userId, 
                courseId: course._id 
            });
            
            const chapters = await Chapter.find({ courseId: course._id });
            const chapterIds = chapters.map(c => c._id);
            const totalLessons = await Lesson.countDocuments({ chapterId: { $in: chapterIds } });

            const percent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

            enrolledCourses.push({
                courseId: course._id,
                courseName: course.title,
                progress: percent,
                completedLessons: completedLessons,
                totalLessons: totalLessons,
                lastAccessed: en.updatedAt ? new Date(en.updatedAt).toLocaleDateString('vi-VN') : 'Chưa học'
            });
        }

        const reportData = {
            joinedDate: new Date(user.createdAt).toLocaleDateString('vi-VN'),
            lastActivity: 'Đang cập nhật...',
            totalStudyTime: 0,
            totalSubmissions: 0, 
            totalProblemsCompleted: 0, 
            enrolledCourses: enrolledCourses
        };

        res.status(200).json({ success: true, data: reportData });
    } catch (error) {
        console.error("❌ Lỗi lấy báo cáo tiến độ:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};