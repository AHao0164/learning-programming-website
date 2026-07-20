const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Vui lòng nhập tiêu đề bài viết'],
        trim: true,
        maxlength: [200, 'Tiêu đề không được quá 200 ký tự']
    },
    slug: {
        type: String,
        required: [true, 'Vui lòng nhập slug'],
        unique: true,
        trim: true,
        lowercase: true
    },
    excerpt: {
        type: String,
        required: [true, 'Vui lòng nhập mô tả ngắn'],
        maxlength: [300, 'Mô tả không được quá 300 ký tự']
    },
    content: {
        type: String,
        required: [true, 'Vui lòng nhập nội dung bài viết']
    },
    thumbnail: {
        type: String,
        default: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80'
    },
    author: {
        type: String,
        default: 'HK Learning'
    },
    category: {
        type: String,
        enum: ['Programming', 'Technology', 'Career', 'Tutorial', 'News', 'Tips'],
        default: 'Programming'
    },
    tags: [{
        type: String,
        trim: true
    }],
    readTime: {
        type: Number,
        default: 5
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    views: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

blogSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    if (typeof next === 'function') {
        next();
    }
});

module.exports = mongoose.model('Blog', blogSchema);
