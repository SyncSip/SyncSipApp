module.exports = {
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: '.',
    testRegex: '.*\\.spec\\.ts$',
    transform: {
      '^.+\\.(t|j)s$': 'ts-jest',
    },
    collectCoverageFrom: [
        "**/*.(t|j)s",
        "!**/node_modules/**",
        "!**/dist/**",
        "!**/*.module.ts",
        "!**/main.ts",
        "!**/src/data/**",        
        "!**/src/dto/**",         
        "!**/src/data/migrations/**", 
        "!**/src/config/**"   
      ],
    coverageDirectory: './coverage',
    testEnvironment: 'node',
    roots: ['<rootDir>/src/'],
    moduleNameMapper: {
      '^src/(.*)$': '<rootDir>/src/$1',
    },
  };
  