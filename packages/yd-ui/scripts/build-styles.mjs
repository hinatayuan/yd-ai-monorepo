import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import postcss from "postcss";
import autoprefixer from "autoprefixer";

const pExecFile = promisify(execFile);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const require = createRequire(import.meta.url);
// Resolve tailwind CLI JS directly to avoid relying on .bin and path encoding issues
let twCliJs;
try {
  // Tailwind CLI entry
  twCliJs = require.resolve("tailwindcss/lib/cli.js", { paths: [root] });
} catch (e) {
  console.error("Cannot resolve tailwindcss CLI. Is tailwindcss installed in yd-ui?");
  throw e;
}

async function ensureDir(dir) {
  await fs.promises.mkdir(dir, { recursive: true });
}

async function autoprefix(filePath) {
  const css = await fs.promises.readFile(filePath, "utf8");
  const result = await postcss([autoprefixer]).process(css, { from: filePath, to: filePath });
  await fs.promises.writeFile(filePath, result.css, "utf8");
}

async function runTailwind({ input, output, config }) {
  const args = [twCliJs, "-i", input, "-o", output, "--minify"]; // production minify
  if (config) args.push("-c", config);
  // Use current Node to execute CLI JS
  await pExecFile(process.execPath, args, {
    cwd: root,
    env: { ...process.env, NODE_ENV: "production" },
  });
}

async function buildBase() {
  const input = path.join(root, "src/styles/base.css");
  const output = path.join(root, "dist/base.css");
  await runTailwind({ input, output, config: path.join(root, "tailwind.config.js") });
  await autoprefix(output);
}

async function buildAll() {
  const input = path.join(root, "src/styles/index.css");
  const output = path.join(root, "dist/yd-ui.css");
  await runTailwind({ input, output, config: path.join(root, "tailwind.config.js") });
  await autoprefix(output);
}

async function writeTempTailwindConfig(componentAbs, tempConfigPath) {
  const content = `const path = require('path');\n` +
    `const base = require(path.resolve(__dirname, '../../tailwind.config.js'));\n` +
    `module.exports = { ...base, content: [${JSON.stringify(componentAbs)}] };\n`;
  await fs.promises.writeFile(tempConfigPath, content, "utf8");
}

async function buildPerComponent() {
  const uiDir = path.join(root, "src/components/ui");
  const files = (await fs.promises.readdir(uiDir)).filter((f) => f.endsWith(".tsx"));
  const outDir = path.join(root, "dist/components");
  const tmpDir = path.join(root, "dist/.tw");
  await ensureDir(outDir);
  await ensureDir(tmpDir);
  try {
    for (const file of files) {
      const baseName = file.replace(/\.[^.]+$/, "");
      const componentAbs = path.join(uiDir, file);
      const tempConfigPath = path.join(tmpDir, `${baseName}.config.cjs`);
      await writeTempTailwindConfig(componentAbs, tempConfigPath);
      const input = path.join(root, "src/styles/per-component.css");
      const output = path.join(outDir, `${baseName}.css`);
      await runTailwind({ input, output, config: tempConfigPath });
      await autoprefix(output);
    }
  } finally {
    // Clean up temporary Tailwind configs
    await fs.promises.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}

async function main() {
  await ensureDir(path.join(root, "dist"));
  await buildBase();
  await buildAll();
  await buildPerComponent();
  console.log("Styles built: dist/base.css, dist/yd-ui.css, dist/components/*");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
