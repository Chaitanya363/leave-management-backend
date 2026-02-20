const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');

router.get(
  '/stats',
  verifyToken,
  authorizeRoles('ADMIN', 'MANAGER'),
  dashboardController.getDashboardStats
);

module.exports = router;