import sharedConfig from "./index.js";
import pluginVue from "eslint-plugin-vue";

export default [
  ...sharedConfig,
  ...pluginVue.configs["flat/recommended"],
  {
    files: ["**/*.vue", "**/*.js"],
    languageOptions: {
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    rules: {
      "vue/multi-word-component-names": "off",
      "vue/html-indent": "off",
    },
  },
];
