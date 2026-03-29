module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["@testing-library/jest-dom"],
  moduleNameMapper: {
    "\\.(css|less|scss|module\\.css)$": "identity-obj-proxy",
    "\\.(jpg|jpeg|png|gif|svg)$": "<rootDir>/src/__mocks__/fileMock.js",
  },
  testMatch: ["**/src/**/*.test.{js,jsx,ts,tsx}"],
  transform: {
    "^.+\\.[jt]sx?$": "babel-jest",
  },
};
