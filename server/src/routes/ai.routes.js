const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const { requireAuth } = require('../middlewares/auth.middleware');

router.use(requireAuth);

router.get('/meetings/:meetingId/generate-invite', aiController.generateInvitation);
router.post('/meetings/:meetingId/send-invites', aiController.sendInvitations);
router.post('/process-rsvps', aiController.processRSVPs);

module.exports = router;
