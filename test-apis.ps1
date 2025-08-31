# PowerShell API Testing Scripts for Employee Management System

Write-Host "🚀 Testing Employee Management APIs..." -ForegroundColor Green

# Base URL
$baseUrl = "http://localhost:4004/employee"

Write-Host "`n📋 1. Testing Service Root..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri $baseUrl -Method GET
    Write-Host "✅ Service Root OK" -ForegroundColor Green
    $response
} catch {
    Write-Host "❌ Service Root Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n👥 2. Testing Get All Employees..." -ForegroundColor Cyan
try {
    $employees = Invoke-RestMethod -Uri "$baseUrl/Employees" -Method GET
    Write-Host "✅ Found $($employees.value.Count) employees" -ForegroundColor Green
    $employees.value | Select-Object employeeId, firstName, lastName, email | Format-Table
} catch {
    Write-Host "❌ Get Employees Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🏢 3. Testing Get All Departments..." -ForegroundColor Cyan
try {
    $departments = Invoke-RestMethod -Uri "$baseUrl/Departments" -Method GET
    Write-Host "✅ Found $($departments.value.Count) departments" -ForegroundColor Green
    $departments.value | Select-Object departmentCode, name | Format-Table
} catch {
    Write-Host "❌ Get Departments Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n📝 4. Testing Create New Employee..." -ForegroundColor Cyan
$newEmployee = @{
    firstName = "API"
    lastName = "Test"
    email = "api.test@company.com"
    phone = "+1-555-TEST"
    hireDate = "2023-08-22"
    status = "Active"
} | ConvertTo-Json

try {
    $headers = @{"Content-Type" = "application/json"}
    $created = Invoke-RestMethod -Uri "$baseUrl/Employees" -Method POST -Body $newEmployee -Headers $headers
    Write-Host "✅ Employee created successfully!" -ForegroundColor Green
    $created | Select-Object employeeId, firstName, lastName, email
} catch {
    Write-Host "❌ Create Employee Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🔍 5. Testing Get Single Employee..." -ForegroundColor Cyan
try {
    $singleEmployee = Invoke-RestMethod -Uri "$baseUrl/Employees?`$filter=firstName eq 'John'" -Method GET
    Write-Host "✅ Found employee: $($singleEmployee.value[0].firstName) $($singleEmployee.value[0].lastName)" -ForegroundColor Green
} catch {
    Write-Host "❌ Get Single Employee Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n✅ API Testing Complete!" -ForegroundColor Green
