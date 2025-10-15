#!/usr/bin/env node
import { transformToMatrix3d } from './index';
import fs from 'node:fs/promises';
import path from 'node:path';

type Format = 'css' | 'array' | 'json';

async function processCssFile(filePath: string, precision: number, write: boolean) {
  const content = await fs.readFile(filePath, 'utf8');
  const re = /(^|[;{])(\s*)(-webkit-)?transform\s*:\s*([^;{}]+?)(\s*;)/gi;
  let replaced = 0;
  const out = content.replace(re, (match, p1, p2, p3, p4, p5) => {
    const value = String(p4).trim();
    try {
      const { css } = transformToMatrix3d(value, { precision });
      replaced++;
      const prefix = p3 || '';
      return `${p1}${p2}${prefix}transform: ${css}${p5}`;
    } catch {
      return match; // 保持原样
    }
  });

  if (write) {
    await fs.writeFile(filePath, out, 'utf8');
    console.log(`updated ${path.relative(process.cwd(), filePath)} (${replaced} transform)`);
  } else {
    process.stdout.write(out);
  }
}

function printHelp() {
  console.log(`
css2m3d

用法:
  css2m3d [选项] <transform字符串>
  echo "rotate(30deg) translate(10px, 20px)" | css2m3d

选项:
  -p, --precision <n>   小数位数(默认 6)
  -i, --input <file>    输入 CSS 文件（将其中 transform 值替换为 matrix3d）
  -w, --write           写回原文件（默认输出到 stdout）
  -f, --format <fmt>    输出格式: css|array|json (默认 css)
  -h, --help            显示帮助
`);
}

async function readStdin(): Promise<string> {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk: string) => (data += chunk));
    process.stdin.on('end', () => resolve(data.trim()));
  });
}

async function main() {
  const argv = process.argv.slice(2);
  let precision = 6;
  let format: Format = 'css';
  let inputFile: string | null = null;
  let writeBack = false;
  const rest: string[] = [];

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '-h' || a === '--help') {
      printHelp();
      return;
    } else if (a === '-p' || a === '--precision') {
      const v = argv[++i];
      if (!v) throw new Error('缺少 --precision 的参数');
      precision = Number(v);
      if (!Number.isFinite(precision) || precision < 0) throw new Error('precision 必须为非负数');
    } else if (a === '-f' || a === '--format') {
      const v = argv[++i];
      if (!v) throw new Error('缺少 --format 的参数');
      const vv = v.toLowerCase();
      if (vv !== 'css' && vv !== 'array' && vv !== 'json') throw new Error('format 仅支持 css|array|json');
      format = vv as Format;
    } else if (a === '-i' || a === '--input') {
      const v = argv[++i];
      if (!v) throw new Error('缺少 --input 的参数');
      inputFile = v;
    } else if (a === '-w' || a === '--write') {
      writeBack = true;
    } else {
      rest.push(a);
    }
  }

  if (inputFile) {
    const ext = path.extname(inputFile).toLowerCase();
    if (ext !== '.css') {
      throw new Error('当前仅支持处理 .css 文件');
    }
    await processCssFile(inputFile, precision, writeBack);
    return;
  }

  let input = rest.join(' ').trim();
  if (!input) {
    if (!process.stdin.isTTY) {
      input = await readStdin();
    }
  }

  if (!input) {
    printHelp();
    process.exitCode = 1;
    return;
  }

  try {
    const { matrix, css } = transformToMatrix3d(input, { precision });
    switch (format) {
      case 'css':
        console.log(css);
        break;
      case 'array':
        console.log(matrix.map(n => {
          const v = Number(n.toFixed(precision));
          return Object.is(v, -0) ? 0 : v;
        }).join(','));
        break;
      case 'json':
        console.log(JSON.stringify(matrix.map(n => {
          const v = Number(n.toFixed(precision));
          return Object.is(v, -0) ? 0 : v;
        })));
        break;
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`错误: ${msg}`);
    process.exitCode = 1;
  }
}

main();
