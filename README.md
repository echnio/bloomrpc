<p align="center">
  <img src="./resources/logo.svg" width="256" height="256"/>
</p>

<h1 align="center">BloomRPC</h1>

<p align="center">简洁的 gRPC 图形客户端 🌸</p>

## 维护版说明

BloomRPC 上游项目已于 2023 年 1 月归档。本仓库在此基础上维护 macOS
Apple Silicon（`arm64`）版本，使其可在 M 系列芯片的 Mac 上运行。

本维护版已移除已废弃的原生 `grpc` 依赖，改用纯 JavaScript 实现，因此不再
依赖与 Node/Electron 版本绑定的原生模块编译。

## 功能

- 导入并浏览 `.proto` 文件
- 调用 gRPC 与 gRPC-Web 服务
- 支持 Unary、服务端流、客户端流和双向流 RPC
- 管理请求元数据、TLS 证书和环境变量
- 保存请求标签页与调用历史

## 安装（Apple Silicon）

1. 下载发布产物 `BloomRPC-1.5.3-arm64.dmg`。
2. 打开 DMG，将 `BloomRPC.app` 拖到 `Applications` 文件夹。
3. 首次启动时，如 macOS 提示无法验证开发者，请在 Finder 中按住 Control
   点击应用，选择“打开”，再确认一次即可。

当前构建尚未签名和公证。这只会影响首次启动时的系统确认，不影响 `.proto`
导入和 gRPC 调用等功能。

### 常见问题

#### Spotlight 搜不到 BloomRPC

将应用拖入 `Applications` 后，Spotlight 的索引可能需要一点时间。可以在终端
执行以下命令重新导入应用元数据：

```bash
mdimport /Applications/BloomRPC.app
```

#### 导入本地 `.proto` 时被当成服务地址

本维护版会优先将以 `.proto` 结尾的绝对路径识别为本地文件，例如：

```text
/Users/your-name/project/protos/service.proto
```

请在导入窗口选择文件或填写实际存在的本地路径；不要将其他机器上的绝对路径
写入共享配置。

#### 启动后界面异常或保留了无效的旧配置

关闭应用后重新打开即可恢复默认标签页。若问题持续，可在应用内清理相关标签页
后重新导入 `.proto` 文件。

## 从源码构建

环境要求：macOS Apple Silicon、Node.js 20+、Yarn 1.x，以及系统自带的
`hdiutil`（用于生成 DMG）。

```bash
yarn install --frozen-lockfile
yarn test --runInBand
yarn package-mac-arm64
```

构建完成后，产物位于 `release/`：

- `BloomRPC-1.5.3-arm64.dmg`
- `BloomRPC-1.5.3-arm64-mac.zip`

打包过程先由 Electron Builder 生成 arm64 应用和 ZIP，再调用 macOS 自带的
`hdiutil` 生成包含 `Applications` 快捷方式的 DMG。这避免了旧版 Electron
Builder 的 DMG 工具对 Python 2 的依赖。

## 自动化构建

GitHub Actions 会在 `macos-14`（Apple Silicon）环境中执行安装、测试和
`yarn package-mac-arm64`，并上传 DMG 与 ZIP 作为构建产物。

## 已知限制与后续维护

- 应用未签名、未公证；正式公开分发前应配置 Apple Developer 签名和 notarization。
- 项目仍使用较旧的 Electron、React 和构建工具，后续应分阶段升级。
- 为兼容旧代码，renderer 当前拥有较宽松的 Electron 权限；不建议加载不可信内容。
- 某些旧依赖会在构建时输出兼容性警告，但不影响当前 arm64 构建和测试。

## 上游项目归档背景

BloomRPC 于 2018 年发布。当时可用的 gRPC 图形客户端较少；随着项目停止维护、
问题逐渐累积，上游维护者在 2023 年将其归档。本仓库仅维护 Apple Silicon
兼容性与基本可用性，不代表上游恢复维护。

如需评估其他 gRPC 工具，可参考
[awesome-grpc](https://github.com/grpc-ecosystem/awesome-grpc#tools)。

<img src="./resources/editor-preview.gif" />
