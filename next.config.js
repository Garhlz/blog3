/** @type {import('next').NextConfig} */
const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const nextConfig = {
  webpack(config, { isServer, webpack }) {
    // 将 .wasm 文件作为静态资源打包
    config.module.rules.push({
      test: /\.wasm$/,
      type: "asset/resource",
      generator: {
        filename: "static/wasm/[name][ext]", // 输出到 .next/static/wasm/
      },
    });

    // 为服务端添加插件，手动复制 WASM 文件
    if (isServer) {
      config.plugins.push(
        new CopyWebpackPlugin({
          patterns: [
            {
              from: require.resolve("jieba-wasm").replace(/jieba_rs_wasm\.js$/, "jieba_rs_wasm_bg.wasm"),
              to: path.join(process.cwd(), ".next/server/wasm/jieba_rs_wasm_bg.wasm"),
            },
          ],
        })
      );

      // 重定向 jieba-wasm 的路径解析
      config.resolve.alias["jieba-wasm"] = require.resolve("jieba-wasm");
    }

    // 支持 sqlite3 外部依赖
    config.externals.push(({ context, request }, callback) => {
      if (/^sqlite3$/.test(request)) {
        return callback(null, `commonjs ${request}`);
      }
      callback();
    });

    return config;
  },
};

module.exports = nextConfig;