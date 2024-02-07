const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const defaultResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === '@aztec/bb.js') {
    const path = require('path');
    const customPath = path.resolve(
      __dirname,
      'node_modules/@aztec/bb.js/dest/node-cjs/index.js'
    );
    return {
      filePath: customPath,
      type: 'sourceFile',
    };
  }

  return defaultResolveRequest(context, moduleName, platform);
};

module.exports = config;
