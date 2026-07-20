const Submission = require('../../models/submission.model');

exports.getProblemSubmissions = async (req, res) => {
    try {
        const { problemId } = req.params;
        const userId = req.user?.id || req.query.userId;

        if (!userId || !problemId) {
            return res.status(400).json({ success: false, message: 'Thiếu thông tin' });
        }

        const submissions = await Submission.find({ userId, problemId })
            .sort({ createdAt: -1 })
            .select('status testCasesPassed totalTestCases createdAt code');

        res.status(200).json({ success: true, data: submissions });
    } catch (error) {
        console.error("Lỗi lấy lịch sử:", error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};