jest.mock('redis', () => jest.requireActual('redis-mock'));

// jest.setup.js
jest.setTimeout(30000)