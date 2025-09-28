const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const profileController = require('../controllers/profile.controller');

router.get('/getProfile', profileController.getProfile);
router.get('/getPhoto', profileController.getPhoto);
router.get('/getProfileSummary', profileController.getProfileSummary);
router.get('/getCalendar', profileController.getCalendar);
router.get('/getEmployeeCompanies', profileController.getEmployeeCompanies);

module.exports = router;
