const cds = require('@sap/cds');

describe('Basic CDS Model Tests', () => {

    test('Should load CDS model successfully', async () => {
        // Load the model
        const model = await cds.load('*');

        expect(model).toBeDefined();
        expect(model.definitions).toBeDefined();
    });

    test('Should have Employee entity defined', async () => {
        const model = await cds.load('*');
        const employeeEntity = model.definitions['employee.management.Employees'];

        expect(employeeEntity).toBeDefined();
        expect(employeeEntity.kind).toBe('entity');
        expect(employeeEntity.elements).toBeDefined();
        expect(employeeEntity.elements.firstName).toBeDefined();
        expect(employeeEntity.elements.lastName).toBeDefined();
        expect(employeeEntity.elements.email).toBeDefined();
    });

    test('Should have Department entity defined', async () => {
        const model = await cds.load('*');
        const departmentEntity = model.definitions['employee.management.Departments'];

        expect(departmentEntity).toBeDefined();
        expect(departmentEntity.kind).toBe('entity');
        expect(departmentEntity.elements.name).toBeDefined();
        expect(departmentEntity.elements.departmentCode).toBeDefined();
    });

    test('Should have EmployeeService defined', async () => {
        const model = await cds.load('*');
        const service = model.definitions['EmployeeService'];

        expect(service).toBeDefined();
        expect(service.kind).toBe('service');
    });
});
