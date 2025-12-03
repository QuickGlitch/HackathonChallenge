import vueConfig from '@store-hackathon/eslint-config/vue';

export default [
  ...vueConfig,
  {
    ignores: ['node_modules', 'dist'],
  },
];
