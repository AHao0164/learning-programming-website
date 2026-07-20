const axios = require('axios');
const Problem = require('../../models/problem.model');
const Submission = require('../../models/submission.model');
const judgeQueue = require('../../queue/judgeQueue');

const LOCAL_PISTON_API = process.env.PISTON_API_URL || 'http://127.0.0.1:2000/api/v2/execute';

const unescapeHTML = (str) => {
    if (!str) return str;
    return str.replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&amp;/g, '&')
              .replace(/&quot;/g, '"')
              .replace(/&#x27;/g, "'")
              .replace(/&#x2F;/g, '/');
};

exports.runCode = async (req, res) => {
    try {
        let { language, code, problemId } = req.body;
        
        if (!code) return res.status(400).json({ success: false, message: 'Vui lòng nhập code' });

        code = unescapeHTML(code);

        const problem = await Problem.findById(problemId);
        if (!problem) return res.status(404).json({ success: false, message: 'Không tìm thấy bài tập' });

        const testCases = [];
        if (problem.sampleTestCases && problem.sampleTestCases.length > 0) {
             problem.sampleTestCases.forEach(tc => testCases.push({ input: tc.input, expected: tc.expected, isHidden: false }));
        }
        if (problem.hiddenTestCases && problem.hiddenTestCases.length > 0) {
             problem.hiddenTestCases.forEach(tc => testCases.push({ input: tc.input, expected: tc.expected, isHidden: true }));
        }

        if (testCases.length === 0) {
             return res.status(400).json({ success: false, message: 'Bài tập này chưa có Test Case' });
        }

        let pistonLang = language;
        if (language === 'nodejs') pistonLang = 'javascript';
        if (language === 'c' || language === 'c++' || language === 'cpp') pistonLang = 'c++';

        const userId = req.user?.id || req.body.userId;
        
        const job = await judgeQueue.add('piston-run', {
            language,
            code,
            problemId,
            userId,
            testCases,
            pistonLang
        }, {
            removeOnComplete: { age: 3600 },
            removeOnFail: 5
        });

        res.status(200).json({
            success: true,
            data: {
                jobId: job.id,
                status: 'queued',
                message: 'Code đã được nộp máy chủ chấm, đang xếp hàng chờ...'
            }
        });

    } catch (error) {
        console.error("LỖI KHI XẾP HÀNG CHẤM QUÊ:", error.message);
        res.status(500).json({ success: false, message: 'Server đang quá tải, không thể xếp hàng.' });
    }
};

// @desc    Lấy trạng thái chấm bài từ Hàng Đợi (Queue Polling)
// @route   GET /api/v1/judge/job/:jobId
// @access  Public
exports.getJobStatus = async (req, res) => {
    try {
        const { jobId } = req.params;
        const job = await judgeQueue.getJob(jobId);

        if (!job) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy Job chấm bài (Có thể đã xong từ lâu)' });
        }

        const state = await job.getState(); // 'waiting', 'active', 'completed', 'failed', 'delayed'
        const progress = job.progress || 0;

        if (state === 'completed') {
            return res.status(200).json({
                success: true,
                state: 'completed',
                data: job.returnvalue
            });
        }

        if (state === 'failed') {
            return res.status(200).json({
                success: false,
                state: 'failed',
                error: job.failedReason
            });
        }

        res.status(200).json({
            success: true,
            state: state, // waiting hoặc active
            progress: progress
        });

    } catch (error) {
        console.error('Lỗi khi kiểm tra trạng thái Job:', error);
        res.status(500).json({ success: false, message: 'Lỗi lấy trạng thái job' });
    }
};
