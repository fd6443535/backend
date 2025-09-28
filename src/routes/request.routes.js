const express = require('express');
const requestController = require('../controllers/request.controller');
const router = express.Router();
router.get('/getRequestTransactions', requestController.getRequestTransactions);
router.get('/getRequestTimeline', requestController.getRequestTimeline);
router.get('/getRequestTimeline/:reqid', requestController.getRequestTimeline);
router.get('/getDelegates', requestController.getDelegates);
router.get('/getDelegates', requestController.getDelegates);
module.exports = router;
