const express = require('express');
const excuseController = require('../controllers/excuse.controller');
const upload = require('../middlewares/upload');
const router = express.Router();

router.post('/submitExcuseRequest', upload.single('attachment'), excuseController.submitExcuseRequest);
router.post('/submitExcuseRequestOnBehalf', upload.single('attachment'), excuseController.submitExcuseOnBehalf);
router.post('/draftSaveExcuseRequest', upload.single('attachment'), excuseController.draftSaveExcuseRequest);
router.get('/getExcuseTransactions', excuseController.getExcuseTransactions);
router.get('/getExcuseRequestDetails/:reqid', excuseController.getExcuseRequestDetails);
router.get('/getPendingExcuseRequests', excuseController.getPendingExcuseRequests);
router.patch('/approveRejectExcuseRequest', excuseController.approveRejectExcuseRequest);
router.patch('/changeExcuseApproval', excuseController.changeExcuseApproval);
router.post('/delegateExcuseRequest', excuseController.delegateExcuseApproval);
router.patch('/cancelExcuseRequest/:reqid', excuseController.cancelExcuseRequest);

module.exports = router;
