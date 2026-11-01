# 📖 dsh-leaf · Novel Player 小说播放器

*A translucent novel reader docked in the DeepSeek Harness Web UI.*
为 DeepSeek Harness Web UI 打造的半透明小说阅读器插件。

![version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![license](https://img.shields.io/badge/license-MIT-yellow.svg)
![deps](https://img.shields.io/badge/dependencies-zero-green.svg)
![platform](https://img.shields.io/badge/platform-DeepSeek%20Harness%20Web%20UI-lightgrey.svg)

---

## 简介 | Introduction

**dsh-leaf** 以常驻 Cordis 插件的形式挂载于 DeepSeek Harness 主屏，在 AI 工作台内提供完整的电子书阅读体验：导入、排版、分页、目录、续读与窗口管理，一站式完成。阅读器整体半透明、可与壁纸融为一体，工作时抬眼即读、低头即写。

dsh-leaf mounts into the DeepSeek Harness main panel as a persistent Cordis plugin, delivering a complete e-book reading experience inside the AI workbench: import, typography, pagination, table of contents, reading-position resume and window management — all in one place.

## 特性 | Features

- **阅读引擎 | Reading engine**
  - 拖拽或选择 `.txt` 即开即读；UTF-8 / GB18030 双编码自动探测
  - 章节标题自动识别（`第X章` / 序章 / 楔子 / Chapter N …），首行缩进、行距、段距自动排版
  - 真实分页引擎：按面板尺寸测量分页，超长段落自动断页续排
- **翻页交互 | Page flipping**
  - 左半屏 = 上一页，右半屏 = 下一页；支持键盘 `←` `→` `Space`
  - 章节目录跳转、当前章高亮；自动翻页三档（15s / 30s / 60s）
- **视觉系统 | Visuals**
  - 0–100% 背景透明度滑动条：`0%` 全透明、`>0%` 毛玻璃且模糊强度联动
  - 全量使用宿主主题 token（`--dsw-alias-*`），自动适配明暗主题
- **窗口行为 | Window behavior**
  - 任意拖拽定位、八向边框缩放、双击顶栏回默认停靠
  - 右侧边栏展开时自动收隐、收起时原位复原
  - 一键关闭；关闭后左侧栏底部出现重开入口
- **状态管理 | State**
  - IndexedDB 全书存储，最近书本列表秒重开
  - 每本书独立阅读进度，重启续读；字号 / 透明度 / 位置 / 尺寸全部持久化
- **性能设计 | Performance**
  - CSS containment 隔离测量重排，单次分页测量不触全文档回流
  - idle 时间预算后台分页 + 300 页前瞻窗口 + 熔断器自动降级
  - 7.5MB / 三万页全书：导入解析 ≈ 40ms，后台分页 ≤ 6ms/tick，全程无卡顿

## 性能 | Performance

| 指标 Metric | 实测 Measured |
| --- | --- |
| 7.5MB txt 解码 + 解析 Decode + parse | ≈ 40 ms（一次性 one-shot） |
| 后台预分页 Background pagination | ≤ 6 ms/tick，仅空闲时运行 idle-only |
| 翻页响应 Page flip | 即时 immediate（缓存命中 cache hit） |
| 三万页全书 30k-page book | 前瞻上限 300 页测量，工作量只随阅读进度增长 |

## 安装 | Installation

前置要求：已安装 DeepSeek Harness（Desktop 或 Web profile）。
Requires a DeepSeek Harness installation (Desktop or a Web profile).

```bash
git clone https://github.com/arkjack/dsh-leaf.git
```

在任意 Harness 会话中让 Agent 执行（或直接调用 `plugin_manager`）：
Ask your Harness agent to run (or invoke `plugin_manager` directly):

```
plugin_manager install_bundle target=<clone-path>/dsh-leaf
```

刷新 Web UI 页面即可看到主屏左侧的阅读器面板。
Refresh the Web UI page; the reader panel appears at the left of the main screen.

## 使用 | Usage

| 操作 Action | 方式 How |
| --- | --- |
| 打开小说 Open a book | 顶栏 `⌸` 或拖拽 txt 到面板 / top-bar button or drag & drop |
| 翻页 Flip pages | 点击阅读区左 / 右半屏，或 `←` `→` / click left or right half |
| 目录 Contents | 顶栏 `☰` |
| 字号 Font size | 顶栏 `A-` / `A+` |
| 自动翻页 Auto paging | 顶栏 `⏵` 循环 30s → 60s → 15s → 关 |
| 透明度 Opacity | 顶栏 `◐` 打开外观面板，拖动滑动条 |
| 移动 / 缩放 Move / resize | 拖拽顶栏移动；拉拽四边四角缩放；双击顶栏回停靠 |
| 关闭 / 重开 Close / reopen | 顶栏 `✕`；左侧栏底部 `📖 小说` |

## 架构 | Architecture

- 挂载点 Mount：`shell.overlay` 槽（root 作用域浮层），固定列停靠于主屏左侧
- 布局感知 Geometry sensing：无私有 API，通过观测 shell 列几何推断左栏锚点与右栏开合
- 分页引擎 Pagination：隐藏测量器（`contain: layout paint style`）+ 边界缓存 + 空闲预算循环 + 熔断器
- 客户端形态 Client form：纯 JavaScript + `React.createElement`，无构建步骤、无第三方依赖

## 仓库结构 | Repository layout

```
dsh-leaf/
├── package.json        # bundle manifest + dsh.client declaration
├── cordis.patch.yml    # Loader patch: inserts the plugin row
├── index.js            # Host half (no-op apply)
├── client.js           # Client half: the whole reader UI
├── icon.svg            # Plugin Manager icon
└── locale/
    ├── en.json         # English display + runtime strings
    └── zh.json         # Chinese display + runtime strings
```

## 开发 | Development

无构建步骤；修改 `client.js` 后刷新 Web UI 即可。语法自检：
No build step; refresh the Web UI after editing `client.js`. Syntax self-check:

```bash
node --check client.js
```

## 许可证 | License

[MIT](./LICENSE)
