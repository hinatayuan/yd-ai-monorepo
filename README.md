# YD Monorepo

本仓库使用 pnpm 工作区管理多包结构，内置了轻量的 React/ReactDOM 实现，便于在受限网络环境下演示钱包相关的工具方法与 hooks。

## 目录说明

- `packages/react`、`packages/react-dom`：离线环境可用的极简 React 渲染与 DOM 绑定实现，兼容常用 hooks API 与 JSX 运行时。
- `packages/yd-libs`：公共工具库，目前包含钱包地址格式化等实用函数。
- `packages/yd-hooks`：基于 `useImmer` 状态管理封装的钱包交互 hooks，模拟连接、断开与链切换等流程。
- `apps/yd-app`：演示应用，使用上述包渲染钱包状态面板与交互控件。
- `scripts`：构建工作流与本地静态服务器脚本。

## 常用指令

> 由于运行环境无法访问 npm registry，本仓库的依赖均为工作区内自带实现，无需额外安装。

```bash
# 构建所有包（ESM + CJS + 类型声明）
npm run build:packages

# 构建演示应用静态资源
npm run build:app

# 一键构建全部内容
npm run build

# 启动本地静态服务器（默认端口 4173）
npm run dev
```

执行 `npm run dev` 会自动服务 `apps/yd-app/dist` 目录，可通过浏览器访问 `http://localhost:4173` 预览页面。
