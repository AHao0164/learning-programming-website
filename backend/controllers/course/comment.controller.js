const Comment = require('../../models/comment.model');

// @desc    Lấy tất cả bình luận của 1 bài học
// @route   GET /api/v1/comments/:lessonId
exports.getLessonComments = async (req, res) => {
    try {
        const { lessonId } = req.params;

        const comments = await Comment.find({ lessonId })
            .populate('userId', 'name avatar')
            .sort({ createdAt: 1 }) 
            .lean();

        const commentMap = {};
        const roots = [];

        comments.forEach(c => {
            c.replies = [];
            commentMap[c._id.toString()] = c;
        });

        comments.forEach(c => {
            if (c.parentCommentId) {
                const parent = commentMap[c.parentCommentId.toString()];
                if (parent) parent.replies.push(c);
            } else {
                roots.push(c);
            }
        });

        roots.reverse();

        res.status(200).json({ success: true, data: roots });
    } catch (error) {
        console.error("Lỗi lấy bình luận:", error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// @desc    Tạo bình luận mới (Hoặc trả lời bình luận)
// @route   POST /api/v1/comments
exports.createComment = async (req, res) => {
    try {
        const { lessonId, content, parentCommentId } = req.body;
        const userId = req.user.id;

        if (!content || !content.trim()) {
            return res.status(400).json({ success: false, message: 'Nội dung không được để trống' });
        }

        let newComment = await Comment.create({
            userId,
            lessonId,
            content,
            parentCommentId: parentCommentId || null
        });

        newComment = await newComment.populate('userId', 'name avatar');

        const io = req.app.get('io'); 
        
        io.to(lessonId).emit('receive_new_comment', newComment);

        if (parentCommentId) { 
            const parentComment = await Comment.findById(parentCommentId);
            
            // console.log("Đang Reply bình luận của User ID:", parentComment?.userId);
            // console.log("Người đang comment là User ID:", userId);

            if (parentComment && parentComment.userId.toString() !== userId.toString()) {
                // console.log("✅ Hợp lệ! Đang bắn thông báo tới phòng:", parentComment.userId.toString());
                
                io.to(parentComment.userId.toString()).emit('new_notification', {
                    message: `${newComment.userId.name} vừa trả lời bình luận của bạn!`,
                    createdAt: new Date()
                });
            } else {
                // console.log("❌ Không bắn thông báo (Do tự reply chính mình hoặc không tìm thấy comment gốc)");
            }
        }

        res.status(201).json({ success: true, data: newComment });
    } catch (error) {
        console.error("Lỗi tạo bình luận:", error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};