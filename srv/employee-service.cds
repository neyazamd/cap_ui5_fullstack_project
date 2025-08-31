using {employee.management as em} from '../db/schema';

service EmployeeService @(path: '/employee') {

    // Core entities
    @odata.draft.enabled
    entity Employees          as projection on em.Employees;

    @odata.draft.enabled
    entity Departments        as projection on em.Departments;

    @odata.draft.enabled
    entity Positions          as projection on em.Positions;

    // Code tables and configuration
    entity StatusTypes        as projection on em.StatusTypes;
    entity SalaryGrades       as projection on em.SalaryGrades;
    entity LeaveTypes         as projection on em.LeaveTypes;
    entity BenefitTypes       as projection on em.BenefitTypes;
    entity TrainingPrograms   as projection on em.TrainingPrograms;

    // Transaction entities - without draft to avoid composition conflicts
    entity LeaveRequests      as projection on em.LeaveRequests;
    entity LeaveBalances      as projection on em.LeaveBalances;
    entity PerformanceReviews as projection on em.PerformanceReviews;
    entity Timesheets         as projection on em.Timesheets;

    // Additional entities
    entity EmployeeTrainings  as projection on em.EmployeeTrainings;
    entity EmployeeBenefits   as projection on em.EmployeeBenefits;
    entity EmployeeHistory    as projection on em.EmployeeHistory;

    // Custom actions
    action   approveLeaveRequest(requestId: UUID)                                                                 returns String;
    action   rejectLeaveRequest(requestId: UUID, reason: String)                                                  returns String;
    action   submitPerformanceReview(reviewId: UUID)                                                              returns String;

    // New enhanced actions
    action   promoteEmployee(employeeId: UUID, newPositionId: UUID, effectiveDate: Date, salaryIncrease: Decimal) returns String;
    action   transferEmployee(employeeId: UUID, newDepartmentId: UUID, effectiveDate: Date)                       returns String;
    action   calculateLeaveBalance(employeeId: UUID, year: Integer)                                               returns Decimal;
    action   enrollInTraining(employeeId: UUID, trainingId: UUID)                                                 returns String;
    action   submitTimesheet(timesheetId: UUID)                                                                   returns String;

    // Analytics functions
    function getDepartmentMetrics(departmentId: UUID)                                                             returns {
        employeeCount   : Integer;
        averageRating   : Decimal;
        totalBudget     : Decimal;
        utilizationRate : Decimal;
    };

    function getEmployeeMetrics(employeeId: UUID)                                                                 returns {
        totalLeavesTaken         : Decimal;
        averagePerformanceRating : Decimal;
        totalTrainingHours       : Integer;
        yearsOfService           : Decimal;
    };
}
