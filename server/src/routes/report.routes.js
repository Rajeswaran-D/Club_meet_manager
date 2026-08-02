const express = require('express');
const router = express.Router();
const multer = require('multer');
const reportController = require('../controllers/report.controller');
const { requireAuth } = require('../middlewares/auth.middleware');

const upload = multer({ storage: multer.memoryStorage() });

router.use(requireAuth);

router.post('/meetings/:meetingId/documents', upload.single('file'), reportController.uploadDocument);
router.get('/meetings/:meetingId/documents', reportController.getDocuments);
router.delete('/meetings/:meetingId/documents/:docId', reportController.deleteDocument);
router.post('/meetings/:meetingId/generate-report', reportController.generateReport);
router.get('/meetings/:meetingId/export-od-list', reportController.exportODList);

module.exports = router;
