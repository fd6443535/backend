const express = require('express');
const router = express.Router();
const flightTicketController = require('../controllers/flightTicket.controller');

router.get('/getFlightTicketRequestDetails/:reqid', flightTicketController.getFlightTicketRequestDetails);
router.get('/getFlightTicketTransactions', flightTicketController.getFlightTicketTransactions);
router.post('/submitFlightTicketRequest', flightTicketController.submitFlightTicketRequest);
router.post('/submitFlightTicketRequestOnBehalf', flightTicketController.submitFlightTicketRequestOnBehalf);
router.patch('/editFlightTicketRequest', flightTicketController.editFlightTicketRequest);
router.post('/draftSaveFlightTicketRequest', flightTicketController.draftSaveFlightTicketRequest);
router.post('/delegateFlightTicketRequest', flightTicketController.delegateFlightTicketApproval);
router.patch('/changeFlightTicketApproval', flightTicketController.changeFlightTicketApproval);
router.patch('/approveRejectFlightTicketRequest', flightTicketController.approveRejectFlightTicketRequest);
router.get('/getPendingFlightTicketRequests', flightTicketController.getPendingFlightTicketRequests);
router.patch('/cancelFlightTicketRequest/:reqid', flightTicketController.cancelFlightTicketRequest);

module.exports = router;