const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');
const { requireAuth } = require('../middlewares/auth.middleware');

router.use(requireAuth);

router.get('/meetings/:meetingId/rsvp-stats', attendanceController.getRSVPStats);
router.get('/meetings/:meetingId/attendance', attendanceController.getAllParticipants);
router.post('/meetings/:meetingId/attendance', attendanceController.markAttendance);
router.get('/meetings/:meetingId/od-list', attendanceController.getODList);

module.exports = router;
