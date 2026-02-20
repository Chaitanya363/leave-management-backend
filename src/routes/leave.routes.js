const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leave.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');

router.post('/apply', verifyToken, leaveController.applyLeave);
router.get('/my-leaves', verifyToken, leaveController.getMyLeaves);

// manager routes
router.get(
    '/all',
    verifyToken,
    authorizeRoles('ADMIN', 'MANAGER'),
    leaveController.getAllLeaveRequests
);

router.put(
    '/status/:leaveId',
    verifyToken,
    authorizeRoles('ADMIN', 'MANAGER'),
    leaveController.updateLeaveStatus
);

router.get(
  '/export',
  verifyToken,
  authorizeRoles('ADMIN', 'MANAGER'),
  leaveController.exportLeaves
);

module.exports = router;
