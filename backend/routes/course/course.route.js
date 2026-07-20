const express = require('express');
const { getCourses, getCourseBySlug } = require('../../controllers/course/course.controller');

const router = express.Router();

// Định tuyến các API
router.get('/', getCourses);
router.get('/:slug', getCourseBySlug);

module.exports = router;