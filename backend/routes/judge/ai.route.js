const express = require('express');
const { analyzeCode, generateProblem, chatTutor } = require('../../controllers/judge/ai.controller');

const router = express.Router();

router.post('/analyze', analyzeCode);
router.post('/generate-problem', generateProblem);
router.post('/chat', chatTutor);

module.exports = router;