/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  setupFiles: ["<rootDir>/__mocks__/firebase.ts"],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
};
