# @yd/transform-matrix3d

将 CSS `transform` 字符串转换为 `matrix3d(...)` 的工具库与命令行工具。

## 安装

工作区内直接构建/使用，无需单独安装；若单独使用：

```bash
pnpm add -D @yd/transform-matrix3d
```

CLI 全局链接（开发调试）：

```bash
cd packages/yd-transform-matrix3d
pnpm link -g
css2m3d --help
```

## CLI 使用

```bash
css2m3d [选项] <transform字符串>
echo "rotate(30deg) translate(10px, 20px)" | css2m3d

# 文件模式
css2m3d -i input.css            # 结果输出到 stdout
css2m3d -i input.css -w         # 直接写回 input.css

选项：
  -p, --precision <n>   小数位数(默认 6)
  -f, --format <fmt>    输出格式: css|array|json (默认 css)
  -i, --input <file>    输入 CSS 文件（将其中 transform 值替换为 matrix3d）
  -w, --write           写回原文件（默认输出到 stdout）
  -h, --help            显示帮助
```

示例：

```bash
css2m3d "translate(10px, 20px)"
# => matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,10,20,0,1)

css2m3d "rotate(90deg) translateX(10px)"
# => matrix3d(0,1,0,0,-1,0,0,0,0,0,1,0,0,10,0,1)

css2m3d -f array "skewX(45deg)"
# => 1,0,0,0,1,1,0,0,0,0,1,0,0,0,0,1
```

## 支持的 transform

- matrix(a,b,c,d,e,f)、matrix3d(16项)
- translate/translateX/translateY/translateZ/translate3d
- scale/scaleX/scaleY/scaleZ/scale3d
- rotate/rotateX/rotateY/rotateZ/rotate3d
- skew/skewX/skewY
- perspective
- 角度单位: deg(默认)/rad/grad/turn
- 长度单位: 仅支持 px

注意：

- 当前未支持 `transform-origin`，若需要可通过前后平移矩阵方式扩展。
- `%` 和相对长度单位需依赖布局上下文，暂未支持。

## 程序化使用

```ts
import { transformToMatrix3d } from '@yd/transform-matrix3d';

const { matrix, css } = transformToMatrix3d(
  'rotate(30deg) translate(10px)',
  { precision: 4 }
);

console.log(css); // matrix3d(...)
```

## 开发

```bash
pnpm -F @yd/transform-matrix3d build
```

若构建时出现 Node 类型提示，请确保安装了 `@types/node` 并在 `tsconfig.json` 的 `compilerOptions.types` 中包含 `node`。
