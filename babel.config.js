module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Required for expo-router
      'expo-router/babel',
      // Add reanimated babel plugin
      'react-native-reanimated/plugin',
    ],
  };
}; 