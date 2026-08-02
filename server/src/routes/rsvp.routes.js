const express = require('express');
const router = express.Router();
const rsvpController = require('../controllers/rsvp.controller');

// Public routes - No Auth required
router.get('/verify/:token', rsvpController.verifyToken);
router.post('/:token', rsvpController.submitRSVP);

module.exports = router;
