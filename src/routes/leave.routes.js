const express = require('express');
const leaveController = require('../controllers/leave.controller');
const upload = require('../middlewares/upload');
const router = express.Router();

router.get('/getLeaveRequestTypes', leaveController.getLeaveRequestTypes);
router.patch('/cancelLeaveRequest/:reqid', leaveController.cancelLeave);
router.get('/getPendingLeaveRequests', leaveController.getPendingLeaves);
router.get('/getLeaveById/:reqid', leaveController.getLeaveById);
router.get('/getLeaveRequestTransactions',leaveController.getLeaveRequestTransactions)
router.get('/getLeaveRequestDetails',leaveController.getLeaveRequestDetails)
router.post('/submitLeaveRequest', upload.single('attachment'), leaveController.applyLeave)
router.post('/submitLeaveRequestOnBehalf', upload.single('attachment'), leaveController.submitLeaveRequestOnBehalf)
router.patch('/editLeaveRequest',leaveController.editLeaveRequest)
router.post('/draftSaveLeaveRequest', upload.single('attachment'), leaveController.draftSaveLeaveRequest)
router.patch('/approveRejectLeaveRequest',leaveController.approveRejectLeaveRequest)
router.patch('/changeLeaveRequestApproval',leaveController.changeLeaveRequestApproval)
router.post('/delegateLeaveRequest',leaveController.delegateLeaveApproval)

module.exports = router;
