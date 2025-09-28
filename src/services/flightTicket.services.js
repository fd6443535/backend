const sql = require('mssql');
const dbConfig = require('../config/db.config');
const { generateRequestId } = require('../utils/ids');

// Helpers for passengers management
async function getPassengersByReqID(pool, ReqID) {
  const res = await pool.request()
    .input('ReqID', sql.VarChar(30), ReqID)
    .query('SELECT empID, reqID, companyID, name, relation, passportExpiry, passportNumber FROM PassengersTable WHERE reqID = @ReqID');
  return res.recordset;
}

async function upsertPassengers(pool, EmpID, CompanyID, ReqID, passengers) {
  if (!Array.isArray(passengers) || passengers.length === 0) return;
  // Clear existing passengers for this request
  await pool.request()
    .input('ReqID', sql.VarChar(30), ReqID)
    .query('DELETE FROM PassengersTable WHERE reqID = @ReqID');

  // Insert new passengers
  for (const p of passengers) {
    if (!p) continue;
    await pool.request()
      .input('empID', sql.VarChar(30), EmpID)
      .input('reqID', sql.VarChar(30), ReqID)
      .input('companyID', sql.VarChar(30), CompanyID)
      .input('name', sql.VarChar(50), p.name || null)
      .input('relation', sql.VarChar(20), p.relation || null)
      .input('passportExpiry', sql.Date, p.passportExpiry ? new Date(p.passportExpiry) : null)
      .input('passportNumber', sql.VarChar(30), p.passportNumber || null)
      .query(`
        INSERT INTO PassengersTable (empID, reqID, companyID, name, relation, passportExpiry, passportNumber)
        VALUES (@empID, @reqID, @companyID, @name, @relation, @passportExpiry, @passportNumber)
      `);
  }
}

// Get flight ticket request details by request ID (scoped by CompanyID)
async function getFlightTicketRequestDetails(ReqID, CompanyID) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('ReqID', sql.VarChar(30), ReqID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .query('SELECT * FROM FlightTicketReqTable WHERE ReqID = @ReqID AND CompanyID = @CompanyID');
  const header = result.recordset[0] || null;
  if (!header) return null;
  const passengers = await getPassengersByReqID(pool, ReqID);
  return { ...header, passengers };
}

// Get all transactions/history for an employee
async function getFlightTicketTransactions(EmpID, CompanyID) {
  const pool = await sql.connect(dbConfig);
  // Assume each request update counts as a transaction; otherwise, join to a separate log table if exists
  const result = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .query('SELECT * FROM FlightTicketReqTable WHERE EmpID = @EmpID AND CompanyID = @CompanyID ORDER BY CreatedDate DESC');
  return result.recordset;
}

// Submit a new flight ticket request
async function submitFlightTicketRequest(data, EmpID, CompanyID) {
  const pool = await sql.connect(dbConfig);

  // Determine manager for this employee
  let managerID = null;
  const mgrRes = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .query('SELECT managerEmpID FROM EmpProfileTable WHERE empID = @EmpID AND CompanyID = @CompanyID');
  if (mgrRes.recordset.length) managerID = mgrRes.recordset[0].managerEmpID;
  const ReqID = generateRequestId();
  // Normalize dates to DateTime and handle optional return
  const departingAt = data?.DepartingDate ? new Date(data.DepartingDate) : null;
  const returningAt = data?.ReturnTrip && data?.ReturnDate ? new Date(data.ReturnDate) : null;
  await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .input('ReqID', sql.VarChar(30), ReqID)
    .input('DepartingDate', sql.DateTime, departingAt)
    .input('fromLocation', sql.VarChar(50), data.From)
    .input('toLocation', sql.VarChar(50), data.To)
    .input('Purpose', sql.VarChar(100), data.Purpose)
    .input('Class', sql.VarChar(10), data.Class)
    .input('ReturnTrip', sql.Bit, data.ReturnTrip)
    .input('ReturnDate', sql.DateTime, returningAt)
    .input('CreatedDate', sql.Date, new Date())
    .input('status', sql.VarChar(20), 'Pending')
    .input('ApproverEmpID', sql.VarChar(30), managerID)
    .query(`
      INSERT INTO FlightTicketReqTable
      (empID, companyID, reqID, departingDate, fromLocation, toLocation, purpose, class, returnTrip, returnDate, createdDate, approverEmpID, status)
      VALUES
      (@EmpID, @CompanyID, @ReqID, @DepartingDate, @fromLocation, @toLocation, @Purpose, @Class, @ReturnTrip, @ReturnDate, @CreatedDate, @ApproverEmpID, @status)
    `);
  // Upsert passengers if provided
  if (Array.isArray(data.passengers) && data.passengers.length > 0) {
    await upsertPassengers(pool, EmpID, CompanyID, ReqID, data.passengers);
  }
  return ReqID;
}

// Submit a flight ticket request on behalf of another employee
async function submitFlightTicketRequestOnBehalf(data, EmpID, CompanyID) {
  return submitFlightTicketRequest(data, EmpID, CompanyID);
}

// Patch/edit an existing request (fields as needed)
async function editFlightTicketRequest(requestId, updateData, CompanyID) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('ReqID', sql.VarChar(30), requestId)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .input('DepartingDate', sql.VarChar(50), updateData.DepartingDate)
    .input('fromLocation', sql.VarChar(50), updateData.fromLocation)
    .input('toLocation', sql.VarChar(50), updateData.toLocation)
    .input('Purpose', sql.VarChar(100), updateData.Purpose)
    .input('Class', sql.VarChar(10), updateData.Class)
    .input('ReturnTrip', sql.Bit, updateData.ReturnTrip)
    .input('ReturnDate', sql.VarChar(50), updateData.ReturnDate)
    .input('status', sql.VarChar(20), updateData.status)
    .query(`
      UPDATE FlightTicketReqTable
      SET DepartingDate=@DepartingDate, fromLocation=@fromLocation, toLocation=@toLocation, Purpose=@Purpose,
          Class=@Class, ReturnTrip=@ReturnTrip, ReturnDate=@ReturnDate, status=@status
      WHERE ReqID=@ReqID AND CompanyID=@CompanyID
    `);

  // If passengers provided, replace passengers for this request
  if (Array.isArray(updateData.passengers)) {
    // Get EmpID for this request to satisfy PassengersTable PK
    const empRes = await pool.request()
      .input('ReqID', sql.VarChar(30), requestId)
      .input('CompanyID', sql.VarChar(30), CompanyID)
      .query('SELECT empID FROM FlightTicketReqTable WHERE ReqID=@ReqID AND CompanyID=@CompanyID');
    const EmpID = empRes.recordset.length ? empRes.recordset[0].empID : null;
    if (EmpID) {
      await upsertPassengers(pool, EmpID, CompanyID, requestId, updateData.passengers);
    }
  }
}

// Save as draft
async function draftSaveFlightTicketRequest(data, EmpID, CompanyID) {
  const pool = await sql.connect(dbConfig);

  // Determine manager for this employee
  let managerID = null;
  const mgrRes = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .query('SELECT managerEmpID FROM EmpProfileTable WHERE empID = @EmpID AND CompanyID = @CompanyID');
  if (mgrRes.recordset.length) managerID = mgrRes.recordset[0].managerEmpID;
  const ReqID = generateRequestId();
  // Normalize dates to DateTime and handle optional return
  const departingAt = data?.DepartingDate ? new Date(data.DepartingDate) : null;
  const returningAt = data?.ReturnTrip && data?.ReturnDate ? new Date(data.ReturnDate) : null;
  await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .input('ReqID', sql.VarChar(30), ReqID)
    .input('DepartingDate', sql.DateTime, departingAt)
    .input('fromLocation', sql.VarChar(50), data.fromLocation)
    .input('toLocation', sql.VarChar(50), data.toLocation)
    .input('Purpose', sql.VarChar(100), data.Purpose)
    .input('Class', sql.VarChar(10), data.Class)
    .input('ReturnTrip', sql.Bit, data.ReturnTrip)
    .input('ReturnDate', sql.DateTime, returningAt)
    .input('CreatedDate', sql.Date, new Date())
    .input('status', sql.VarChar(20), 'Draft')
    .input('ApproverEmpID', sql.VarChar(30), managerID)
    .query(`
      INSERT INTO FlightTicketReqTable
      (EmpID, CompanyID, ReqID, DepartingDate, fromLocation, toLocation, Purpose, Class, ReturnTrip, ReturnDate, CreatedDate, ApproverEmpID, status)
      VALUES
      (@EmpID, @CompanyID, @ReqID, @DepartingDate, @fromLocation, @toLocation, @Purpose, @Class, @ReturnTrip, @ReturnDate, @CreatedDate, @ApproverEmpID, @status)
    `);
  // Upsert passengers if provided
  if (Array.isArray(data.passengers) && data.passengers.length > 0) {
    await upsertPassengers(pool, EmpID, CompanyID, ReqID, data.passengers);
  }
  return ReqID;
}

// Delegate approval to another emp
async function delegateFlightTicketApproval(requestId, newApproverEmpID, comments=null, CompanyID) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('ReqID', sql.VarChar(30), requestId)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .input('ApproverEmpID', sql.VarChar(30), newApproverEmpID)
    .query('UPDATE FlightTicketReqTable SET ApproverEmpID=@ApproverEmpID WHERE ReqID=@ReqID AND CompanyID=@CompanyID');
  
  // Log delegation in timeline
    const timelineID = generateRequestId();
    await pool.request()
      .input('timelineID', sql.VarChar(30), timelineID)
      .input('reqID', sql.VarChar(30), requestId)
      .input('action', sql.VarChar(50), 'Delegated')
      .input('actorEmpID', sql.VarChar(30), newApproverEmpID)
      .input('comments', sql.VarChar(500), comments)
      .input('actionDate', sql.DateTime, new Date())
      .query(`
        INSERT INTO RequestTimelineTable (timelineID, reqID, action, actorEmpID, comments, actionDate)
        VALUES (@timelineID, @reqID, @action, @actorEmpID, @comments, @actionDate)
      `);
}

// Change approval status of a flight ticket request
async function changeFlightTicketApproval(requestId, approvalStatus, CompanyID) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('ReqID', sql.VarChar(30), requestId)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .input('status', sql.VarChar(20), 'Change request')
    .query('UPDATE FlightTicketReqTable SET status=@status WHERE ReqID=@ReqID AND CompanyID=@CompanyID');
}

// Approve or reject ticket
async function approveRejectFlightTicketRequest(requestId, action, comments, CompanyID) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('ReqID', sql.VarChar(30), requestId)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .input('status', sql.VarChar(20), action === 'approve' ? 'Approved' : 'Rejected')
    .input('ApproverComments', sql.VarChar(100), comments)
    .input('ReviewedAt', sql.Date, new Date())
    .query('UPDATE FlightTicketReqTable SET status=@status, ApproverComments=@ApproverComments, ReviewedAt=@ReviewedAt WHERE ReqID=@ReqID AND CompanyID=@CompanyID');
}

// Get pending requests for a given approver
async function getPendingFlightTicketRequests(ApproverEmpID, CompanyID) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('ApproverEmpID', sql.VarChar(30), ApproverEmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .query('SELECT * FROM FlightTicketReqTable WHERE status = \'Pending\' AND ApproverEmpID = @ApproverEmpID AND CompanyID=@CompanyID ORDER BY CreatedDate DESC');
  return result.recordset;
}


// Cancel a flight ticket request by setting status to 'Draft'
async function cancelFlightTicketRequest(requestId, CompanyID) {
  const pool = await sql.connect(dbConfig);
  await pool.request()
    .input('ReqID', sql.VarChar(30), requestId)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .input('status', sql.VarChar(20), 'Draft')
    .query('UPDATE FlightTicketReqTable SET status=@status WHERE ReqID=@ReqID AND CompanyID=@CompanyID');
}

module.exports = {
  getFlightTicketRequestDetails,
  getFlightTicketTransactions,
  submitFlightTicketRequest,
  submitFlightTicketRequestOnBehalf,
  editFlightTicketRequest,
  draftSaveFlightTicketRequest,
  delegateFlightTicketApproval,
  changeFlightTicketApproval,
  approveRejectFlightTicketRequest,
  getPendingFlightTicketRequests,
  cancelFlightTicketRequest,
};
