// Learn more https://docs.expo.io/guides/customizing-metro
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Fix for nanoid import resolution issues
config.resolver = {
  ...config.resolver,
  // Add support for cjs and mjs files
  assetExts: [...config.resolver.assetExts, 'cjs'],
  sourceExts: [...config.resolver.sourceExts, 'mjs', 'cjs'],
  // unstable_enablePackageExports: true,
  // Ensure proper resolution of modules
  resolverMainFields: ['react-native', 'browser', 'main', 'module'],
  alias: {
    ...(config.resolver.alias || {}),
    // Force nanoid/non-secure to use our shim for React Navigation
    'nanoid/non-secure': path.resolve(__dirname, 'polyfills/nanoid-non-secure.js'),
  },
};

// Configure transformer to handle ESM modules
config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

module.exports = config;