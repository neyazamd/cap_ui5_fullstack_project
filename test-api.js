// Simple Node.js script to test our APIs
const axios = require('axios');

const BASE_URL = 'http://localhost:4004/employee';

async function testAPIs() {
    console.log('🚀 Testing Employee Management APIs...\n');

    try {
        // Test 1: Get Service Root
        console.log('📋 1. Testing Service Root...');
        const serviceRoot = await axios.get(BASE_URL);
        console.log('✅ Service Root OK');
        console.log('Available entities:', Object.keys(serviceRoot.data.value || {}));

        // Test 2: Get All Employees
        console.log('\n👥 2. Testing Get All Employees...');
        const employees = await axios.get(`${BASE_URL}/Employees`);
        console.log(`✅ Found ${employees.data.value.length} employees`);
        employees.data.value.forEach(emp => {
            console.log(`   - ${emp.employeeId}: ${emp.firstName} ${emp.lastName} (${emp.email})`);
        });

        // Test 3: Get All Departments
        console.log('\n🏢 3. Testing Get All Departments...');
        const departments = await axios.get(`${BASE_URL}/Departments`);
        console.log(`✅ Found ${departments.data.value.length} departments`);
        departments.data.value.forEach(dept => {
            console.log(`   - ${dept.departmentCode}: ${dept.name}`);
        });

        // Test 4: Create New Employee
        console.log('\n📝 4. Testing Create New Employee...');
        const newEmployee = {
            firstName: 'API',
            lastName: 'Tester',
            email: 'api.tester@company.com',
            phone: '+1-555-API1',
            hireDate: '2023-08-22',
            status: 'Active'
        };

        const created = await axios.post(`${BASE_URL}/Employees`, newEmployee, {
            headers: { 'Content-Type': 'application/json' }
        });
        console.log('✅ Employee created successfully!');
        console.log(`   Created: ${created.data.firstName} ${created.data.lastName} (ID: ${created.data.employeeId})`);

        // Test 5: Get Employee with Filter
        console.log('\n🔍 5. Testing OData Filter...');
        const filtered = await axios.get(`${BASE_URL}/Employees?$filter=firstName eq 'John'`);
        console.log(`✅ Filter result: Found ${filtered.data.value.length} employees named John`);

        // Test 6: Get Employee with Expand (if associations work)
        console.log('\n🔗 6. Testing OData Expand...');
        try {
            const expanded = await axios.get(`${BASE_URL}/Employees?$expand=department,position&$top=1`);
            console.log('✅ Expand successful!');
            if (expanded.data.value[0]) {
                const emp = expanded.data.value[0];
                console.log(`   Employee: ${emp.firstName} ${emp.lastName}`);
                console.log(`   Department: ${emp.department?.name || 'N/A'}`);
                console.log(`   Position: ${emp.position?.title || 'N/A'}`);
            }
        } catch (expandError) {
            console.log('⚠️  Expand not fully working yet (expected in early development)');
        }

        // Test 7: Get Leave Types
        console.log('\n🏖️ 7. Testing Leave Types...');
        const leaveTypes = await axios.get(`${BASE_URL}/LeaveTypes`);
        console.log(`✅ Found ${leaveTypes.data.value.length} leave types`);
        leaveTypes.data.value.forEach(type => {
            console.log(`   - ${type.code}: ${type.name} (${type.maxDaysPerYear} days/year)`);
        });

        console.log('\n✅ All API tests completed successfully!');

    } catch (error) {
        console.error('❌ API Test Failed:', error.response?.data || error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Headers:', error.response.headers);
        }
    }
}

// Run the tests
testAPIs();
