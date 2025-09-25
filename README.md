# YD Monorepo

基于 pnpm 工作区构建的钱包演示项目，包含以下三个工作空间：

- `@yd/libs`：提供格式化钱包地址、验证十六进制地址等纯函数工具，使用 Rollup + TypeScript 输出 ESM/CJS 以及类型声明。
- `@yd/hooks`：封装 `useImmer` 风格的状态更新与模拟钱包连接/断开/切链流程的 `useWallet` Hook，依赖 `@yd/libs`。
- `yd-app`：Vite + React 演示应用，演示如何在组件中消费上述工具函数与 Hook。

## 快速开始

> 当前执行环境无法访问 npm registry，首次运行请在支持外网的机器上执行 `pnpm install` 并将生成的 `node_modules` 复制到此环境；或者使用私有镜像源。

```bash
# 安装依赖
pnpm install

# 构建两个库包（Rollup）
pnpm build:packages

# 构建 React 演示应用
pnpm build:app

# 或者一次性构建所有工作空间
pnpm build

# 运行演示应用（默认 http://localhost:5173）
pnpm dev
```

构建后，可在 `packages/*/dist` 查看打包产物，在 `apps/yd-app` 目录中进行页面开发调试。
