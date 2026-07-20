const express = require('express');
const router = express.Router();
const { getLessonComments, createComment } = require('../../controllers/course/comment.controller');
const { protect } = require('../../middlewares/auth.middleware');

router.get('/:lessonId', getLessonComments);
router.post('/', protect, createComment);

module.exports = router;