# ESS Client Backend API

This README documents the ESS backend APIs includes :
- Authentication & Context requirements
- API endpoints with complete request details and typical responses
- Postman collection usage

## Authentication & Context
- Cookies required for most endpoints:
  - `EmpID`: current employee ID
  - `CompanyID`: company context (also accepted via JSON cookie `Context` as `{ CompanyID: "..." }`)
- Success: HTTP 200 with JSON payload
- Error: HTTP 4xx/5xx with `{ error: string }`
- File uploads use `multipart/form-data` with these file field keys:
  - Reimbursement: `receipt`
  - Leave / BusinessTrip / Excuse: `attachment`
- Server-generated request IDs (returned by submit/draft endpoints):
  - BusinessTrip: `reqID`
  - Document: `DocumentReqID`
  - Leave: `LeaveReqID`
  - Excuse: `ExcuseReqID`
  - FlightTicket: `reqid`

## Postman Collection
- Collection: `postman/ESS_Client_Backend_API.postman_collection.json`
- Environments:
  - `postman/ESS_API_Local.postman_environment.json`
  - `postman/ESS_API_Production_Template.postman_environment.json`
- Variables: `baseUrl`, `EmpID`, `CompanyID`, `reqid`, `tripid`, `year`
- The collection auto-sets cookies for each request host: `EmpID`, `CompanyID`, and JSON `Context` with `{ CompanyID }`.
- Tests auto-capture common request IDs found in responses (e.g., `DocumentReqID`, `LeaveReqID`, `ExcuseReqID`, `ReqID`) and set `reqid`/`tripid` for chaining subsequent requests.

Import steps:
1) In Postman, Import → Files: select the collection and one environment (Local or Production Template).
2) Set `EmpID` and `CompanyID` in your active environment, and optionally `year`.
3) Use `{{baseUrl}}` to switch environments; detail calls use `{{reqid}}` (or `{{tripid}}`) captured from submit/draft responses.

---

# API Reference
All paths below are relative to `{{baseUrl}}`.

## Profile (base: `/api/profile`)
- Cookies: `EmpID`
- GET `/getProfile`
  - Cookies: `EmpID`
  - Response 200 example:
    ```json
    {
  "empID": "FI000004",
  "companyID": "C123XYZ",
  "name": "John Doe",
  "DOB": "1990-01-01T00:00:00.000Z",
  "DOJ": "2012-09-18T00:00:00.000Z",
  "position": "VP Marketing",
  "grade": 2,
  "managerEmpID": "CE000001",
  "email": "user@example.com",
  "department": "Finance",
  "contact": "+1 555-0100",
  "address": "Downtown Manhattan, New York, USA"
  }
    ```

- GET `/getPhoto`
  - Cookies: `EmpID`
  - Response: binary image (e.g., JPEG/PNG)

- GET `/getProfileSummary`
  - Cookies: `EmpID`
  - Response 200 example:
    ```json
    {
  "EmpID": "FI000004",
  "Name": "John Doe",
  "Position": "VP Marketing"
  }
    ```

- GET `/getCalendar`
  - Cookies: `EmpID`
  - Response 200 example:
    ```json
    {
  "leaves": [
    {
      "FromDate": null,
      "ToDate": null,
      "Type": "Annual",
      "Status": "Pending"
    }
  ],
  "trips": [
    {
      "StartDate": "2025-08-10T00:00:00.000Z",
      "EndDate": "2025-08-12T00:00:00.000Z",
      "Location": null,
      "status": "Pending"
    },
    {
      "StartDate": "2025-05-15T00:00:00.000Z",
      "EndDate": "2025-05-18T00:00:00.000Z",
      "Location": "Chicago, USA",
      "status": "Pending"
    }
  ]
  }
    ```

- GET `/getEmployeeCompanies`
  - Response 200 example:
    ```json
    [
      { "CompanyID": "C001", "CompanyName": "Acme Corp" },
      { "CompanyID": "C002", "CompanyName": "Globex" }
    ]
    ```

## Attendance (base: `/api/attendance`)
- Cookies: `EmpID`, `CompanyID`
- GET `/getCheckinCheckoutHistory`
  - Cookies: `EmpID`, `CompanyID`
  - Response 200 example:
    ```json
    [
  {
    "Date": "2025-05-05",
    "CheckIn": "08:45:00",
    "CheckOut": "16:45:00"
  }
  ]
    ```

- GET `/getCheckinCheckoutTime`
  - Cookies: `EmpID`, `CompanyID`
  - Response 200 example:
    ```json
    {
  "Date": "2025-05-05",
  "CheckIn": "08:45:00",
  "CheckOut": "16:45:00"
  }
    ```

## Request (base: `/api/request`)
- Cookies: `EmpID`, `CompanyID` (delegates endpoint uses path params for `EmpID`/`CompanyID`)
- GET `/getRequestTransactions`
  - Cookies: `EmpID`, `CompanyID`
  - Response 200 example:
    ```json
    [
  {
    "RequestType": "Excuse",
    "RequestID": "3b5b83b8",
    "empID": "FI000004",
    "status": "Pending",
    "RequestDate": "2025-08-14T00:00:00.000Z"
  },{
    "RequestType": "BusinessTrip",
    "RequestID": "6e855ab3",
    "empID": "FI000004",
    "status": "Pending",
    "RequestDate": "2025-08-09T00:00:00.000Z"
  },{
    "RequestType": "Leave",
    "RequestID": "LR004",
    "empID": "FI000004",
    "status": "Pending",
    "RequestDate": "2025-05-25T00:00:00.000Z"
  }]
    ```

- GET `/getRequestTimeline/{{reqid}}`
  - Path params: `reqid`
  - Response 200 example:
    ```json
    [
      { "action": "Submitted", "actorEmpID": "E001", "comments": "Initial submission", "actionDate": "2025-08-01T09:00:00Z" },
      { "action": "Approved", "actorEmpID": "MGR001", "comments": "Approved", "actionDate": "2025-08-01T12:00:00Z" }
    ]
    ```

- GET `/getDelegates/{{EmpID}}/{{CompanyID}}`
  - Path params: `EmpID`, `CompanyID`
  - Response: array of delegates `{ empid, name, position, department, photo }`
    ```json
    [
      {
        "empid": "E010",
        "name": "Alex Smith",
        "position": "Senior Engineer",
        "department": "R&D",
        "photo": null
      }
    ]
    ```

## Leave (base: `/api/leave`)
- Cookies: `EmpID`, `CompanyID`
- GET `/getLeaveRequestTypes`
  - Response 200 example:
    ```json
    [
      { "TypeCode": "AL", "TypeName": "Annual Leave", "RemainingDays": 10 },
      { "TypeCode": "SL", "TypeName": "Sick Leave", "RemainingDays": 5 }
    ]
    ```

- PATCH `/cancelLeaveRequest/{{reqid}}`
  - Path params: `reqid`
  - Response 200 example:
    ```json
    { "message": "Leave cancelled" }
    ```

- GET `/getPendingLeaveRequests`
  - Response 200 example:
    ```json
    [
      { "LeaveReqID": "LVRQ123456", "EmpID": "E002", "CompanyID": "C001", "FromDate": "2025-08-10", "ToDate": "2025-08-12", "Type": "Annual", "Status": "Pending" }
    ]
    ```

- GET `/getLeaveRequestTransactions`
  - Response 200 example:
    ```json
    [
      { "LeaveReqID": "LVRQ123456", "Status": "Pending", "RequestDate": "2025-08-01" }
    ]
    ```

- GET `/getLeaveRequestDetails?reqid={{reqid}}`
  - Query: `reqid`
  - Response 200 example:
    ```json
    {
      "LeaveReqID": "LVRQ123456",
      "EmpID": "E001",
      "CompanyID": "C001",
      "FromDate": "2025-08-10",
      "ToDate": "2025-08-12",
      "Type": "Annual",
      "Description": "Family trip",
      "Status": "Pending"
    }
    ```

- POST `/submitLeaveRequest` (multipart/form-data)
  - Form-data fields:
    - `attachment` (file; JPEG/PNG/PDF up to 30MB)
    - `FromDate` (YYYY-MM-DD)
    - `ToDate` (YYYY-MM-DD)
    - `Type` (string)
    - `Description` (string, optional)
  - Response 200 example:
    ```json
    { "message": "Leave request submitted", "LeaveReqID": "LVRQ123456" }
    ```

- POST `/submitLeaveRequestOnBehalf` (multipart/form-data)
  - Form-data fields: same as submit + `empid` (target employee)
  - Response 200 example:
    ```json
    { "message": "Leave request submitted on behalf", "LeaveReqID": "LVRQ123456" }
    ```

- PATCH `/editLeaveRequest`
  - Body (application/json):
    ```json
    { "reqid": "{{reqid}}", "Description": "Updated reason" }
    ```
  - Response:
    ```json
    { "message": "Leave request updated" }
    ```

- POST `/draftSaveLeaveRequest` (multipart/form-data)
  - Form-data fields: same as submit
  - Response 200 example:
    ```json
    { "message": "Leave draft saved", "LeaveReqID": "LVRQ123456" }
    ```

- PATCH `/approveRejectLeaveRequest`
  - Body (application/json):
    ```json
    { "reqid": "{{reqid}}", "action": "approve" }
    ```
  - Response:
    ```json
    { "message": "Leave approved" }
    ```

- PATCH `/changeLeaveRequestApproval`
  - Body (application/json):
    ```json
    { "reqid": "{{reqid}}", "status": "REVIEW" }
    ```
  - Response:
    ```json
    { "message": "Leave approval status updated" }
    ```

- POST `/delegateLeaveRequest`
  - Body (application/json):
    ```json
    { "reqid": "{{reqid}}", "newApproverEmpID": "MGR001", "comment": "Delegating for coverage" }
    ```
  - Response:
    ```json
    { "message": "Leave approval delegated successfully" }
    ```

## Excuse (base: `/api/excuse`)
- Cookies: `EmpID`, `CompanyID`
- POST `/submitExcuseRequest` (multipart/form-data)
  - Form-data fields:
    - `attachment` (file)
    - `Date` (YYYY-MM-DD)
    - `From` (HH:mm)
    - `To` (HH:mm)
    - `Reason` (string)
  - Response 200 example:
    ```json
    { "message": "Excuse submitted successfully", "ExcuseReqID": "EXQ123456" }
    ```

- POST `/submitExcuseRequestOnBehalf` (multipart/form-data)
  - Form-data fields: same as submit + `empid`
  - Response 200 example:
    ```json
    { "message": "Excuse submitted on behalf successfully", "ExcuseReqID": "EXQ123456" }
    ```

- POST `/draftSaveExcuseRequest` (multipart/form-data)
  - Form-data fields: same as submit (file optional)
  - Response 200 example:
    ```json
    { "message": "Excuse request draft saved", "ExcuseReqID": "EXQ123456" }
    ```

- GET `/getExcuseTransactions`
  - Response 200 example:
    ```json
    [
      { "ExcuseReqID": "EXQ123456", "Status": "Pending", "Date": "2025-08-10", "From": "09:00", "To": "10:30" }
    ]
    ```

- GET `/getExcuseRequestDetails/{{reqid}}`
  - Path params: `reqid`
  - Response 200 example:
    ```json
    {
      "ExcuseReqID": "EXQ123456",
      "EmpID": "E001",
      "CompanyID": "C001",
      "Date": "2025-08-10",
      "From": "09:00",
      "To": "10:30",
      "Reason": "Medical",
      "Status": "Pending"
    }
    ```

- GET `/getPendingExcuseRequests`
  - Response 200 example:
    ```json
    [
      { "ExcuseReqID": "EXQ123456", "EmpID": "E002", "CompanyID": "C001", "Date": "2025-08-10", "From": "09:00", "To": "10:30", "Status": "Pending" }
    ]
    ```

- PATCH `/approveRejectExcuseRequest`
  - Body (application/json):
    ```json
    { "reqid": "{{reqid}}", "action": "approve", "comments": "Approved" }
    ```
  - Response:
    ```json
    { "message": "Excuse request approved" }
    ```

- PATCH `/changeExcuseApproval`
  - Body (application/json):
    ```json
    { "reqid": "{{reqid}}", "approvalStatus": "REVIEW" }
    ```
  - Response:
    ```json
    { "message": "Excuse approval status changed" }
    ```

- POST `/delegateExcuseRequest`
  - Body (application/json):
    ```json
    { "reqid": "{{reqid}}", "newApproverEmpID": "MGR001" }
    ```
  - Response:
    ```json
    { "message": "Excuse approval delegated" }
    ```

- PATCH `/cancelExcuseRequest/{{reqid}}`
  - Path params: `reqid`
  - Response:
    ```json
    { "message": "Excuse request cancelled" }
    ```

## Reimbursement (base: `/api/reimbursement`)
- Cookies: `EmpID`, `CompanyID`
- GET `/getReimbursementTransactions`
  - Response 200 example:
    ```json
    [
      { "ReimbursementID": "RB123456", "EmpID": "E001", "CompanyID": "C001", "Amount": 100.0, "TypeID": 1, "Purpose": "Taxi", "Status": "Pending" }
    ]
    ```

- GET `/getReimbursementRequestDetails/{{reqid}}`
  - Path params: `reqid`
  - Response 200 example:
    ```json
    {
      "ReimbursementID": "RB123456",
      "EmpID": "E001",
      "CompanyID": "C001",
      "Amount": 100.0,
      "TypeID": 1,
      "Purpose": "Taxi",
      "Status": "Pending"
    }
    ```

- POST `/submitReimbursementRequest` (multipart/form-data)
  - Form-data fields:
    - `receipt` (file)
    - `Amount` (string/number)
    - `TypeID` (string/number)
    - `Purpose` (string)
  - Response 200 example:
    ```json
    { "message": "Reimbursement request submitted", "ReimbursementID": "RB123456" }
    ```

- POST `/submitReimbursementRequestOnBehalf` (multipart/form-data)
  - Form-data fields: same as submit + `empid`
  - Response 200 example:
    ```json
    { "message": "Reimbursement request submitted on behalf", "ReimbursementID": "RB123456" }
    ```

- PATCH `/editReimbursementRequest`
  - Body (application/json):
    ```json
    { "reqid": "{{reqid}}", "Purpose": "Updated taxi" }
    ```
  - Response:
    ```json
    { "message": "Reimbursement request edited" }
    ```

- POST `/draftSaveReimbursementRequest` (multipart/form-data)
  - Form-data fields: `receipt` (file, optional), `Amount`
  - Response:
    ```json
    { "message": "Reimbursement draft saved", "ReimbursementID": "RB123457" }
    ```

- POST `/delegateReimbursementRequest`
  - Body (application/json):
    ```json
    { "reqid": "{{reqid}}", "newApproverEmpID": "MGR001" }
    ```
  - Response:
    ```json
    { "message": "Reimbursement approval delegated successfully" }
    ```

- PATCH `/changeReimbursementApproval`
  - Body (application/json):
    ```json
    { "reqid": "{{reqid}}" }
    ```
  - Response:
    ```json
    { "message": "Reimbursement approval status updated" }
    ```

- PATCH `/approveRejectReimbursementRequest`
  - Body (application/json):
    ```json
    { "reqid": "{{reqid}}", "action": "approve" }
    ```
  - Response:
    ```json
    { "message": "Reimbursement approved" }
    ```

- GET `/getPendingReimbursementRequests`
  - Response 200 example:
    ```json
    [
      { "ReimbursementID": "RB123456", "EmpID": "E002", "CompanyID": "C001", "Amount": 100.0, "Status": "Pending" }
    ]
    ```

- PATCH `/cancelReimbursementRequest/{{reqid}}`
  - Path params: `reqid`
  - Response:
    ```json
    { "message": "Reimbursement request cancelled" }
    ```

## Document (base: `/api/document`)
- Cookies: `EmpID`, `CompanyID`
- GET `/getDocumentTransactions`
  - Response: array of document request rows

- GET `/getDocumentRequestDetails/{{reqid}}`
  - Path params: `reqid`
  - Response 200 example:
    ```json
    {
      "documentReqID": "DOC123456",
      "EmpID": "E001",
      "CompanyID": "C001",
      "ReqDate": "2025-07-24",
      "Status": "Pending",
      "Type": "NOC",
      "Reason": "Initial request"
    }
    ```

- GET `/getDocumentRequestTypes`
  - Response 200 example:
    ```json
    [
      { "TypeCode": "NOC", "TypeName": "No Objection Certificate" },
      { "TypeCode": "EXP", "TypeName": "Experience Letter" }
    ]
    ```

- POST `/submitDocumentRequest`
  - Body (application/json):
    ```json
    { "Type": "NOC", "Reason": "" }
    ```
  - Response 200 example:
    ```json
    { "message": "Document request submitted", "DocumentReqID": "DOC123456" }
    ```

- POST `/submitDocumentRequestOnBehalf`
  - Body (application/json):
    ```json
    { "empid": "E002", "Type": "NOC", "Reason": "" }
    ```
  - Response:
    ```json
    { "message": "Document request submitted on behalf", "DocumentReqID": "DOC123456" }
    ```

- PATCH `/editDocumentRequest`
  - Body (application/json):
    ```json
    { "reqid": "{{reqid}}", "Reason": "Updated" }
    ```
  - Response:
    ```json
    { "message": "Document request updated" }
    ```

- POST `/draftSaveDocumentRequest`
  - Body (application/json):
    ```json
    { "Type": "NOC", "Reason": "" }
    ```
  - Response:
    ```json
    { "message": "Document request draft saved", "DocumentReqID": "DOC123457" }
    ```

- POST `/delegateDocumentRequest`
  - Body (application/json):
    ```json
    { "reqid": "{{reqid}}", "newApproverEmpID": "MGR001", "comments": "Please handle" }
    ```
  - Response:
    ```json
    { "message": "Document approval delegated" }
    ```

- PATCH `/changeDocumentApproval`
  - Body (application/json):
    ```json
    { "reqid": "{{reqid}}" }
    ```
  - Response:
    ```json
    { "message": "Document approval status changed" }
    ```

- PATCH `/approveRejectDocumentRequest`
  - Body (application/json):
    ```json
    { "reqid": "{{reqid}}", "action": "approve", "comments": "Looks good" }
    ```
  - Response:
    ```json
    { "message": "Document request approved" }
    ```

- GET `/getPendingDocumentRequests`
  - Response 200 example:
    ```json
    [
      { "documentReqID": "DOC123456", "Type": "NOC", "Status": "Pending", "ReqDate": "2025-07-24" }
    ]
    ```

- PATCH `/cancelDocumentRequest/{{reqid}}`
  - Path params: `reqid`
  - Response:
    ```json
    { "message": "Document request set to Draft" }
    ```

## Business Trip (base: `/api/businessTrip`)
- Cookies: `EmpID`, `CompanyID`
- GET `/getBusinessTripRequestDetails?reqid={{reqid}}`
  - Query: `reqid`
  - Response 200 example:
    ```json
    {
      "reqID": "BT123456",
      "empID": "E001",
      "companyID": "C001",
      "Location": "City",
      "StartDate": "2025-08-10",
      "EndDate": "2025-08-12",
      "TravelMode": "Air",
      "reason": "Client meeting"
    }
    ```

- GET `/getBusinessTripTransactions`
  - Response 200 example:
    ```json
    [
      { "reqID": "BT123456", "Location": "City", "Status": "Pending", "createdDate": "2025-08-01" }
    ]
    ```

- POST `/submitBusinessTripRequest` (multipart/form-data)
  - Form-data fields:
    - `attachment` (file)
    - `Location` (string)
    - `StartDate` (YYYY-MM-DD)
    - `EndDate` (YYYY-MM-DD)
    - `TravelMode` (string)
    - `reason` (string)
  - Response 200 example:
    ```json
    { "message": "Business trip request submitted", "reqID": "BT123456" }
    ```

- POST `/submitBusinessTripRequestOnBehalf` (multipart/form-data)
  - Form-data fields: same as submit + `empid` (target employee)
  - Response:
    ```json
    { "message": "Business trip request submitted on behalf", "reqID": "BT123456" }
    ```

- PATCH `/editBusinessTripRequest`
  - Body (application/json):
    ```json
    {
      "reqid": "{{reqid}}",
      "Location": "City Updated",
      "StartDate": "2025-08-11",
      "EndDate": "2025-08-13",
      "TravelMode": "Air",
      "reason": "Updated reason"
    }
    ```
  - Response:
    ```json
    { "message": "Business trip request updated" }
    ```

- POST `/draftSaveBusinessTripRequest` (multipart/form-data)
  - Form-data fields: `attachment` (file, optional), `Location` (string)
  - Response:
    ```json
    { "message": "Business trip request draft saved", "reqID": "BT123457" }
    ```

- POST `/delegateBusinessTripRequest`
  - Body (application/json):
    ```json
    { "reqid": "{{reqid}}", "newApproverEmpID": "MGR001", "comments": "Please handle" }
    ```
  - Response:
    ```json
    { "message": "Business trip request delegated" }
    ```

- PATCH `/changeBusinessTripApproval`
  - Body (application/json):
    ```json
    { "reqid": "{{reqid}}" }
    ```
  - Response:
    ```json
    { "message": "Business trip approval status changed" }
    ```

- PATCH `/approveRejectBusinessTripRequest`
  - Body (application/json):
    ```json
    { "reqid": "{{reqid}}", "action": "approve", "comments": "Looks good" }
    ```
  - Response:
    ```json
    { "message": "Business trip has been approved" }
    ```

- GET `/getPendingBusinessTripRequests`
  - Response 200 example:
    ```json
    [
      { "reqID": "BT123456", "EmpID": "E002", "CompanyID": "C001", "Location": "City", "Status": "Pending" }
    ]
    ```

- PATCH `/cancelBusinessTripRequest/{{reqid}}`
  - Path params: `reqid`
  - Response:
    ```json
    { "message": "Business trip request cancelled" }
    ```

## Flight Ticket (base: `/api/flightTicket`)
- Cookies: `EmpID`, `CompanyID`
  - Note: Flight Ticket requests now support multiple passengers per request via `PassengersTable`. Use the `passengers` array in submit/draft/edit APIs. Details response includes `passengers`.
- GET `/getFlightTicketRequestDetails/{{reqid}}`
  - Path params: `reqid`
  - Response 200 example:
    ```json
    {
      "reqID": "FT123456",
      "empID": "E001",
      "companyID": "C001",
      "fromLocation": "LAX",
      "toLocation": "SFO",
      "departingDate": "2025-10-01",
      "Purpose": "Client visit",
      "Class": "Economy",
      "ReturnTrip": true,
      "ReturnDate": "2025-10-05",
      "status": "Pending",
      "passengers": [
        { "name": "Alice", "relation": "Self", "passportNumber": "P123", "passportExpiry": "2026-01-01" },
        { "name": "Bob", "relation": "Spouse", "passportNumber": "P456", "passportExpiry": "2027-02-02" }
      ]
    }
    ```

- GET `/getFlightTicketTransactions`
  - Response 200 example:
    ```json
    [
      { "reqID": "FT123456", "From": "LAX", "To": "SFO", "Status": "Pending", "createdDate": "2025-08-01" }
    ]
    ```

- POST `/submitFlightTicketRequest`
  - Body (application/json):
    ```json
    {
      "From": "LAX",
      "To": "SFO",
      "DepartingDate": "2025-10-01",
      "Purpose": "Client visit",
      "Class": "Economy",
      "ReturnTrip": true,
      "ReturnDate": "2025-10-05",
      "passengers": [
        { "name": "Alice", "relation": "Self", "passportNumber": "P123", "passportExpiry": "2026-01-01" },
        { "name": "Bob", "relation": "Spouse", "passportNumber": "P456", "passportExpiry": "2027-02-02" }
      ]
    }
    ```
  - Response:
    ```json
    { "message": "Flight ticket request submitted", "reqID": "FT123456" }
    ```

- POST `/submitFlightTicketRequestOnBehalf`
  - Body (application/json):
    ```json
    {
      "empid": "E002",
      "From": "LAX",
      "To": "SFO",
      "DepartingDate": "2025-10-01",
      "Purpose": "Client visit",
      "Class": "Economy",
      "ReturnTrip": false,
      "passengers": [
        { "name": "Alice", "relation": "Self", "passportNumber": "P123", "passportExpiry": "2026-01-01" }
      ]
    }
    ```
  - Response:
    ```json
    { "message": "Flight ticket request submitted on behalf", "reqID": "FT123456" }
    ```

- PATCH `/editFlightTicketRequest`
  - Body (application/json):
    ```json
    {
      "reqid": "{{reqid}}",
      "fromLocation": "LAX",
      "toLocation": "SFO",
      "DepartingDate": "2025-10-02",
      "Purpose": "Updated purpose",
      "Class": "Business",
      "ReturnTrip": true,
      "ReturnDate": "2025-10-06",
      "status": "Pending",
      "passengers": [
        { "name": "Alice", "relation": "Self", "passportNumber": "P999", "passportExpiry": "2026-11-11" }
      ]
    }
    ```
  - Response:
    ```json
    { "message": "Flight ticket request updated" }
    ```

- POST `/draftSaveFlightTicketRequest`
  - Body (application/json):
    ```json
    {
      "fromLocation": "LAX",
      "toLocation": "SFO",
      "DepartingDate": "2025-10-01",
      "Purpose": "Draft only",
      "Class": "Economy",
      "ReturnTrip": false,
      "passengers": [
        { "name": "Alice", "relation": "Self", "passportNumber": "P123", "passportExpiry": "2026-01-01" }
      ]
    }
    ```
  - Response:
    ```json
    { "message": "Flight ticket request draft saved", "reqID": "FT123457" }
    ```

- POST `/delegateFlightTicketRequest`
  - Body (application/json):
    ```json
    { "reqid": "{{reqid}}", "newApproverEmpID": "MGR001" }
    ```
  - Response:
    ```json
    { "message": "Flight ticket approval delegated" }
    ```

- PATCH `/changeFlightTicketApproval`
  - Body (application/json):
    ```json
    { "reqid": "{{reqid}}", "approvalStatus": "REVIEW" }
    ```
  - Response:
    ```json
    { "message": "Flight ticket approval status changed" }
    ```

- PATCH `/approveRejectFlightTicketRequest`
  - Body (application/json):
    ```json
    { "reqid": "{{reqid}}", "action": "approve", "comments": "Approved" }
    ```
  - Response:
    ```json
    { "message": "Flight ticket request approved" }
    ```

- GET `/getPendingFlightTicketRequests`
  - Response 200 example:
    ```json
    [
      { "reqID": "FT123456", "EmpID": "E002", "CompanyID": "C001", "From": "LAX", "To": "SFO", "Status": "Pending" }
    ]
    ```

- PATCH `/cancelFlightTicketRequest/{{reqid}}`
  - Path params: `reqid`
  - Response:
    ```json
    { "message": "Flight ticket request cancelled" }
    ```

## Team (base: `/api/team`)
- Cookies: `EmpID`
- GET `/getTeamHierarchy`
  - Response 200 example:
    ```json
    {
      "manager": { "EmpID": "MGR001", "name": "Manager One" },
      "reports": [ { "EmpID": "E001", "name": "Jane Doe" } ]
    }
    ```

- GET `/getTeamCalendar`
  - Response 200 example:
    ```json
    [
      { "date": "2025-08-10", "event": "Team Offsite" }
    ]
    ```

## Notification (base: `/api/notification`)
- Cookies: `EmpID`
- GET `/getNotifications`
  - Response 200 example:
    ```json
    [
      { "id": "N001", "title": "Policy Update", "createdAt": "2025-08-01T10:00:00Z" }
    ]
    ```

