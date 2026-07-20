const express = require('express');
const router = express.Router();

const { getDashboardStats } = require('../../controllers/admin/admin.dashboard.controller');

// Đường dẫn: GET /api/v1/admin/dashboard-stats
router.get('/dashboard-stats', getDashboardStats);

module.exports = router;
