module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Add this plugin to handle lucide-react-native and nanoid
      ['module-resolver', {
        alias: {
          'lucide-react-native': 'lucide-react-native',
          'nanoid/non-secure': './polyfills/nanoid-non-secure',
        },
      }],
      'react-native-reanimated/plugin', // Should be last
    ],
  };
};