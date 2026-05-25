# PPT HTML Gen

面向 Codex 的 HTML 幻灯片生成工具。它用结构化 JSON、固定 HTML 模板和可复用组件生成可在浏览器中预览的幻灯片，并在导出 PPTX 前运行自动检查。

这个仓库同时是一个可安装/引用的 Codex Skill：根目录的 [SKILL.md](./SKILL.md) 定义了 `$ppt-html-gen` 的工作流和约束。

## 适合什么场景

- 根据大纲和材料生成汇报 PPT 的 HTML 预览稿。
- 把 PPTX/PDF 模板转成稳定的 HTML/CSS 模板资产。
- 用可复用组件生成正文页，而不是每次自由排版。
- 在导出 PPTX 前检查尺寸、溢出、资源和导出风险。
- 配合 `dom-to-pptx` / 油猴脚本导出尽量可编辑的 PPTX。

## 不是什么

- 不是网页展示框架。每页 slide 固定为 `1920px × 1080px`，HTML 在这里是 PPT 画布。
- 不是“一键生成完美 PPTX”的工具。推荐流程是先生成 HTML，浏览器检查后再导出 PPTX。
- 不鼓励整页截图式导出。默认目标是保留文本、表格、图片等 DOM 元素的可编辑性。

## 快速开始

```bash
npm.cmd install
npm.cmd run sync:vendor
npm.cmd run render
npm.cmd run check
npm.cmd run serve
```

打开本地预览：

```text
http://127.0.0.1:4173/
```

Windows PowerShell 如果拦截 `npm.ps1` / `npx.ps1`，请使用 `npm.cmd` / `npx.cmd`。

## 作为 Codex Skill 使用

这个仓库根目录就是 skill 目录。Codex 读取 [SKILL.md](./SKILL.md) 后，会按以下顺序工作：

1. 读取 `configs/template.registry.json`、当前模板配置和 `configs/component.registry.json`。
2. 读取输入材料，例如 `decks/input/outline.md`、`decks/input/materials.md`。
3. 先生成或更新 `decks/generated/deck.plan.md`，等待用户确认。
4. 用户确认后生成 `decks/generated/deck.data.json`。
5. 执行渲染、检查和截图命令。
6. 输出 `deck.html`、检查报告和人工检查建议。

显式调用示例：

```text
使用 $ppt-html-gen，根据 decks/input/outline.md 和 decks/input/materials.md 生成一份 HTML PPT 预览，并运行完整检查。
```

## 核心工作流

```text
outline.md / materials.md / template source
        ↓
decks/generated/deck.plan.md
        ↓ 用户确认
decks/generated/deck.data.json
        ↓
npm.cmd run render
        ↓
decks/generated/deck.html
        ↓
npm.cmd run check
        ↓
browser preview / screenshots
        ↓
userscript + dom-to-pptx export
```

## 常用命令

| 命令 | 作用 |
|---|---|
| `npm.cmd run render` | 根据 `deck.data.json` 生成 `deck.html` |
| `npm.cmd run sync:vendor` | 同步 `dom-to-pptx` 浏览器 bundle 到 `vendor/` |
| `npm.cmd run check` | 运行完整检查 |
| `npm.cmd run check:template` | 检查模板合同 |
| `npm.cmd run check:overflow` | 检查 safe area 溢出 |
| `npm.cmd run check:layout` | 检查 slide 结构、尺寸和基础字段 |
| `npm.cmd run check:assets` | 检查图片、资源和导出风险元素 |
| `npm.cmd run check:export` | 检查 PPTX 导出就绪状态 |
| `npm.cmd run screenshots` | 生成逐页截图 |
| `npm.cmd run component-previews` | 生成组件预览图 |
| `npm.cmd run serve` | 启动本地预览服务 |

完整检查报告输出到：

```text
decks/generated/visual-check-report.json
```

合格状态应为：

```text
summary.status = pass
failed = 0
warnings = 0
```

## 目录结构

```text
.
├── SKILL.md                         # Codex skill 入口
├── AGENTS.md                        # 仓库内 Agent 协作约束
├── agents/openai.yaml               # skill UI 元数据
├── configs/                         # 模板、主题、组件、导出配置
├── templates/<template-id>/          # 每个模板一个子目录
├── templates/<template-id>/source/   # 该模板的 PPTX/PDF/SVG/截图源文件归档
├── components/                      # 可复用正文组件
├── styles/                          # 全局 CSS
├── scripts/                         # 渲染、检查、截图、预览脚本
├── userscript/                      # DOM-to-PPTX 导出辅助脚本
├── decks/input/                     # 输入大纲和材料
├── decks/generated/                 # 生成的 HTML、JSON、报告和截图
├── decks/exports/                   # PPTX 导出目标目录
├── docs/                            # 设计和实现文档
└── references/                      # skill 按需读取的参考说明
```

## 数据合同

主输入文件：

```text
decks/generated/deck.data.json
```

基本结构：

```json
{
  "deck": {
    "title": "Deck title",
    "subtitle": "Deck subtitle",
    "author": "Author",
    "date": "2026-05-25",
    "language": "zh-CN"
  },
  "slides": []
}
```

支持的 slide type：

```text
cover
agenda
section
content
ending
```

正文页示例：

```json
{
  "id": "slide-004",
  "type": "content",
  "section": "Workflow",
  "title": "Renderer 只负责组合稳定资产",
  "layout": "two-column-text",
  "content": {
    "leftTitle": "输入数据",
    "leftBody": "deck.data.json 描述页面结构和内容。",
    "rightTitle": "HTML 输出",
    "rightBody": "render-deck.js 将模板、组件和数据组合成固定尺寸 slide。"
  },
  "references": []
}
```

## 组件库

内置组件：

```text
two-column-text
three-cards
comparison-table
pipeline-flow
image-text
```

每个组件目录包含：

```text
component.html
component.css
schema.json
preview.png
```

新增组件后需要更新：

```text
configs/component.registry.json
```

并运行：

```bash
npm.cmd run component-previews
npm.cmd run check
```

## 模板接入

用户提供的模板源文件放到对应模板目录：

```text
templates/<template-id>/source/
```

推荐命名：

```text
template.pptx
template.pdf
page-01-cover.png
page-02-agenda.png
page-03-section.png
page-04-content.png
page-05-ending.png
```

模板注册和配置：

```text
configs/template.registry.json
configs/template.config.json
configs/theme.registry.json
templates/<template-id>/template.config.json
templates/<template-id>/theme.config.json
templates/<template-id>/source/template.source.json
templates/<template-id>/template.mapping.json
templates/<template-id>/template.analysis.md
```

当前已注册模板：

```text
minimal-academic-blue
bit-template
```

模板接入原则：

- 固定视觉元素写入模板和 CSS。
- 可替换内容通过 `deck.data.json` 填充。
- 正文页必须定义 `[data-safe-area]`。
- 不用缩小到不可读字号、滚动区域或溢出来解决内容超载。
- 如果模板有锁定槽位，例如固定 5 槽目录页，槽位数量不匹配时应重规划页面，而不是硬塞。

## 导出 PPTX

导出前先运行：

```bash
npm.cmd run check:export
```

本项目会把 `dom-to-pptx` 的浏览器 bundle 同步到：

```text
vendor/dom-to-pptx/dom-to-pptx.bundle.js
```

`templates/<template-id>/base.html` 会自动加载这个本地脚本，因此重新运行 `npm.cmd run render` 后，生成的 `deck.html` 页面应提供：

```js
window.domToPptx.exportToPptx
```

油猴脚本：

```text
userscript/export-html-to-pptx.user.js
```

该脚本只导出：

```js
Array.from(document.querySelectorAll(".slide"))
```

页面需要提供以下任一导出函数：

```js
window.domToPptx.exportToPptx
window.domToPptx.export
window.exportToPptx
```

推荐导出选项记录在：

```text
configs/export.config.json
```

## 当前状态

已实现：

- HTML deck 渲染闭环
- 模板合同检查
- 组件库和组件预览
- overflow / layout / assets / export-readiness 检查
- 本地预览服务
- 本地 `dom-to-pptx` bundle 接入
- 油猴导出辅助脚本
- Codex Skill 元数据和引用文档

待继续增强：

- 从 PPTX/PDF 自动提取模板截图和结构
- 更丰富的组件库
- 更严格的文本容量和 schema 校验

## 许可证

暂未声明许可证。公开使用前请按项目需要补充 `LICENSE`。
