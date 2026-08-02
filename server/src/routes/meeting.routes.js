const express = require('express');
const router = express.Router();
const multer = require('multer');
const meetingController = require('../controllers/meeting.controller');
const { requireAuth } = require('../middlewares/auth.middleware');

// Use memory storage for Excel uploads
const upload = multer({ storage: multer.memoryStorage() });

router.use(requireAuth); // All meeting routes require auth

router.post('/', meetingController.createMeeting);
router.get('/stats', meetingController.getStats);
/**
 * @swagger
 * components:
 *   schemas:
 *     Meeting:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         title:
 *           type: string
 *         date:
 *           type: string
 *           format: date-time
 * 
 * /meetings:
 *   get:
 *     summary: Retrieve all meetings
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of meetings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Meeting'
 */
router.get('/', meetingController.getMeetings);
router.get('/:id', meetingController.getMeetingById);
router.put('/:id', meetingController.updateMeeting);
router.delete('/:id', meetingController.deleteMeeting);

module.exports = router;
