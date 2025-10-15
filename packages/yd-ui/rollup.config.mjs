import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";

const external = [
  "react",
  "react-dom",
  "react/jsx-runtime",
  "@radix-ui/react-slot",
  "class-variance-authority",
  "clsx",
  "tailwind-merge",
];

export default {
  input: "src/index.ts",
  output: [
    { file: "dist/index.mjs", format: "esm", sourcemap: true },
    { file: "dist/index.cjs", format: "cjs", sourcemap: true, exports: "named" },
  ],
  external,
  plugins: [
    resolve({ extensions: [".mjs", ".js", ".json", ".ts", ".tsx"] }),
    typescript({
      tsconfig: "./tsconfig.rollup.json",
      include: ["**/*.ts", "**/*.tsx"],
      exclude: ["node_modules/**", "dist/**"],
      compilerOptions: { declaration: false, declarationMap: false },
    }),
  ],
};
