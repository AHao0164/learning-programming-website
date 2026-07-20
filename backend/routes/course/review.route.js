const express = require('express');
const router = express.Router();
const { getCourseReviews, createReview, deleteReview } = require('../../controllers/course/review.controller');
const { protect } = require('../../middlewares/auth.middleware');

router.get('/:courseId', getCourseReviews);
router.post('/:courseId', protect, createReview);
router.delete('/:reviewId', protect, deleteReview);

module.exports = router;