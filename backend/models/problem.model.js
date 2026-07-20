const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Easy' },
    language: { type: String, default: 'javascript' },
    
    timeLimit: { type: Number, default: 3 },
    memoryLimit: { type: Number, default: 128 },
    
    sampleTestCases: [{ input: String, expected: String }],
    hiddenTestCases: [{ input: String, expected: String }],
    
    starterCode: { type: String, default: '' },
    solutionCode: { type: String, default: '' },
    hints: { type: String, default: '' },

    linkedCourseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', default: null },
    linkedModuleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter', default: null },
    linkedLessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Problem', problemSchema);