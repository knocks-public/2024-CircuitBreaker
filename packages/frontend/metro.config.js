const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // @aztec/bb.js のカスタムリゾルバ
  if (moduleName === '@aztec/bb.js') {
    const customPath = path.resolve(
      __dirname,
      'node_modules/@aztec/bb.js/dest/node-cjs/index.js'
    );
    return {
      filePath: customPath,
      type: 'sourceFile',
    };
  }

  // @noir-lang/noirc_abi モジュールからの `util` の要求を react-native-util にリダイレクト
  if (
    context.originModulePath.includes('@noir-lang/noirc_abi') &&
    moduleName === 'util'
  ) {
    const utilPath = path.resolve(
      __dirname,
      'node_modules/react-native-util/index.js'
    );
    return {
      filePath: utilPath,
      type: 'sourceFile',
    };
  }

  const Resolver = require('metro-resolver');
  return Resolver.resolve(context, moduleName, platform);
};

module.exports = config;
