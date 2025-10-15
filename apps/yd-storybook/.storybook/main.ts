import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../stories/**/*.mdx", "../stories/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-docs",
    "@storybook/addon-onboarding",
    "@storybook/addon-themes"
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {}
  },
  docs: {
    autodocs: "tag"
  },
  viteFinal: async (config) => {
    const [{ fileURLToPath }, { resolve }] = await Promise.all([
      import("node:url"),
      import("node:path")
    ]);

    config.resolve ??= {};
    const alias = Array.isArray(config.resolve.alias)
      ? [...config.resolve.alias]
      : config.resolve.alias
        ? [config.resolve.alias]
        : [];

    const projectRoot = resolve(fileURLToPath(new URL("../../..", import.meta.url)));
    const uiEntry = resolve(projectRoot, "packages/yd-ui/src/index.ts");
    const uiSource = resolve(projectRoot, "packages/yd-ui/src");

    alias.push(
      { find: "@yd/ui", replacement: uiEntry },
      { find: "@yd/ui/*", replacement: `${uiSource}/*` }
    );

    config.resolve.alias = alias;
    return config;
  }
};

export default config;
