const mongoose = require("mongoose");

const LessonSchema = new mongoose.Schema({
    chapterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chapter",
        required: true,
    },
    title: { type: String, required: true },
    slug: { type: String, unique: true },
    order: { type: Number, required: true },

    type: {
        type: String,
        enum: ["video", "text", "theory", "quiz", "coding"],
        default: "video",
    },

    videoUrl: { type: String },
    duration: { type: Number },

    content: {
        type: mongoose.Schema.Types.Mixed,
        default: { time: Date.now(), blocks: [], version: "2.81.0" },
    },

    materials: [
        {
            name: String,
            url: String,
            size: Number,
            type: { type: String, default: "file" },
        },
    ],

    problemIds: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Problem",
        },
    ],

    isFreePreview: { type: Boolean, default: false }, 
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Lesson", LessonSchema);
