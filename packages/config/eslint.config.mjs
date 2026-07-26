import js from "@eslint/js";
import ts from "typescript-eslint";

/**
 * Shared ESLint flat config for all SpottGeo TypeScript packages and services.
 */
export default [
  {
    name: "@spottgeo/config/ignores",
    ignores: [
      "**/dist/**",
      "**/node_modules/**",
      "**/.turbo/**",
      "**/.next/**",
      "**/out/**",
      "**/build/**",
      "**/*.d.ts",
    ],
  },
  js.configs.recommended,
  ...ts.configs.recommended,
  {
    name: "@spottgeo/config/rules",
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
      ],
    },
  },
];
