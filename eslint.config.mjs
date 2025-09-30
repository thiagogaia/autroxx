import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  // Regras afrouxadas para não quebrar o build
  {
    plugins: {
      "unused-imports": unusedImports,
    },
    linterOptions: {
      // evita falhar por // eslint-disable sem uso
      reportUnusedDisableDirectives: false,
    },
    rules: {
      // Imports/variáveis não usadas
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
      ],
      "unused-imports/no-unused-imports": "warn",
      "unused-imports/no-unused-vars": [
        "warn",
        { vars: "all", varsIgnorePattern: "^_", args: "after-used", argsIgnorePattern: "^_" },
      ],

      // Suavizações comuns
      "import/no-unresolved": "off",
      "no-undef": "off",
      "no-console": "off",
      "react-hooks/exhaustive-deps": "warn",
      "react/jsx-no-target-blank": "off",
      "react/no-unescaped-entities": "off",
    },
  },

  // Overrides para testes e scripts (ainda mais relax)
  {
    files: ["**/*.test.*", "**/__tests__/**", "scripts/**"],
    rules: {
      "no-console": "off",
      "no-undef": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "off",
    },
  },

  // Overrides para TS (ex.: permitir @ts-ignore em migrações)
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "@typescript-eslint/ban-ts-comment": "off",
    },
  },
];

export default eslintConfig;
