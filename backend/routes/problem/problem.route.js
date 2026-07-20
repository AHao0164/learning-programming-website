const express = require('express');
const { getProblemByLessonId, getAdminProblemsByLessonId, 
    createProblem, 
    updateProblem, 
    deleteProblem } = require('../../controllers/problem/problem.controller');
const { protect, isAdmin } = require('../../middlewares/auth.middleware');
const router = express.Router();

router.get('/lesson/:lessonId', getProblemByLessonId);

router.get('/admin/lesson/:lessonId', protect, isAdmin, getAdminProblemsByLessonId);
router.post('/', protect, isAdmin, createProblem);
router.put('/:id', protect, isAdmin, updateProblem);
router.delete('/:id', protect, isAdmin, deleteProblem);

module.exports = router;