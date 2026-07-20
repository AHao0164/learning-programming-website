const express = require('express');

const authRoute = require('./auth/auth.route'); 
const courseRoute = require('./course/course.route');
const lessonRoute = require('./course/lesson.route');
const judgeRoute = require('./judge/judge.route');
const aiRoute = require('./judge/ai.route');
const problemRoute = require('./problem/problem.route')
const progressRoute = require('./progress/progress.route');
const enrollmentRoute = require('./course/enrollment.route');

const adminCourseRoute = require('./admin/admin.course.route');
const adminUserRoute = require('./admin/admin.user.route');
const adminDashboardRoute = require('./admin/admin.dashboard.route');
const adminUploadRoute = require('./admin/admin.upload.route');
const paymentRoute = require('./payment/payment.route');
const userRoute = require('./user/user.route');
const commentRoute = require('./course/comment.route');
const reviewRoutes = require('./course/review.route'); 
const blogRoute = require('./blog/blog.route');
const { protect, isAdmin } = require('../middlewares/auth.middleware');

const router = express.Router();


router.use('/auth', authRoute);
router.use('/courses', courseRoute);
router.use('/lessons', lessonRoute);
router.use('/judge', judgeRoute);
router.use('/ai', aiRoute);
router.use('/problems', problemRoute);
router.use('/progress', progressRoute);
router.use('/enrollments', enrollmentRoute);
router.use('/blogs', blogRoute);

router.use('/admin', protect, isAdmin, adminCourseRoute); 
router.use('/admin', protect, isAdmin, adminUserRoute); 
router.use('/admin', protect, isAdmin, adminDashboardRoute); 
router.use('/admin', protect, isAdmin, adminUploadRoute); 

// USER
router.use('/users', userRoute);
router.use('/payment', paymentRoute);
router.use('/comments', commentRoute);
router.use('/reviews', reviewRoutes);

module.exports = router;