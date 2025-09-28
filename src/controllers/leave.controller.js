const leaveService = require('../services/leave.service');

// Apply/submit a new leave request
exports.applyLeave = async (req, res) => {
  try {
    const result = await leaveService.applyLeave(
      req.body,
      req.file?.buffer,
      req.cookies.empid,
      req.cookies.context.companyid,
      req.file?.originalname,
      req.file?.mimetype,
      req.file?.size
    );
    res.json({ message: "Leave request submitted", LeaveReqID: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get leave history for an employee
exports.getLeaveHistory = async (req, res) => {
  try {
    const history = await leaveService.getLeaveHistory(
      req.cookies.empid,
      req.cookies.context.companyid
    );
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get leave types from all existing requests (unique values)
exports.getLeaveTypes = async (req, res) => {
  try {
    const types = await leaveService.getLeaveTypes();
    res.json(types);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Leave types with balances for current employee/company
exports.getLeaveRequestTypes = async (req, res) => {
  try {
    const today = new Date(); 
    const rawYear = today.getFullYear();
    const y = rawYear !== undefined ? parseInt(rawYear, 10) : undefined;
    const year = Number.isFinite(y) ? y : undefined;
    const data = await leaveService.getLeaveRequestTypes(
      req.cookies.empid,
      req.cookies.context.companyid,
      year
    );
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cancel a leave request
exports.cancelLeave = async (req, res) => {
  try {
    await leaveService.cancelLeave(req.params.reqid || req.query.reqid);
    res.json({ message: "Leave cancelled" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Get all pending leaves for an EmpID
exports.getPendingLeaves = async (req, res) => {
  try {
    const pending = await leaveService.getPendingLeaves(
      req.cookies.empid,
      req.cookies.context.companyid
    );
    res.json(pending);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get one leave by ID
exports.getLeaveById = async (req, res) => {
  try {
    const leave = await leaveService.getLeaveById(req.params.reqid || req.query.reqid);
    res.json(leave);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getLeaveRequestTransactions = async (req, res) => {
  try {
    const history = await leaveService.getLeaveHistory(
      req.cookies.empid,
      req.cookies.context.companyid
    );
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all requests for an employee
exports.getLeaveRequestDetails = async (req, res) => {
  try {
    const details = await leaveService.getLeaveRequestDetails(
      req.params.reqid || req.query.reqid
    );
    res.json(details);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Synonyms for submit/apply
exports.submitLeaveRequest = exports.applyLeave;
exports.submitLeaveRequestOnBehalf = async (req, res) => {
  try {
    const result = await leaveService.applyLeave(
      req.body,
      req.file?.buffer,
      req.body.empid,
      req.cookies.context.companyid,
      req.file?.originalname,
      req.file?.mimetype,
      req.file?.size
    );
    res.json({ message: "Leave request submitted", LeaveReqID: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Edit a request
exports.editLeaveRequest = async (req, res) => {
  try {
    await leaveService.editLeaveRequest(req.body.reqid, req.body);
    res.json({ message: "Leave request edited" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Save as draft
exports.draftSaveLeaveRequest = async (req, res) => {
  try {
    const LeaveReqID = await leaveService.draftSaveLeaveRequest(
      req.body,
      req.file?.buffer,
      req.cookies.empid,
      req.cookies.context.companyid,
      req.file?.originalname,
      req.file?.mimetype,
      req.file?.size
    );
    res.json({ message: "Leave draft saved", LeaveReqID });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPendingLeaveRequestDetails = async (req, res) => {
  try {
    const detail = await leaveService.getPendingLeaveRequestDetails(req.params.reqid || req.query.reqid);
    res.json(detail);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH approve/reject
exports.approveRejectLeaveRequest = async (req, res) => {
  try {
    await leaveService.approveRejectLeave(req.body.reqid, req.body.action);
    res.json({ message: `Leave ${req.body.action}d` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.changeLeaveRequestApproval = async (req, res) => {
  try {
    await leaveService.changeLeaveRequestApproval(req.body.reqid, req.body.status);
    res.json({ message: "Leave approval status updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delegate leave approval
exports.delegateLeaveApproval = async (req, res) => {
  try {
    const { reqid, newApproverEmpID, comment } = req.body;
    await leaveService.delegateLeaveApproval(reqid, newApproverEmpID, comment);
    res.json({ message: 'Leave approval delegated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
