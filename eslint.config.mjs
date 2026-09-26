import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextVitals,
  ...nextTypescript,
  { ignores: [".next/**", ".data/**", "node_modules/**", "coverage/**", "next-env.d.ts"] },
  // Fetch-driven views intentionally set loading state in effects when their inputs change.
  { rules: { "react-hooks/set-state-in-effect": "off" } },
];

export default eslintConfig;
