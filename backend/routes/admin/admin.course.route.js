const express = require('express');
const { 
    getAdminCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  createChapter, 
  createLesson, 
  updateLesson,
  updateChapter,
  deleteChapter,
  deleteLesson,
  togglePublishCourse,
  getAdminCourseById
} = require('../../controllers/admin/admin.course.controller');

const router = express.Router();

router.get('/courses', getAdminCourses);
router.get('/courses/:courseId', getAdminCourseById);

// Route Khóa học
router.post('/courses', createCourse);
router.put('/courses/:courseId', updateCourse);
router.delete('/courses/:courseId', deleteCourse);
router.patch('/courses/:courseId/publish', togglePublishCourse);

// Route Chương
router.post('/courses/:courseId/chapters', createChapter);
router.put('/chapters/:chapterId', updateChapter);
router.delete('/chapters/:chapterId', deleteChapter);

// Route Bài học
router.post('/chapters/:chapterId/lessons', createLesson);
router.put('/lessons/:lessonId', updateLesson);
router.delete('/lessons/:lessonId', deleteLesson);

module.exports = router;