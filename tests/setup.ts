// Global test setup for joson-website
// This file is loaded before each test file

// Mock environment variables for tests
process.env.SESSION_SECRET = 'test-secret-key-for-unit-tests-minimum-32-chars'
process.env.SKIP_AUTH = undefined

// Suppress console.error in tests unless explicitly needed
// Uncomment below to suppress:
// global.console.error = jest.fn()

export {}
