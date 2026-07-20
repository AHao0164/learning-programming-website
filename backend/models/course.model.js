const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, unique: true },
    description: { type: String, required: true },
    thumbnail: { type: String, default: '' },
    price: { type: Number, default: 0 }, 
    level: {
        type: String,
        enum: ["Beginner", "Intermediate", "Advanced", "All Levels"],
        default: "Beginner",
    },
    isPublished: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Course", CourseSchema);
