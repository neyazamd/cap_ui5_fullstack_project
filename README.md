# Employee Management & HR System

A comprehensive Employee Management and HR System built with SAP Cloud Application Programming Model (CAP) and UI5.

## Project Structure

```
├── db/                     # Database layer
│   ├── schema.cds         # Data model definitions
│   └── data/              # Initial data files
├── srv/                   # Service layer
│   ├── employee-service.cds   # Service definitions
│   └── employee-service.js    # Service implementation
├── app/                   # UI5 frontend (to be added)
├── package.json          # Project configuration
├── .cdsrc.json           # CAP configuration
└── server.js             # Main server file
```

## Features

### Core Entities

- **Employees**: Complete employee information management
- **Departments**: Organizational structure
- **Positions**: Job roles and descriptions
- **Leave Management**: Leave types, requests, and approvals
- **Performance Reviews**: Employee evaluation system
- **Timesheets**: Time tracking and project allocation

### Business Logic

- Employee ID auto-generation
- Leave request validation and approval workflow
- Performance review submission process
- Email uniqueness validation
- Calculated fields (full name, leave days)

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run watch
```

### Build

```bash
npm run build
```

### Deploy Database

```bash
npm run deploy
```

## API Endpoints

The service is available at `/employee` with the following entities:

- GET/POST/PUT/DELETE `/employee/Employees`
- GET/POST/PUT/DELETE `/employee/Departments`
- GET/POST/PUT/DELETE `/employee/Positions`
- GET/POST/PUT/DELETE `/employee/LeaveRequests`
- GET/POST/PUT/DELETE `/employee/PerformanceReviews`
- GET/POST/PUT/DELETE `/employee/Timesheets`

### Custom Actions

- POST `/employee/approveLeaveRequest`
- POST `/employee/rejectLeaveRequest`
- POST `/employee/submitPerformanceReview`

## Next Steps

1. Test the backend API
2. Add UI5 frontend application
3. Implement authentication and authorization
4. Add advanced features like reporting and analytics
# cap_ui5_fullstack_project
