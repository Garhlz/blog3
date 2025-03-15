// next.config.js
const webpack = require('webpack');

module.exports = {
  webpack: (config, { isServer }) => {
    // 排除二进制文件和HTML文件
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /\.(node|html)$/,
        contextRegExp: /node-pre-gyp|nodejieba/
      })
    );

    // 客户端构建排除Node.js模块
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'nodejieba': false,
        'sqlite3': false
      };
    }

    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ['nodejieba', 'sqlite3', '@mapbox/node-pre-gyp']
  }
};