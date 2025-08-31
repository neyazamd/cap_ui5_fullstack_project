// Jest setup file for CDS testing
const cds = require('@sap/cds');

// Set test environment
process.env.NODE_ENV = 'test';

// Global setup for all tests
beforeAll(async () => {
    // Load CDS model for testing
    cds.test = true;
});
