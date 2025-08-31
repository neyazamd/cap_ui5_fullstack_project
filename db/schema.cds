namespace employee.management;

using {
    managed,
    cuid,
    Country,
    Currency
} from '@sap/cds/common';

// Value Lists and Code Tables
entity StatusTypes : cuid {
    code        : String(20)   @title: 'Status Code'  @mandatory;
    name        : String(100)  @title: 'Status Name'  @mandatory;
    description : String(500)  @title: 'Description';
    category    : String(50)   @title: 'Category'; // Employee, Leave, Review, etc.
    isActive    : Boolean      @title: 'Is Active' default true;
}

entity SalaryGrades : cuid {
    grade       : String(5)      @title: 'Grade Code'   @mandatory;
    title       : String(100)    @title: 'Grade Title'  @mandatory;
    minSalary   : Decimal(12, 2) @title: 'Minimum Salary';
    maxSalary   : Decimal(12, 2) @title: 'Maximum Salary';
    currency    : Currency       @title: 'Currency';
    description : String(500)    @title: 'Description';
}

// Core employee entity with enhancements
entity Employees : managed, cuid {
    employeeId        : String(10)                  @title: 'Employee ID';
    firstName         : String(100)                 @title: 'First Name'            @mandatory;
    lastName          : String(100)                 @title: 'Last Name'             @mandatory;
    email             : String(150)                 @title: 'Email'                 @mandatory;
    phone             : String(20)                  @title: 'Phone Number';

    // Employment details
    department        : Association to Departments  @title: 'Department';
    position          : Association to Positions    @title: 'Position';
    manager           : Association to Employees    @title: 'Manager';
    hireDate          : Date                        @title: 'Hire Date'             @mandatory;
    status            : String(20)                  @title: 'Status' default 'Active';

    // Enhanced employment information
    employmentType    : String(20)                  @title: 'Employment Type' default 'Full-Time'; // Full-Time, Part-Time, Contract
    workLocation      : String(100)                 @title: 'Work Location';
    salary            : Decimal(12, 2)              @title: 'Current Salary';
    salaryGrade       : Association to SalaryGrades @title: 'Salary Grade';

    // Personal information
    dateOfBirth       : Date                        @title: 'Date of Birth';
    address           : String(500)                 @title: 'Address';
    nationality       : Country                     @title: 'Nationality';

    // Calculated fields (virtual)
    fullName          : String(200)                 @title: 'Full Name'             @readonly;
    age               : Integer                     @title: 'Age'                   @readonly;
    yearsOfService    : Decimal(5, 2)               @title: 'Years of Service'      @readonly;

    // Leave balance tracking
    totalLeaveBalance : Decimal(5, 2)               @title: 'Total Leave Balance'   @readonly;
    usedLeaveThisYear : Decimal(5, 2)               @title: 'Used Leave This Year'  @readonly;
}

// Department entity with enhancements
entity Departments : managed, cuid {
    departmentCode   : String(10)                 @title: 'Department Code'  @mandatory;
    name             : String(100)                @title: 'Department Name'  @mandatory;
    description      : String(500)                @title: 'Description';
    manager          : Association to Employees   @title: 'Department Manager';

    // Enhanced department information
    parentDepartment : Association to Departments @title: 'Parent Department';
    costCenter       : String(20)                 @title: 'Cost Center';
    budget           : Decimal(15, 2)             @title: 'Annual Budget';
    currency         : Currency                   @title: 'Budget Currency';
    location         : String(100)                @title: 'Department Location';
    establishedDate  : Date                       @title: 'Established Date';

    // Calculated fields
    employeeCount    : Integer                    @title: 'Employee Count'   @readonly;
    averageRating    : Decimal(3, 2)              @title: 'Avg Performance'  @readonly;

    // Associations
    employees        : Association to many Employees
                           on employees.department = $self;
    subDepartments   : Association to many Departments
                           on subDepartments.parentDepartment = $self;
}

// Position/Job entity with enhancements
entity Positions : managed, cuid {
    positionCode : String(10)                  @title: 'Position Code'   @mandatory;
    title        : String(100)                 @title: 'Position Title'  @mandatory;
    description  : String(500)                 @title: 'Job Description';
    salaryGrade  : Association to SalaryGrades @title: 'Salary Grade';

    // Enhanced position information
    level        : Integer                     @title: 'Position Level';
    category     : String(50)                  @title: 'Position Category'; // Management, Technical, Administrative
    skills       : String(1000)                @title: 'Required Skills';
    experience   : String(500)                 @title: 'Experience Requirements';
    isManagerial : Boolean                     @title: 'Is Managerial Position' default false;

    // Associations
    employees    : Association to many Employees
                       on employees.position = $self;
}

// Leave type configuration with enhancements
entity LeaveTypes : managed, cuid {
    code              : String(10)   @title: 'Leave Type Code'  @mandatory;
    name              : String(100)  @title: 'Leave Type Name'  @mandatory;
    description       : String(500)  @title: 'Description';
    maxDaysPerYear    : Integer      @title: 'Max Days Per Year' default 0;
    carryForward      : Boolean      @title: 'Carry Forward Allowed' default false;

    // Enhanced leave type features
    requiresApproval  : Boolean      @title: 'Requires Approval' default true;
    isPaid            : Boolean      @title: 'Is Paid Leave' default true;
    isEmergency       : Boolean      @title: 'Emergency Leave' default false;
    minimumDays       : Integer      @title: 'Minimum Days' default 1;
    advanceNoticeDays : Integer      @title: 'Advance Notice Required (Days)' default 1;
}

// Employee Leave Balance tracking
entity LeaveBalances : managed, cuid {
    employee       : Association to Employees   @title: 'Employee'        @mandatory;
    leaveType      : Association to LeaveTypes  @title: 'Leave Type'      @mandatory;
    year           : Integer                    @title: 'Year'            @mandatory;
    allocated      : Decimal(5, 2)              @title: 'Allocated Days';
    used           : Decimal(5, 2)              @title: 'Used Days' default 0;
    carriedForward : Decimal(5, 2)              @title: 'Carried Forward' default 0;

    // Calculated field
    available      : Decimal(5, 2)              @title: 'Available Days'  @readonly;
}

// Enhanced leave requests
entity LeaveRequests : managed, cuid {
    employee      : Association to Employees   @title: 'Employee'        @mandatory;
    leaveType     : Association to LeaveTypes  @title: 'Leave Type'      @mandatory;
    startDate     : Date                       @title: 'Start Date'      @mandatory;
    endDate       : Date                       @title: 'End Date'        @mandatory;
    days          : Decimal(5, 2)              @title: 'Number of Days'  @readonly;
    reason        : String(500)                @title: 'Reason';
    status        : String(20)                 @title: 'Status' default 'Pending';
    approvedBy    : Association to Employees   @title: 'Approved By';
    approvedDate  : DateTime                   @title: 'Approval Date';
    comments      : String(1000)               @title: 'Comments';

    // Enhanced leave request features
    isEmergency   : Boolean                    @title: 'Emergency Request' default false;
    attachments   : String(500)                @title: 'Attachments';
    delegatedTo   : Association to Employees   @title: 'Work Delegated To';

    // Workflow tracking
    submittedDate : DateTime                   @title: 'Submitted Date';
    approvalLevel : Integer                    @title: 'Current Approval Level' default 1;
}

// Training and Development
entity TrainingPrograms : managed, cuid {
    code        : String(20)     @title: 'Program Code'   @mandatory;
    title       : String(200)    @title: 'Program Title'  @mandatory;
    description : String(1000)   @title: 'Description';
    category    : String(50)     @title: 'Category'; // Technical, Soft Skills, Compliance
    duration    : Integer        @title: 'Duration (Hours)';
    cost        : Decimal(10, 2) @title: 'Cost per Person';
    currency    : Currency       @title: 'Currency';
    provider    : String(200)    @title: 'Training Provider';
    isActive    : Boolean        @title: 'Is Active' default true;
}

entity EmployeeTrainings : managed, cuid {
    employee      : Association to Employees         @title: 'Employee'          @mandatory;
    training      : Association to TrainingPrograms  @title: 'Training Program'  @mandatory;
    enrolledDate  : Date                             @title: 'Enrolled Date'     @mandatory;
    completedDate : Date                             @title: 'Completed Date';
    status        : String(20)                       @title: 'Status' default 'Enrolled';
    score         : Decimal(5, 2)                    @title: 'Score (%)';
    certificate   : String(500)                      @title: 'Certificate Path';
    feedback      : String(1000)                     @title: 'Feedback';
}

// Enhanced performance reviews
entity PerformanceReviews : managed, cuid {
    employee          : Association to Employees  @title: 'Employee'             @mandatory;
    reviewer          : Association to Employees  @title: 'Reviewer'             @mandatory;
    reviewPeriodStart : Date                      @title: 'Review Period Start'  @mandatory;
    reviewPeriodEnd   : Date                      @title: 'Review Period End'    @mandatory;
    overallRating     : Integer                   @title: 'Overall Rating'; // 1-5 scale
    goals             : String(2000)              @title: 'Goals';
    achievements      : String(2000)              @title: 'Achievements';
    feedback          : String(2000)              @title: 'Feedback';
    status            : String(20)                @title: 'Status' default 'Draft';

    // Enhanced review features
    reviewType        : String(50)                @title: 'Review Type'; // Annual, Mid-year, Probation
    developmentPlan   : String(2000)              @title: 'Development Plan';
    nextReviewDate    : Date                      @title: 'Next Review Date';
    hrComments        : String(1000)              @title: 'HR Comments';

    // Multiple rating categories
    technicalSkills   : Integer                   @title: 'Technical Skills (1-5)';
    communication     : Integer                   @title: 'Communication (1-5)';
    teamwork          : Integer                   @title: 'Teamwork (1-5)';
    leadership        : Integer                   @title: 'Leadership (1-5)';
    problemSolving    : Integer                   @title: 'Problem Solving (1-5)';

    // Workflow
    submittedDate     : DateTime                  @title: 'Submitted Date';
    reviewedDate      : DateTime                  @title: 'Reviewed Date';
    acknowledgedDate  : DateTime                  @title: 'Employee Acknowledged Date';
}

// Enhanced timesheet entries
entity Timesheets : managed, cuid {
    employee      : Association to Employees  @title: 'Employee'        @mandatory;
    workDate      : Date                      @title: 'Work Date'       @mandatory;
    hoursWorked   : Decimal(4, 2)             @title: 'Hours Worked';
    project       : String(100)               @title: 'Project';
    task          : String(200)               @title: 'Task Description';
    status        : String(20)                @title: 'Status' default 'Draft';

    // Enhanced timesheet features
    startTime     : Time                      @title: 'Start Time';
    endTime       : Time                      @title: 'End Time';
    breakTime     : Decimal(3, 2)             @title: 'Break Time (Hours)';
    overtimeHours : Decimal(4, 2)             @title: 'Overtime Hours'  @readonly;
    billableHours : Decimal(4, 2)             @title: 'Billable Hours';
    workLocation  : String(100)               @title: 'Work Location';
    comments      : String(500)               @title: 'Comments';

    // Approval workflow
    approvedBy    : Association to Employees  @title: 'Approved By';
    approvedDate  : DateTime                  @title: 'Approved Date';
}

// Employee Benefits
entity BenefitTypes : managed, cuid {
    code        : String(20)     @title: 'Benefit Code'  @mandatory;
    name        : String(100)    @title: 'Benefit Name'  @mandatory;
    description : String(500)    @title: 'Description';
    category    : String(50)     @title: 'Category'; // Health, Insurance, Retirement
    provider    : String(200)    @title: 'Provider';
    cost        : Decimal(10, 2) @title: 'Monthly Cost';
    currency    : Currency       @title: 'Currency';
    isActive    : Boolean        @title: 'Is Active' default true;
}

entity EmployeeBenefits : managed, cuid {
    employee     : Association to Employees     @title: 'Employee'       @mandatory;
    benefit      : Association to BenefitTypes  @title: 'Benefit Type'   @mandatory;
    enrolledDate : Date                         @title: 'Enrolled Date'  @mandatory;
    endDate      : Date                         @title: 'End Date';
    status       : String(20)                   @title: 'Status' default 'Active';
    employeeCost : Decimal(10, 2)               @title: 'Employee Cost Share';
    dependents   : Integer                      @title: 'Number of Dependents' default 0;
}

// Audit and Change History
entity EmployeeHistory : managed, cuid {
    employee      : Association to Employees  @title: 'Employee'        @mandatory;
    changeType    : String(50)                @title: 'Change Type'     @mandatory; // Promotion, Transfer, Salary Change
    effectiveDate : Date                      @title: 'Effective Date'  @mandatory;
    oldValue      : String(500)               @title: 'Old Value';
    newValue      : String(500)               @title: 'New Value';
    reason        : String(1000)              @title: 'Reason';
    approvedBy    : Association to Employees  @title: 'Approved By';
    documents     : String(500)               @title: 'Supporting Documents';
}
