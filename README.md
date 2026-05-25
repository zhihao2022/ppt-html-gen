# PPT HTML Gen

`ppt-html-gen` 是一个基于 HTML/CSS 的半自动 PPT 生成工程。它把 PPT 生成拆成四层：

1. `deck.data.json`：结构化页面内容。
2. `templates/`：固定幻灯片模板。
3. `components/`：可复用正文组件。
4. `scripts/`：渲染、检查、截图和导出就绪验证。

生成结果是可在浏览器中预览的 `deck.html`，并可通过油猴脚本配合 `dom-to-pptx` 导出为尽量可编辑的 `.pptx`。

## 环境要求

- Node.js `>= 18`
- npm
- Windows / PowerShell 环境推荐使用 `npm.cmd`

如果 PowerShell 拦截 `npm.ps1` 或 `npx.ps1`，请使用：

```bash
npm.cmd run check
npx.cmd ...
```

## 快速开始

安装依赖：

```bash
npm.cmd install
```

渲染示例 deck：

```bash
npm.cmd run render
```

运行完整检查：

```bash
npm.cmd run check
```

启动本地预览：

```bash
npm.cmd run serve
```

打开：

```text
http://127.0.0.1:4173/
```

## 常用命令

```bash
npm.cmd run check:syntax          # 检查脚本语法
npm.cmd run render                # 由 deck.data.json 生成 deck.html
npm.cmd run check:template        # 检查模板合同
npm.cmd run check:overflow        # 检查 safe area 溢出
npm.cmd run check:layout          # 检查 slide 结构和尺寸
npm.cmd run check:assets          # 检查图片和导出风险元素
npm.cmd run check:export          # 检查 PPTX 导出就绪状态
npm.cmd run check                 # 运行完整检查
npm.cmd run screenshots           # 生成逐页截图
npm.cmd run component-previews    # 生成组件预览图
npm.cmd run serve                 # 启动预览服务
```

## 目录结构

```text
.
├── SKILL.md                         # Codex skill 入口说明
├── agents/openai.yaml               # skill UI 元数据
├── configs/                         # 主题、模板、组件、导出配置
├── templates/                       # HTML 幻灯片模板
├── components/                      # 可复用正文组件
├── styles/                          # 全局主题、布局、组件样式
├── scripts/                         # 渲染、检查、截图和预览服务脚本
├── userscript/                      # 油猴导出辅助脚本
├── decks/input/                     # 用户输入材料
├── decks/generated/                 # 生成结果
├── decks/exports/                   # PPTX 导出目录
├── docs/                            # 工程规划和规范文档
└── references/                      # skill 运行参考文档
```

## 生成流程

正式生成 deck 时推荐按以下流程执行：

1. 在 `decks/input/outline.md` 写 PPT 大纲。
2. 在 `decks/input/materials.md` 写参考材料。
3. 先生成或维护 `decks/generated/deck.plan.md`，确认页数、章节、slide type、组件选择和风险。
4. 用户确认后，生成 `decks/generated/deck.data.json`。
5. 执行 `npm.cmd run render` 生成 `decks/generated/deck.html`。
6. 执行 `npm.cmd run check`。
7. 如检查失败，优先修改 `deck.data.json`、组件内容或模板/组件 CSS。
8. 执行 `npm.cmd run screenshots` 做浏览器视觉检查。
9. 用 `userscript/export-html-to-pptx.user.js` 配合页面中的 `dom-to-pptx` 导出 PPTX。

## deck.data.json

示例位置：

```text
decks/generated/deck.data.json
```

顶层结构：

```json
{
  "deck": {
    "title": "",
    "subtitle": "",
    "author": "",
    "date": "",
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

正文页必须选择一个 `layout`，例如：

```json
{
  "id": "slide-004",
  "type": "content",
  "section": "Component Library",
  "title": "Two Column Text",
  "layout": "two-column-text",
  "content": {
    "leftTitle": "Template",
    "leftBody": "Fixed visual frame.",
    "rightTitle": "Component",
    "rightBody": "Reusable content layout."
  },
  "references": []
}
```

## 组件库

当前内置组件：

```text
two-column-text
three-cards
comparison-table
pipeline-flow
image-text
```

每个组件必须包含：

```text
components/<name>/component.html
components/<name>/component.css
components/<name>/schema.json
components/<name>/preview.png
```

新增组件后，需要更新：

```text
configs/component.registry.json
```

并运行：

```bash
npm.cmd run component-previews
npm.cmd run check
```

## 模板接入

模板源文件放在：

```text
templates/source/
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

模板接入时需要维护：

```text
configs/template.config.json
templates/source/template.source.json
templates/template.mapping.json
templates/template.analysis.md
```

检查模板合同：

```bash
npm.cmd run check:template
```

模板规则：

- 不要随意修改固定模板结构。
- 不要随意修改主题色和字体。
- 正文内容只能进入 `[data-safe-area]`。
- 内容超载时拆页或换组件，不要缩小到不可读字号。

## 导出 PPTX

导出配置：

```text
configs/export.config.json
```

油猴脚本：

```text
userscript/export-html-to-pptx.user.js
```

导出前运行：

```bash
npm.cmd run check:export
```

油猴脚本只导出：

```js
Array.from(document.querySelectorAll(".slide"))
```

页面需要提供以下任一导出函数：

```js
window.domToPptx.exportToPptx
window.domToPptx.export
window.exportToPptx
```

推荐导出选项：

```js
{
  fileName: "output.pptx",
  layout: "LAYOUT_16x9",
  svgAsVector: true,
  autoEmbedFonts: true
}
```

## 检查报告

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

当前完整检查包含：

```text
template
overflow
layout
assets
export-readiness
```

## 设计原则

- HTML 是 PPT 画布，不是普通网页文档。
- 每页固定为 `1920px × 1080px`。
- 模板负责视觉风格和固定版式。
- 组件负责正文内容块的稳定排版。
- Codex 或脚本只填充数据、选择组件、生成必要内容。
- 不把整页导出为截图，除非用户明确接受不可编辑输出。
- 不用滚动区域解决内容超载。

## GitHub 发布

本仓库可直接推送到 GitHub。若尚未配置远程仓库，可用：

```bash
gh repo create ppt-html-gen --public --source . --remote origin --push
```

后续推送：

```bash
git push
```
