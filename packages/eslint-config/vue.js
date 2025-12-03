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
      // Disable all Vue formatting rules - let Prettier handle formatting
      "vue/html-indent": "off",
      "vue/max-attributes-per-line": "off",
      "vue/first-attribute-linebreak": "off",
      "vue/html-closing-bracket-newline": "off",
      "vue/html-closing-bracket-spacing": "off",
      "vue/html-self-closing": "off",
      "vue/multiline-html-element-content-newline": "off",
      "vue/singleline-html-element-content-newline": "off",
    },
  },
];
