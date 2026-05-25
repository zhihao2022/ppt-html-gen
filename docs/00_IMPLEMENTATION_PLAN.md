# HTML-to-PPTX Skill 实现规划

## 0. 项目目标

本项目目标是实现一套基于 HTML/CSS 的半自动 PPT 生成流程：

1. 用户提供 PPT 大纲、材料、模板和组件资源。
2. Codex 根据文档规范生成结构化 PPT 数据和 HTML 幻灯片。
3. 用户在浏览器中手动检查 HTML 页面。
4. 通过油猴脚本调用 `dom-to-pptx` 将 HTML DOM 导出为 `.pptx`。
5. 导出的 PPTX 应尽量保持可编辑性，而不是整页截图。

核心原则：

- 模板负责视觉风格和固定版式。
- 组件库负责常见内容块的稳定排版。
- Codex 负责内容组织、页面规划、模板选择、组件选择和必要的局部 HTML 生成。
- 浏览器负责真实渲染和视觉检查。
- `dom-to-pptx` 负责 DOM 到 PPTX 的导出。

## 1. 总体工作流

```text
输入材料
  ├── PPT 大纲 outline.md
  ├── 参考材料 materials.md / PDF / 文献摘录
  ├── 模板 PPTX / 模板 PDF
  ├── 主题配置 theme.config.json
  ├── 组件 SVG / 图片 / PPT 截图
  ↓

Codex 阶段 1：理解任务并生成确认单
  ├── 确认总页数
  ├── 确认章节结构
  ├── 确认每页 slide type
  ├── 确认使用哪些模板和组件
  ├── 标记可能超载页面
  ↓

用户确认
  ↓

Codex 阶段 2：生成 deck.data.json
  ├── 每页标题
  ├── 每页类型
  ├── 每页布局
  ├── 每页内容
  ├── 每页组件选择
  ├── 每页参考文献
  ↓

Codex 阶段 3：渲染 deck.html
  ├── 使用固定模板
  ├── 使用组件库
  ├── 应用主题 CSS
  ├── 生成完整 HTML
  ↓

Codex 阶段 4：自动检查
  ├── DOM overflow 检查
  ├── safe area 检查
  ├── 字号检查
  ├── 图片尺寸检查
  ├── 页码检查
  ├── 视觉截图检查
  ↓

用户浏览器检查 HTML
  ↓

油猴脚本导出 PPTX
  ↓

人工在 PowerPoint 中微调
```

## 2. 推荐项目目录结构

```text
html-pptx-skill/
├── SKILL.md
├── README.md
├── docs/
│   ├── 00_IMPLEMENTATION_PLAN.md
│   ├── 01_SKILL_SPEC.md
│   ├── 02_TEMPLATE_SPEC.md
│   ├── 03_COMPONENT_LIBRARY_SPEC.md
│   ├── 04_EXPORT_SPEC.md
│   └── 05_VISUAL_CHECK_SPEC.md
├── configs/
│   ├── theme.config.json
│   ├── template.config.json
│   ├── export.config.json
│   └── component.registry.json
├── templates/
│   ├── base.html
│   ├── cover.html
│   ├── agenda.html
│   ├── section.html
│   ├── content.html
│   ├── ending.html
│   └── template.preview.pdf
├── styles/
│   ├── theme.css
│   ├── layout.css
│   ├── components.css
│   ├── typography.css
│   └── export-safe.css
├── components/
│   ├── two-column/
│   │   ├── component.html
│   │   ├── component.css
│   │   ├── schema.json
│   │   └── preview.png
│   └── pipeline-flow/
│       ├── component.html
│       ├── component.css
│       ├── schema.json
│       └── preview.png
├── assets/
│   ├── images/
│   ├── svg/
│   ├── icons/
│   ├── backgrounds/
│   └── references/
├── scripts/
│   ├── render-deck.js
│   ├── check-overflow.js
│   ├── check-layout.js
│   ├── check-assets.js
│   ├── make-screenshots.js
│   └── serve.js
├── userscript/
│   └── export-html-to-pptx.user.js
└── decks/
    ├── input/
    │   ├── outline.md
    │   ├── materials.md
    │   └── references.md
    ├── generated/
    │   ├── deck.plan.md
    │   ├── deck.data.json
    │   ├── deck.html
    │   ├── visual-check-report.json
    │   └── screenshots/
    └── exports/
        └── output.pptx
```

## 3. 第一阶段：搭建最小闭环

目标：先做出一个能跑通的版本，不追求智能排版。

### 3.1 需要完成的文件

```text
templates/<template-id>/base.html
templates/<template-id>/cover.html
templates/<template-id>/agenda.html
templates/<template-id>/section.html
templates/<template-id>/content.html
templates/<template-id>/ending.html

styles/theme.css
styles/layout.css
styles/components.css
styles/export-safe.css

configs/theme.config.json
configs/template.config.json

scripts/render-deck.js
scripts/check-overflow.js
userscript/export-html-to-pptx.user.js
```

### 3.2 最小输入

```text
decks/input/outline.md
decks/input/materials.md
```

### 3.3 最小输出

```text
decks/generated/deck.plan.md
decks/generated/deck.data.json
decks/generated/deck.html
decks/generated/visual-check-report.json
```

### 3.4 第一阶段验收标准

- 浏览器能打开 `deck.html`。
- 页面中每一页都是 `.slide`。
- 每页尺寸为 `1920px × 1080px`。
- 每页都有 `data-slide-type`。
- 正文页都有 `[data-safe-area]`。
- `check-overflow.js` 能检查是否有内容超出 safe area。
- 油猴脚本能导出 `.pptx`。
- 至少完成封面页、目录页、章节页、正文页、结尾页。

## 4. 第二阶段：模板接入

目标：把用户提供的 PPTX / PDF 模板转成 HTML 模板。

### 4.1 输入

```text
templates/<template-id>/source/template.pptx
templates/<template-id>/source/template.pdf
```

### 4.2 Codex 需要完成

1. 阅读 PDF 页面或 PPTX 截图。
2. 分析页面类型：`cover`、`agenda`、`section`、`content`、`ending`。
3. 提取背景色、标题位置、副标题位置、页眉页脚、装饰元素、图形块、正文区域。
4. 用 HTML/CSS 复刻模板。
5. 将可替换文本做成占位符。
6. 将固定装饰元素写死在模板里。
7. 将可变内容区域标记为 `[data-safe-area]`。

### 4.3 模板验收标准

- HTML 页面视觉上接近原 PDF/PPTX。
- 色彩、字体风格、标题层级、安全区域、页眉页脚保持稳定。
- 模板中的固定元素不应被 Codex 每次生成时随意修改。
- 模板中的动态内容必须通过数据填充。

## 5. 第三阶段：组件库接入

目标：把常用 PPT 版式和素材封装成可复用组件。

优先制作以下组件：

```text
two-column-text
three-cards
comparison-table
timeline
pipeline-flow
paper-card-list
image-text
problem-solution
method-result
taxonomy-grid
quote-highlight
metric-table
```

每个组件必须有：

```text
component.html
component.css
schema.json
preview.png
```

`schema.json` 必须说明组件名称、适用场景、输入字段、字段长度限制、最小字号、最大文本量、是否允许图片、是否允许表格、是否允许嵌套组件、导出风险等级。

## 6. 第四阶段：Codex 生成流程固化

### 6.1 生成确认单

Codex 首先生成：

```text
deck.plan.md
```

内容包括汇报主题、预计页数、章节划分、每页标题、每页 slide type、每页使用的组件、每页内容来源、可能超载的页面、需要用户确认的问题。

在用户确认前，不允许进入 HTML 生成。

### 6.2 生成结构化数据

用户确认后，生成：

```text
deck.data.json
```

该文件只描述内容和页面结构，不直接写复杂 CSS。

### 6.3 渲染 HTML

运行：

```bash
node scripts/render-deck.js
```

生成：

```text
decks/generated/deck.html
```

### 6.4 自动检查

运行：

```bash
node scripts/check-overflow.js
node scripts/check-layout.js
node scripts/check-assets.js
```

生成：

```text
decks/generated/visual-check-report.json
```

如果发现问题，Codex 必须先修复 `deck.data.json` 或组件内容，而不是直接通过缩小字号硬塞。

## 7. 第五阶段：浏览器导出

### 7.1 手动检查

用户打开：

```text
decks/generated/deck.html
```

检查页面是否缺内容、是否有明显遮挡、图片是否错位、文字是否过密、模板风格是否统一、是否需要拆页。

### 7.2 油猴导出

油猴脚本调用：

```js
domToPptx.exportToPptx(Array.from(document.querySelectorAll('.slide')), {
  fileName: 'output.pptx',
  layout: 'LAYOUT_16x9',
  svgAsVector: true,
  autoEmbedFonts: true
});
```

## 8. 关键设计原则

### 8.1 不要让 Codex 每次自由重写模板

模板是稳定资产。Codex 只应该替换文本、填充列表、选择组件、填充组件数据、必要时新增局部组件。

Codex 不应该随意改封面排版、目录页布局、章节页结构、全局主题色、页面尺寸。

### 8.2 内容超载时必须拆页

禁止通过缩小到不可读字号、压缩行距、挤到页脚、溢出 safe area、滚动区域解决超载。

正确做法是拆成两页、改用更合适的组件、删除低优先级内容、把细节放入备注或附录页。

### 8.3 HTML 是 PPT 画布，不是网页文档

所有 slide 必须固定尺寸：

```css
.slide {
  width: 1920px;
  height: 1080px;
  position: relative;
  overflow: hidden;
}
```

禁止正文页依赖网页滚动。

## 9. 推荐 Codex 执行顺序

```text
Step 1. 阅读 docs/01_SKILL_SPEC.md
Step 2. 阅读 docs/02_TEMPLATE_SPEC.md
Step 3. 阅读 docs/03_COMPONENT_LIBRARY_SPEC.md
Step 4. 检查 templates/ 和 components/ 是否完整
Step 5. 读取用户输入 outline.md 和 materials.md
Step 6. 生成 deck.plan.md
Step 7. 等待用户确认
Step 8. 生成 deck.data.json
Step 9. 渲染 deck.html
Step 10. 运行检查脚本
Step 11. 根据检查报告修复
Step 12. 输出最终生成报告
```

## 10. 最终交付物

每次生成 PPT 后，Codex 应交付：

```text
decks/generated/deck.plan.md
decks/generated/deck.data.json
decks/generated/deck.html
decks/generated/visual-check-report.json
decks/generated/screenshots/
```

可选：

```text
decks/exports/output.pptx
```

如果导出由用户通过油猴脚本手动完成，则 Codex 不需要直接生成 PPTX。
