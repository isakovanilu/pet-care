// Metro config for web-only build
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Aggressively reduce file watching - only watch src directory
config.watchFolders = [
  path.resolve(__dirname, 'src'),
];

// Block ALL node_modules from being watched
config.resolver.blockList = [
  /.*\/node_modules\/.*/,
];

// Only watch source files
config.resolver.platforms = ['web'];

// Force polling instead of file watching to avoid EMFILE errors
config.watcher = {
  additionalExts: ['js', 'jsx', 'ts', 'tsx', 'json'],
  healthCheck: {
    enabled: false,
  },
  // Force polling mode
  usePolling: true,
  interval: 1000,
};

// Disable unnecessary features
config.transformer = {
  ...config.transformer,
  minifierPath: undefined,
};

module.exports = config;

