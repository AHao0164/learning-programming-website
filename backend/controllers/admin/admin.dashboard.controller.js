const User = require('../../models/user.model');
const Course = require('../../models/course.model');
const Problem = require('../../models/problem.model');
const Enrollment = require('../../models/enrollment.model');
const Submission = require('../../models/submission.model');

// @desc    Lấy dữ liệu thống kê tổng quan cho Dashboard
// @route   GET /api/v1/admin/dashboard-stats
exports.getDashboardStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        let dateFilter = {};
        let userFilter = { role: { $ne: 'admin' } };

        if (startDate || endDate) {
            dateFilter.createdAt = {};
            if (startDate) {
                dateFilter.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                dateFilter.createdAt.$lte = end;
            }
            userFilter.createdAt = dateFilter.createdAt;
        }

        const totalUsers = await User.countDocuments(userFilter);
        const totalCourses = await Course.countDocuments(dateFilter);
        const totalProblems = await Problem.countDocuments(dateFilter);
        const totalEnrollments = await Enrollment.countDocuments(dateFilter);

        const pipeline = [];
        if (Object.keys(dateFilter).length > 0) {
            pipeline.push({ $match: dateFilter });
        }
        pipeline.push({
            $group: { _id: "$difficulty", count: { $sum: 1 } }
        });
        
        const problemsByDifficulty = await Problem.aggregate(pipeline);

        const difficultyStats = { Easy: 0, Medium: 0, Hard: 0 };
        problemsByDifficulty.forEach(item => {
            if (item._id) difficultyStats[item._id] = item.count;
        });

        const totalSubmissions = await Submission.countDocuments(dateFilter);
        const submissionsByStatus = await Submission.aggregate([
            ...(Object.keys(dateFilter).length > 0 ? [{ $match: dateFilter }] : []),
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);
        
        const subStats = { success: 0, failed: 0, error: 0 };
        submissionsByStatus.forEach(item => {
            if (item._id) subStats[item._id] = item.count;
        });

        const topCoursesPipeline = [
            ...(Object.keys(dateFilter).length > 0 ? [{ $match: dateFilter }] : []),
            { $group: { _id: "$courseId", studentsCount: { $sum: 1 } } },
            { $sort: { studentsCount: -1 } },
            { $limit: 5 },
            { $lookup: {
                from: 'courses',
                localField: '_id',
                foreignField: '_id',
                as: 'courseDetails'
            }},
            { $unwind: "$courseDetails" },
            { $project: { 
                _id: 1, 
                title: "$courseDetails.title", 
                studentsCount: 1 
            }}
        ];
        const topCourses = await Enrollment.aggregate(topCoursesPipeline);

        const statsData = {
            overview: { 
                totalUsers, 
                totalCourses, 
                totalProblems, 
                totalEnrollments,
                totalSubmissions
            },
            charts: {
                difficulty: [
                    { name: 'Dễ', value: difficultyStats.Easy, color: '#10b981' },
                    { name: 'Trung bình', value: difficultyStats.Medium, color: '#f59e0b' },
                    { name: 'Khó', value: difficultyStats.Hard, color: '#ef4444' }
                ],
                submissions: [
                    { name: 'Thành công', value: subStats.success, color: '#28a745' },
                    { name: 'Thất bại', value: subStats.failed, color: '#ffc107' },
                    { name: 'Lỗi', value: subStats.error, color: '#dc3545' }
                ]
            },
            topCourses: topCourses
        };

        res.status(200).json({ success: true, data: statsData });
    } catch (error) {
        console.error("❌ Lỗi API Dashboard:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};