import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: [
    "../src/design-system/stories/**/*.mdx",
    "../src/design-system/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../src/components/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  addons: [
    "@chromatic-com/storybook",
    "@storybook/addon-docs",
    "@storybook/addon-onboarding",
    "@storybook/addon-a11y",
    "@storybook/addon-vitest",
    "@storybook/addon-themes",
    "@storybook/addon-essentials"
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {}
  },
  staticDirs: ['../public'],
};

export default config;