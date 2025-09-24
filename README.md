# YD AI Monorepo

This repository is a pnpm workspace that hosts a couple of reusable packages and a React playground for manual testing.

## Packages

- `@yd/libs` – shared TypeScript utilities. Currently includes helpers such as `formatWalletAddress` for shortening MetaMask style addresses.
- `@yd/hooks` – React hooks composed with Immer state helpers. The `useWallet` hook wraps simple MetaMask style connect/disconnect flows while using the utilities from `@yd/libs`.

## Apps

- `yd-app` – a Vite based React/TypeScript application that demonstrates how to consume the shared library and hooks packages.

## Getting started

```bash
pnpm install
pnpm -r build
pnpm --filter yd-app dev
```

The React playground listens on port `5173` by default.
