import type { Preview } from '@storybook/react-vite'
import '../src/index.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'dark',
      values: [
        {
          name: 'dark',
          value: '#111827',
        },
        {
          name: 'darker',
          value: '#030712',
        },
      ],
    },
    docs: {
      theme: {
        base: 'dark',
      },
    },
  },
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Global theme for components',
      defaultValue: 'dark',
      toolbar: {
        icon: 'paintbrush',
        items: ['dark'],
        showName: true,
      },
    },
  },
};

export default preview;