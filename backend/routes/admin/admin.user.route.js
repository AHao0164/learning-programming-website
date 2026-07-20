const express = require('express');
const router = express.Router();

const { 
    getAllUsers, 
    toggleUserStatus,
    getUserProgressAdmin
} = require('../../controllers/admin/admin.user.controller');

router.get('/users', getAllUsers);
router.patch('/users/:userId/status', toggleUserStatus);
router.get('/users/:userId/progress', getUserProgressAdmin);

module.exports = router;