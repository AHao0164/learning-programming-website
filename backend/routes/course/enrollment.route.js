const express = require('express');
const { enrollCourse, checkEnrollmentStatus, getMyCourses, updateLastAccessed } = require('../../controllers/course/enrollment.controller');

const { protect } = require('../../middlewares/auth.middleware'); 

const router = express.Router();

router.use(protect); 

router.post('/', enrollCourse);
router.get('/my-courses', getMyCourses);
router.get('/check/:courseId', checkEnrollmentStatus);
router.put('/last-accessed', updateLastAccessed);

module.exports = router;