const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: [true, 'Vui lòng chọn số sao đánh giá (1-5)']
    },
    comment: {
        type: String,
        required: [true, 'Vui lòng nhập nội dung đánh giá']
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

reviewSchema.index({ courseId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);