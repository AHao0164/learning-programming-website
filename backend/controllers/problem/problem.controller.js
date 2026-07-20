const mongoose = require('mongoose');
const Problem = require('../../models/problem.model');
const Lesson = require('../../models/lesson.model'); 

const unescapeHTML = (str) => {
    if (!str) return str;
    return str.replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&amp;/g, '&')
              .replace(/&quot;/g, '"')
              .replace(/&#x27;/g, "'")
              .replace(/&#x2F;/g, '/');
};

// 1. Học viên lấy đề bài
exports.getProblemByLessonId = async (req, res) => {
    try {
        const { lessonId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(lessonId)) {
            return res.status(400).json({ success: false, message: 'ID bài học không hợp lệ' });
        }

        const problems = await Problem.find({ linkedLessonId: lessonId });

        if (!problems || problems.length === 0) {
            return res.status(404).json({ success: false, message: 'Bài học này chưa có bài tập' });
        }

        const publicProblems = problems.map(problem => ({
            _id: problem._id,
            title: unescapeHTML(problem.title),
            description: unescapeHTML(problem.description),
            difficulty: problem.difficulty,
            language: problem.language,
            timeLimit: problem.timeLimit,
            memoryLimit: problem.memoryLimit,
            starterCode: unescapeHTML(problem.starterCode),
            solutionCode: unescapeHTML(problem.solutionCode),
            hints: unescapeHTML(problem.hints),
            sampleTestCases: problem.sampleTestCases
        }));

        res.status(200).json({ success: true, data: publicProblems });
    } catch (error) {
        console.error("❌ LỖI getProblemByLessonId:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Admin lấy danh sách bài tập
exports.getAdminProblemsByLessonId = async (req, res) => {
    try {
        const { lessonId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(lessonId)) {
            return res.status(400).json({ success: false, message: 'ID bài học không hợp lệ' });
        }

        const problems = await Problem.find({ linkedLessonId: lessonId });
        res.status(200).json({ success: true, data: problems });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Admin tạo bài tập mới
exports.createProblem = async (req, res) => {
    try {
        const { title, description, linkedLessonId } = req.body;
        if (!title || title.trim() === '') {
            return res.status(400).json({ success: false, message: 'Tên bài tập không được để trống' });
        }
        if (!description || description.trim() === '') {
            return res.status(400).json({ success: false, message: 'Mô tả bài tập không được để trống' });
        }
        if (!linkedLessonId) {
            return res.status(400).json({ success: false, message: 'Bài tập phải thuộc về một bài học cụ thể' });
        }

        const newProblem = await Problem.create(req.body);

        if (newProblem.linkedLessonId) {
            await Lesson.findByIdAndUpdate(
                newProblem.linkedLessonId,
                { $push: { problemIds: newProblem._id } }
            );
        }

        res.status(201).json({ success: true, data: newProblem });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 4. Admin cập nhật bài tập
exports.updateProblem = async (req, res) => {
    try {
        const { title, description } = req.body;
        if (title !== undefined && title.trim() === '') {
            return res.status(400).json({ success: false, message: 'Tên bài tập không được để trống' });
        }
        if (description !== undefined && description.trim() === '') {
            return res.status(400).json({ success: false, message: 'Mô tả bài tập không được để trống' });
        }

        const updatedProblem = await Problem.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ success: true, data: updatedProblem });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 5. Admin xóa bài tập
exports.deleteProblem = async (req, res) => {
    try {
        const problemToDelete = await Problem.findById(req.params.id);
        if (!problemToDelete) return res.status(404).json({ success: false, message: 'Không tìm thấy' });

        if (problemToDelete.linkedLessonId) {
            await Lesson.findByIdAndUpdate(
                problemToDelete.linkedLessonId,
                { $pull: { problemIds: problemToDelete._id } }
            );
        }

        await Problem.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Xóa thành công' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};