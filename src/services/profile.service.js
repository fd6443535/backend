const sql = require('mssql');
const dbConfig = require('../config/db.config');

async function getProfile(EmpID, CompanyID) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .query('SELECT * FROM EmpProfileTable WHERE EmpID=@EmpID AND CompanyID=@CompanyID');
  return result.recordset[0];
}

async function getPhoto(EmpID, CompanyID) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .query('SELECT photo FROM EmpProfilePhotoTable WHERE EmpID=@EmpID AND CompanyID=@CompanyID');
  return result.recordset[0]?.photo;
}

async function getEmploymentSummary(EmpID, CompanyID) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .query('SELECT EmpID, DOJ, Position, Grade, ManagerEmpID FROM EmpProfileTable WHERE EmpID=@EmpID AND CompanyID=@CompanyID');
  return result.recordset[0];
}

async function getContactInfo(EmpID, CompanyID) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .query('SELECT EmpID, contact, email, address FROM EmpProfileTable WHERE EmpID=@EmpID AND CompanyID=@CompanyID');
  return result.recordset[0];
}

async function getProfileSummary(EmpID, CompanyID) {
  // Return a mix of personal & employment info
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .query('SELECT EmpID, Name, Position FROM EmpProfileTable WHERE EmpID=@EmpID AND CompanyID=@CompanyID');
  return result.recordset[0];
}

async function getCalendar(EmpID, CompanyID) {
  // Sample: Collect leave, business trip, and flight ticket requests for the user
  const pool = await sql.connect(dbConfig);
  const leaves = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .query('SELECT FromDate, ToDate, Type, Status FROM LeaveReqTable WHERE EmpID=@EmpID AND CompanyID=@CompanyID');
  const trips = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .input('CompanyID', sql.VarChar(30), CompanyID)
    .query('SELECT StartDate, EndDate, Location, status FROM BusinessTripReqTable WHERE EmpID=@EmpID AND CompanyID=@CompanyID');
  return {
    leaves: leaves.recordset,
    trips: trips.recordset
  };
}

// List companies (ID and Name) an employee belongs to
async function getEmployeeCompanies(EmpID) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('EmpID', sql.VarChar(30), EmpID)
    .query(`
      SELECT DISTINCT e.CompanyID, c.companyName AS CompanyName
      FROM EmpProfileTable e
      LEFT JOIN CompanyTable c ON c.CompanyID = e.CompanyID
      WHERE e.EmpID = @EmpID
      ORDER BY e.CompanyID
    `);
  return result.recordset;
}

module.exports = {
  getProfile,
  getPhoto,
  getEmploymentSummary,
  getContactInfo,
  getProfileSummary,
  getCalendar,
  getEmployeeCompanies
};
