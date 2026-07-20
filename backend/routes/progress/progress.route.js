const express = require('express');

const { markLessonCompleted, getUserProgress,getDashboardStats } = require('../../controllers/progress/progress.controller');
const { protect } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.get('/dashboard', protect, getDashboardStats);

router.post('/complete', markLessonCompleted);
router.get('/:courseId', getUserProgress);

module.exports = router;