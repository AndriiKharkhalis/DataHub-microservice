import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  moduleFileExtensions: ["ts", "js"],
  testMatch: ["**/__tests__/**/*.test.ts"],
  transformIgnorePatterns: ["<rootDir>/node_modules/"],
  clearMocks: true,
  collectCoverage: true,
  coverageReporters: ["text"],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/**/__tests__/**",
    "!src/app.ts",
    "!src/builder.ts",
    "!src/server.ts",
    "!src/config/**",
    "!src/utils/Logger.ts",
    "!src/controllers/OrderController.ts",
    "!src/domain/index.ts",
    "!src/repositories/index.ts",
    "!src/services/OrderService.ts",
    "!src/types/index.ts",
  ],
};

export default config;
