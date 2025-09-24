# YD AI Monorepo

This repository is organised as a pnpm workspace with two reusable TypeScript packages and a React playground
application. The shared code is bundled with Rollup, while the app is built with Vite so that hooks and utilities can
be exercised in a browser quickly.

## Workspace structure

- `@yd/libs` – general utilities such as `formatWalletAddress` for presenting MetaMask style addresses.
- `@yd/hooks` – React hooks that compose the helpers from `@yd/libs` with state management from `use-immer`.
- `yd-app` – a Vite based React application used to try the shared packages interactively.

## Install dependencies

```bash
pnpm install
```

## Available scripts

From the repository root you can run:

```bash
pnpm dev             # start the Vite dev server for the React playground
pnpm build:packages  # bundle the shared libraries with Rollup
pnpm build:app       # type-check and build the React playground
pnpm build           # run all build steps (packages + app)
```

The packages use Rollup with the official TypeScript plugin. During development the Vite config aliases `@yd/libs` and
`@yd/hooks` to their source folders so that live edits are reflected in the playground without rebuilding the packages.
