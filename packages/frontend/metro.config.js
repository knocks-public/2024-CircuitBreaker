const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

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

  const Resolver = require('metro-resolver');
  return Resolver.resolve(context, moduleName, platform);
};

module.exports = config;
