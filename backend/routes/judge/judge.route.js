const express = require('express');
const { runCode, getJobStatus } = require('../../controllers/judge/judge.controller');
const { getProblemSubmissions } = require('../../controllers/judge/submission.controller');

const router = express.Router();

router.post('/run', runCode);
router.get('/job/:jobId', getJobStatus);
router.get('/submissions/:problemId', getProblemSubmissions);

module.exports = router;