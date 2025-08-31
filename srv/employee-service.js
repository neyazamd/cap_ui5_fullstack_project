const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {

    const {
        Employees,
        LeaveRequests,
        LeaveBalances,
        PerformanceReviews,
        Timesheets,
        EmployeeHistory,
        EmployeeTrainings,
        Departments
    } = this.entities;

    // Before CREATE validations for Employees
    this.before('CREATE', 'Employees', async (req) => {
        const { firstName, lastName, email } = req.data;

        // Validate required fields
        if (!firstName || !lastName || !email) {
            req.error(400, 'First name, last name, and email are required');
        }

        // Check for duplicate email
        const existingEmployee = await SELECT.one.from(Employees).where({ email });
        if (existingEmployee) {
            req.error(400, 'Employee with this email already exists');
        }

        // Generate employee ID if not provided
        if (!req.data.employeeId) {
            const count = await SELECT.one`count(*) as count`.from(Employees);
            req.data.employeeId = `EMP${String(count.count + 1).padStart(4, '0')}`;
        }

        // Set employment type default
        if (!req.data.employmentType) {
            req.data.employmentType = 'Full-Time';
        }
    });

    // Enhanced leave request validation
    this.before('CREATE', 'LeaveRequests', async (req) => {
        const { startDate, endDate, employee_ID, leaveType_ID } = req.data;

        // Validate dates
        if (new Date(startDate) >= new Date(endDate)) {
            req.error(400, 'End date must be after start date');
        }

        // Calculate number of days (excluding weekends for business days calculation)
        const start = new Date(startDate);
        const end = new Date(endDate);
        let diffDays = 0;

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            // Skip weekends (Saturday = 6, Sunday = 0)
            if (d.getDay() !== 0 && d.getDay() !== 6) {
                diffDays++;
            }
        }

        req.data.days = diffDays;
        req.data.submittedDate = new Date().toISOString();

        // Check leave balance
        const currentYear = new Date().getFullYear();
        const balance = await SELECT.one.from(LeaveBalances)
            .where({ employee_ID, leaveType_ID, year: currentYear });

        if (balance && balance.available < diffDays) {
            req.error(400, `Insufficient leave balance. Available: ${balance.available} days, Requested: ${diffDays} days`);
        }
    });

    // Enhanced timesheet validation
    this.before('CREATE', 'Timesheets', async (req) => {
        const { startTime, endTime, breakTime = 0 } = req.data;

        if (startTime && endTime) {
            // Calculate hours worked automatically
            const start = new Date(`1970-01-01T${startTime}:00`);
            const end = new Date(`1970-01-01T${endTime}:00`);
            const diffMs = end - start;
            const diffHours = diffMs / (1000 * 60 * 60);

            req.data.hoursWorked = Math.max(0, diffHours - breakTime);

            // Calculate overtime (assuming 8 hours is standard)
            req.data.overtimeHours = Math.max(0, req.data.hoursWorked - 8);
        }
    });

    // Custom actions implementation
    this.on('approveLeaveRequest', async (req) => {
        const { requestId } = req.data;

        const leaveRequest = await SELECT.one.from(LeaveRequests).where({ ID: requestId });
        if (!leaveRequest) {
            req.error(404, 'Leave request not found');
        }

        if (leaveRequest.status !== 'Pending') {
            req.error(400, 'Only pending requests can be approved');
        }

        await UPDATE(LeaveRequests)
            .set({
                status: 'Approved',
                approvedDate: new Date().toISOString(),
                approvedBy_ID: req.user.id // Assuming user context is available
            })
            .where({ ID: requestId });

        // Update leave balance
        const currentYear = new Date().getFullYear();
        await UPDATE(LeaveBalances)
            .set(`used = used + ${leaveRequest.days}`)
            .where({
                employee_ID: leaveRequest.employee_ID,
                leaveType_ID: leaveRequest.leaveType_ID,
                year: currentYear
            });

        return 'Leave request approved successfully';
    });

    this.on('rejectLeaveRequest', async (req) => {
        const { requestId, reason } = req.data;

        const leaveRequest = await SELECT.one.from(LeaveRequests).where({ ID: requestId });
        if (!leaveRequest) {
            req.error(404, 'Leave request not found');
        }

        if (leaveRequest.status !== 'Pending') {
            req.error(400, 'Only pending requests can be rejected');
        }

        await UPDATE(LeaveRequests)
            .set({
                status: 'Rejected',
                comments: reason,
                approvedDate: new Date().toISOString(),
                approvedBy_ID: req.user.id
            })
            .where({ ID: requestId });

        return 'Leave request rejected successfully';
    });

    this.on('submitPerformanceReview', async (req) => {
        const { reviewId } = req.data;

        const review = await SELECT.one.from(PerformanceReviews).where({ ID: reviewId });
        if (!review) {
            req.error(404, 'Performance review not found');
        }

        if (review.status !== 'Draft') {
            req.error(400, 'Only draft reviews can be submitted');
        }

        await UPDATE(PerformanceReviews)
            .set({
                status: 'Submitted',
                submittedDate: new Date().toISOString()
            })
            .where({ ID: reviewId });

        return 'Performance review submitted successfully';
    });

    // New enhanced actions
    this.on('promoteEmployee', async (req) => {
        const { employeeId, newPositionId, effectiveDate, salaryIncrease } = req.data;

        const employee = await SELECT.one.from(Employees).where({ ID: employeeId });
        if (!employee) {
            req.error(404, 'Employee not found');
        }

        // Create history record
        await INSERT.into(EmployeeHistory).entries({
            employee_ID: employeeId,
            changeType: 'Promotion',
            effectiveDate,
            oldValue: `Position: ${employee.position_ID}, Salary: ${employee.salary}`,
            newValue: `Position: ${newPositionId}, Salary: ${employee.salary + salaryIncrease}`,
            reason: 'Employee promotion',
            approvedBy_ID: req.user.id
        });

        // Update employee
        await UPDATE(Employees)
            .set({
                position_ID: newPositionId,
                salary: employee.salary + salaryIncrease
            })
            .where({ ID: employeeId });

        return 'Employee promoted successfully';
    });

    this.on('transferEmployee', async (req) => {
        const { employeeId, newDepartmentId, effectiveDate } = req.data;

        const employee = await SELECT.one.from(Employees).where({ ID: employeeId });
        if (!employee) {
            req.error(404, 'Employee not found');
        }

        // Create history record
        await INSERT.into(EmployeeHistory).entries({
            employee_ID: employeeId,
            changeType: 'Transfer',
            effectiveDate,
            oldValue: `Department: ${employee.department_ID}`,
            newValue: `Department: ${newDepartmentId}`,
            reason: 'Employee transfer',
            approvedBy_ID: req.user.id
        });

        // Update employee
        await UPDATE(Employees)
            .set({ department_ID: newDepartmentId })
            .where({ ID: employeeId });

        return 'Employee transferred successfully';
    });

    this.on('calculateLeaveBalance', async (req) => {
        const { employeeId, year } = req.data;

        const balances = await SELECT.from(LeaveBalances)
            .where({ employee_ID: employeeId, year });

        let totalAvailable = 0;
        balances.forEach(balance => {
            totalAvailable += (balance.allocated + balance.carriedForward - balance.used);
        });

        return totalAvailable;
    });

    this.on('enrollInTraining', async (req) => {
        const { employeeId, trainingId } = req.data;

        // Check if already enrolled
        const existing = await SELECT.one.from(EmployeeTrainings)
            .where({ employee_ID: employeeId, training_ID: trainingId });

        if (existing) {
            req.error(400, 'Employee is already enrolled in this training');
        }

        await INSERT.into(EmployeeTrainings).entries({
            employee_ID: employeeId,
            training_ID: trainingId,
            enrolledDate: new Date().toISOString().split('T')[0],
            status: 'Enrolled'
        });

        return 'Employee enrolled in training successfully';
    });

    this.on('submitTimesheet', async (req) => {
        const { timesheetId } = req.data;

        await UPDATE(Timesheets)
            .set({ status: 'Submitted' })
            .where({ ID: timesheetId });

        return 'Timesheet submitted successfully';
    });

    // Analytics functions
    this.on('getDepartmentMetrics', async (req) => {
        const { departmentId } = req.data;

        const employeeCount = await SELECT.one`count(*) as count`
            .from(Employees)
            .where({ department_ID: departmentId, status: 'Active' });

        const avgRating = await SELECT.one`avg(overallRating) as avgRating`
            .from(PerformanceReviews)
            .where({
                employee_ID: {
                    in:
                        SELECT.distinct('ID').from(Employees).where({ department_ID: departmentId, status: 'Active' })
                }
            });

        const department = await SELECT.one.from(Departments)
            .where({ ID: departmentId });

        return {
            employeeCount: employeeCount.count || 0,
            averageRating: avgRating.avgRating || 0,
            totalBudget: department?.budget || 0,
            utilizationRate: 85.5 // This would be calculated based on actual work hours
        };
    });

    this.on('getEmployeeMetrics', async (req) => {
        const { employeeId } = req.data;

        const currentYear = new Date().getFullYear();

        const leavesTaken = await SELECT.one`sum(days) as total`
            .from(LeaveRequests)
            .where({
                employee_ID: employeeId,
                status: 'Approved',
                startDate: { '>=': `${currentYear}-01-01` }
            });

        const avgRating = await SELECT.one`avg(overallRating) as avgRating`
            .from(PerformanceReviews)
            .where({ employee_ID: employeeId });

        // Get training programs completed by employee and their durations
        const completedTrainings = await SELECT.from(EmployeeTrainings)
            .where({ employee_ID: employeeId, status: 'Completed' });

        let totalTrainingHours = 0;
        for (const training of completedTrainings) {
            const program = await SELECT.one.from(TrainingPrograms)
                .where({ ID: training.training_ID });
            if (program?.duration) {
                totalTrainingHours += program.duration;
            }
        }

        const employee = await SELECT.one.from(Employees).where({ ID: employeeId });
        const yearsOfService = employee?.hireDate ?
            (new Date() - new Date(employee.hireDate)) / (365.25 * 24 * 60 * 60 * 1000) : 0;

        return {
            totalLeavesTaken: leavesTaken.total || 0,
            averagePerformanceRating: avgRating.avgRating || 0,
            totalTrainingHours: totalTrainingHours || 0,
            yearsOfService: Math.round(yearsOfService * 100) / 100
        };
    });

    // Enhanced calculated fields for Employees
    this.after('READ', 'Employees', (employees) => {
        const calculateFields = (emp) => {
            if (emp.firstName && emp.lastName) {
                emp.fullName = `${emp.firstName} ${emp.lastName}`;
            }

            if (emp.dateOfBirth) {
                const today = new Date();
                const birthDate = new Date(emp.dateOfBirth);
                emp.age = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                    emp.age--;
                }
            }

            if (emp.hireDate) {
                const today = new Date();
                const hire = new Date(emp.hireDate);
                emp.yearsOfService = Math.round(((today - hire) / (365.25 * 24 * 60 * 60 * 1000)) * 100) / 100;
            }
        };

        if (Array.isArray(employees)) {
            employees.forEach(calculateFields);
        } else if (employees) {
            calculateFields(employees);
        }
    });

    // Calculate available leave balance
    this.after('READ', 'LeaveBalances', (balances) => {
        const calculateAvailable = (balance) => {
            balance.available = (balance.allocated || 0) + (balance.carriedForward || 0) - (balance.used || 0);
        };

        if (Array.isArray(balances)) {
            balances.forEach(calculateAvailable);
        } else if (balances) {
            calculateAvailable(balances);
        }
    });

    // Calculate department employee count
    this.after('READ', 'Departments', async (departments) => {
        const calculateMetrics = async (dept) => {
            const count = await SELECT.one`count(*) as count`
                .from(Employees)
                .where({ department_ID: dept.ID, status: 'Active' });
            dept.employeeCount = count.count || 0;

            const avgRating = await SELECT.one`avg(overallRating) as avgRating`
                .from(PerformanceReviews)
                .where({
                    employee_ID: {
                        in:
                            SELECT.distinct('ID').from(Employees).where({ department_ID: dept.ID, status: 'Active' })
                    }
                });
            dept.averageRating = Math.round((avgRating.avgRating || 0) * 100) / 100;
        };

        if (Array.isArray(departments)) {
            await Promise.all(departments.map(calculateMetrics));
        } else if (departments) {
            await calculateMetrics(departments);
        }
    });
});
