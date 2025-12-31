# AiBal 官方插件仓库

这是 [AiBal](https://github.com/DDG0808/aibal) 的官方插件仓库。

## 插件列表

| 插件 | 版本 | 描述 |
|------|------|------|
| [Antigravity 配额](plugins/antigravity) | 1.0.0 | 查询 Google Cloud Code 各模型的配额使用情况和重置时间 |
| [88Code 订阅余额](plugins/88code-balance) | 1.0.7 | 查询 88Code 订阅套餐的额度使用情况、剩余天数和重置状态 |
| [Right.codes 订阅](plugins/right-code) | 1.0.2 | 查询 Right.codes 订阅套餐的配额和过期时间 |
| [智谱 AI 余额](plugins/zhipu-balance) | 1.0.4 | 查询智谱 AI (BigModel) API 余额和配额使用情况 |

## 安装插件

### 方式一：通过 Marketplace（推荐）

在 AiBal 应用内打开 Marketplace，搜索并安装插件。

### 方式二：手动安装

1. 下载插件目录
2. 复制到 `~/.config/aibal/plugins/`
3. 在应用中启用插件

## 开发插件

想要开发自己的插件？请参考 [插件开发指南](https://github.com/DDG0808/aibal/blob/master/docs/Plugin-Development.md)。

## 贡献插件

欢迎提交 PR 贡献你的插件！

### 提交规范

1. 在 `plugins/` 目录下创建插件文件夹
2. 必须包含 `manifest.json` 和入口文件
3. 提供清晰的插件描述
4. 确保代码质量和安全性

## License

[MIT](LICENSE)
