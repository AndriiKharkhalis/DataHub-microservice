import globals from "globals";
import eslintPluginPrettier from "eslint-plugin-prettier";
import eslintPluginTypescript from "@typescript-eslint/eslint-plugin";
import eslintParserTypescript from "@typescript-eslint/parser";

export default [
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: eslintParserTypescript,
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node,
      },
    },
    plugins: {
      "@typescript-eslint": eslintPluginTypescript,
      prettier: eslintPluginPrettier,
    },
    rules: {
      ...eslintPluginTypescript.configs.recommended.rules,
      "prettier/prettier": [
        "error",
        {
          printWidth: 105,
          tabWidth: 2,
          useTabs: false,
          singleQuote: false,
          semi: true,
          trailingComma: "all",
        },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
    },
  },
];
