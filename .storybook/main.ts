import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';
import { resolve } from 'path';
import viteConfig from '../vite.config';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx|mdx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-interactions'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  async viteFinal(config) {
    return mergeConfig(config, {
      resolve: {
        alias: {
          ...(viteConfig.resolve?.alias ?? {}),
          '@': resolve(__dirname, '../src'),
        },
      },
      // Library CSS modules need the same handling as the main build.
      css: {
        modules: {
          generateScopedName: '[name]__[local]',
        },
      },
    });
  },
};

export default config;
