import sharedConfig from '@store-hackathon/eslint-config';

export default [
  ...sharedConfig,
  {
    ignores: ['node_modules'],
  },
];
