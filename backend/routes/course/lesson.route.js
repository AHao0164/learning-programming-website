const express = require('express');
const { getLessonBySlug } = require('../../controllers/course/lesson.controller');
const router = express.Router();

router.get('/:slug', getLessonBySlug);
module.exports = router;