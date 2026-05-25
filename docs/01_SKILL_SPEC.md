# Skill 规范：HTML-to-PPTX Deck Generator

## 1. Skill 名称

HTML-to-PPTX Deck Generator

## 2. Skill 目标

本 skill 用于根据用户提供的 PPT 大纲、材料、模板和组件资源，生成可在浏览器中预览的 HTML 幻灯片，并通过 `dom-to-pptx` 导出为 PowerPoint 文件。

该 skill 不直接追求一次性自动生成完美 PPTX，而是追求：

- 模板可控
- 内容可审查
- HTML 可预览
- 排版可检测
- 导出可编辑 PPTX
- 方便人工微调

## 3. Skill 输入

### 3.1 必需输入

```text
outline.md
materials.md
theme.config.json
template.config.json
```

### 3.2 可选输入

```text
references.md
images/
svg/
template.pptx
template.pdf
component.registry.json
```

### 3.3 输入说明

`outline.md` 用于描述 PPT 主线、章节和页面要求，应包含汇报主题、目标听众、汇报时长、章节结构、必须覆盖的内容、不允许修改的章节标题、语言要求、风格要求。

`materials.md` 用于提供生成 PPT 的内容来源，可以包含文献摘要、项目介绍、算法说明、实验结果、表格数据、图片说明、引用材料。

`theme.config.json` 用于描述主题色、字体、页面尺寸等视觉规范。

`template.config.json` 用于描述模板页类型、占位符、固定区域和安全区域。

`component.registry.json` 用于描述组件库中可用的组件及其适用场景。

## 4. Skill 输出

### 4.1 必需输出

```text
deck.plan.md
deck.data.json
deck.html
visual-check-report.json
```

### 4.2 可选输出

```text
screenshots/
export-notes.md
output.pptx
```

## 5. 工作模式

本 skill 使用三阶段生成模式。

### 阶段一：规划确认

Codex 必须先生成 `deck.plan.md`，不得直接生成最终 HTML。

`deck.plan.md` 必须包含：

```text
1. 任务理解
2. 预计页数
3. 页面列表
4. 每页 slide type
5. 每页主要内容
6. 每页组件选择
7. 每页内容来源
8. 潜在风险
9. 需要用户确认的问题
```

页面列表格式：

```markdown
| 页码 | Slide Type | 标题 | 组件 | 内容来源 | 风险 |
|---|---|---|---|---|---|
| 1 | cover | xxx | none | outline.md | 低 |
| 2 | agenda | Contents | agenda-list | outline.md | 低 |
| 3 | section | Background | none | outline.md | 低 |
| 4 | content | Problem Definition | two-column | materials.md | 中 |
```

### 阶段二：结构化生成

用户确认后，Codex 生成 `deck.data.json`。

`deck.data.json` 必须只描述内容，不直接包含大量 CSS。

示例：

```json
{
  "deck": {
    "title": "Face Anti-Spoofing Literature Review",
    "subtitle": "Attacks, Defenses, and Open Challenges",
    "author": "Ma Zihao",
    "date": "2026-05-25",
    "language": "en"
  },
  "slides": [
    {
      "id": "slide-001",
      "type": "cover",
      "title": "Face Anti-Spoofing",
      "subtitle": "Attacks, Defenses, and Open Challenges"
    },
    {
      "id": "slide-002",
      "type": "agenda",
      "title": "Contents",
      "items": [
        "Why face recognition systems can be attacked",
        "Common presentation attack types",
        "How liveness detection defends against attacks",
        "Traditional and deep learning methods",
        "Current performance and remaining challenges"
      ]
    }
  ]
}
```

### 阶段三：渲染与检查

Codex 使用 renderer 将 `deck.data.json` 渲染为 `deck.html`。

渲染后必须运行检查脚本：

```bash
node scripts/check-overflow.js
node scripts/check-layout.js
node scripts/check-assets.js
```

生成：

```text
visual-check-report.json
```

如果检查失败，Codex 必须修复后重新检查。

## 6. Slide Type 规范

### 6.1 cover

用途：封面页。

允许字段：

```json
{
  "type": "cover",
  "title": "",
  "subtitle": "",
  "author": "",
  "date": ""
}
```

限制：不允许改动封面排版，只允许替换文本；标题和副标题均不得超过 2 行。

### 6.2 agenda

用途：目录页。

允许字段：

```json
{
  "type": "agenda",
  "title": "Contents",
  "items": []
}
```

限制：目录项建议 4 到 6 个；每个目录项不超过 14 个英文词；不允许添加复杂图表；列表样式由 CSS 控制。

### 6.3 section

用途：章节页。

允许字段：

```json
{
  "type": "section",
  "sectionNumber": "01",
  "title": "",
  "subtitle": ""
}
```

限制：不允许改动章节页布局；只允许替换章节编号、标题、副标题；章节标题不超过 12 个英文词。

### 6.4 content

用途：正文页。

允许字段：

```json
{
  "type": "content",
  "section": "",
  "title": "",
  "layout": "",
  "content": {},
  "references": []
}
```

限制：

- 必须选择一个 layout/component。
- 正文内容必须位于 `[data-safe-area]`。
- 不允许出现滚动区域。
- 不允许内容超出 safe area。
- 最小正文字号不得小于 24px。
- 参考文献字号不得小于 14px。
- 内容超载时必须拆页。

### 6.5 ending

用途：结束页。

允许字段：

```json
{
  "type": "ending",
  "title": "Thank You",
  "subtitle": "",
  "contact": ""
}
```

限制：不允许改动结尾页排版，只允许替换文本，可以添加一句总结性 closing message。

## 7. 组件选择规则

Codex 应优先使用已有组件，不应自由生成复杂排版。

优先级：

```text
1. 完全匹配的已有组件
2. 基本匹配的已有组件，略微调整内容
3. 组合两个简单组件
4. 新增一个局部 HTML 组件
5. 自由排版
```

只有在已有组件无法表达内容时，才允许自由排版。

## 8. 正文页内容容量规则

### 8.1 文本容量

```text
标题：最多 14 个英文词
副标题：最多 20 个英文词
正文 bullet：最多 5 条
每条 bullet：最多 18 个英文词
卡片标题：最多 8 个英文词
卡片正文：最多 45 个英文词
表格：最多 5 行 × 4 列
```

### 8.2 字号限制

```text
主标题：48px - 72px
正文标题：40px - 56px
正文：24px - 34px
表格正文：20px - 28px
脚注/参考文献：14px - 18px
```

### 8.3 超载处理

处理顺序：删除低优先级细节、改用更合适组件、拆成多页、放入附录页。

禁止缩小到不可读字号、压缩行距、让内容溢出、使用滚动条、让图片遮挡文字。

## 9. HTML 结构要求

每一页必须是：

```html
<section class="slide" data-slide-id="slide-001" data-slide-type="content">
  ...
</section>
```

正文页必须包含：

```html
<main class="slide-body" data-safe-area>
  ...
</main>
```

每页必须满足：

```css
.slide {
  width: 1920px;
  height: 1080px;
  position: relative;
  overflow: hidden;
}
```

## 10. 导出要求

导出目标是 `.pptx`。

导出脚本只选择 `.slide` 元素：

```js
const slides = Array.from(document.querySelectorAll('.slide'));
```

不要导出 `body`、`html`、`.deck`、`.preview-wrapper`。

导出选项建议：

```js
{
  fileName: 'output.pptx',
  layout: 'LAYOUT_16x9',
  svgAsVector: true,
  autoEmbedFonts: true
}
```

## 11. 检查要求

每次生成后必须检查：

```text
1. slide 数量是否正确
2. 每页尺寸是否正确
3. 每页 data-slide-type 是否存在
4. 正文页 safe area 是否存在
5. 是否存在 overflow
6. 是否存在空标题
7. 是否存在空列表项
8. 是否存在图片加载失败
9. 是否存在字体过小
10. 是否存在导出风险元素
```

导出风险元素包括 `video`、`iframe`、`canvas`、`foreignObject`、复杂滤镜、跨域图片、远程字体、动画元素。

## 12. Codex 行为约束

Codex 必须遵守：

```text
1. 不得跳过 deck.plan.md。
2. 不得在用户确认前生成最终 HTML。
3. 不得随意修改模板结构。
4. 不得随意修改主题色。
5. 不得让内容超出 safe area。
6. 不得使用滚动容器。
7. 不得把整页导出为截图。
8. 不得使用过小字号强行塞内容。
9. 不得删除用户指定的必备内容。
10. 不确定时必须在 deck.plan.md 中标记风险。
```

## 13. 最终生成报告

Codex 完成生成后，应输出：

```markdown
# 生成报告

## 1. 生成结果

- 总页数：
- 使用模板：
- 使用组件：
- 输出 HTML：
- 检查报告：

## 2. 检查结果

| 检查项 | 结果 | 说明 |
|---|---|---|
| Slide 数量 | 通过 |  |
| Safe area | 通过 |  |
| Overflow | 通过 |  |
| 字号 | 通过 |  |
| 图片加载 | 通过 |  |

## 3. 已知问题

- xxx

## 4. 建议人工检查

- xxx
```
