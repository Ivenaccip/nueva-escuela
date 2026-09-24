// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    // dist/ es la compilación; _viejo/ es el proyecto anterior, archivado.
    ignores: ['dist/*', '_viejo/*'],
  },
]);
