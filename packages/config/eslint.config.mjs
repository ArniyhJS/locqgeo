import js from "@eslint/js";
import ts from "typescript-eslint";

/**
 * Shared ESLint flat config for all LocqGeo TypeScript packages and services.
 */
export default [
  {
    name: "@locqgeo/config/ignores",
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
    name: "@locqgeo/config/rules",
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
      ],
    },
  },
];
