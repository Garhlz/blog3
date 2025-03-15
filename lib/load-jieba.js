// lib/load-jieba.js
const path = require("path");
const fs = require("fs");

function loadJiebaWasm() {
  try {
    // Next.js 服务端打包后的 WASM 文件路径
    const wasmServerPath = path.join(process.cwd(), ".next/server/wasm", "jieba_rs_wasm_bg.wasm");
    const isDev = process.env.NODE_ENV === "development";

    // 检查打包后的 WASM 文件是否存在
    if (fs.existsSync(wasmServerPath)) {
      console.log("找到打包后的 WASM 文件:", wasmServerPath);
    } else {
      console.warn("打包后的 WASM 文件不存在:", wasmServerPath);
      if (isDev) {
        const wasmOriginalPath = path.join(
          path.dirname(require.resolve("jieba-wasm")),
          "jieba_rs_wasm_bg.wasm"
        );
        if (fs.existsSync(wasmOriginalPath)) {
          console.log("找到原始 WASM 文件:", wasmOriginalPath);
        } else {
          throw new Error(`无法找到 WASM 文件: ${wasmOriginalPath}`);
        }
      } else {
        throw new Error(`无法找到打包后的 WASM 文件: ${wasmServerPath}`);
      }
    }

    // 在加载 jieba-wasm 前，临时修改 fs.readFileSync 的行为
    const originalReadFileSync = fs.readFileSync;
    fs.readFileSync = function (filePath, options) {
      if (filePath.endsWith("jieba_rs_wasm_bg.wasm")) {
        console.log("重定向 WASM 文件路径:", wasmServerPath);
        return originalReadFileSync(wasmServerPath, options);
      }
      return originalReadFileSync(filePath, options);
    };

    // 加载 jieba-wasm 模块
    const jieba = require("jieba-wasm");
    console.log("jieba-wasm 模块加载成功");

    // 恢复原始 fs.readFileSync
    fs.readFileSync = originalReadFileSync;

    return jieba;
  } catch (error) {
    console.error("加载 jieba-wasm 失败:", {
      message: error.message,
      stack: error.stack,
    });
    throw new Error("无法初始化 jieba-wasm，请检查依赖安装和 WASM 文件路径");
  }
}

module.exports = loadJiebaWasm();