module.exports = {
    collectCoverage: true,
    collectCoverageFrom: [
      './src/index.js'
    ],
    coverageDirectory: './coverage',
    coverageThreshold: {
      global: {
        branches: 10,
        functions: 10,
        lines: 10,
        statements: 10
      }
    },
    testMatch: [
      '**/test/**/*.[jt]s?(x)'
    ],
    transform: {
        '.+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub',
        '^.+\\.js$': 'babel-jest'
    },
}