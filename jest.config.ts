export default {
  collectCoverageFrom: ['<rootDir>/src/**/*.ts', '!<rootDir>/src/infra/config/**'],
  coverageDirectory: 'coverage',
  coverageProvider: 'babel',
  moduleNameMapper: {
    '@/templates/(.*)': '<rootDir>/templates/$1',
    '@/tests/(.*)': '<rootDir>/tests/$1',
    '@/(.*)': '<rootDir>/src/$1'
  },
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  transform: {
    '\\.ts$': 'ts-jest'
  },
  clearMocks: true
};
