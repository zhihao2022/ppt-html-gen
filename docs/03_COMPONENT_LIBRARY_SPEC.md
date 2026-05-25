# 组件库与素材规范

## 1. 目标

组件库用于为正文页提供稳定、可复用、可检查的内容排版结构。

Codex 在生成正文页时，应优先选择组件库中的组件，而不是每次自由生成排版。

组件库目标：

- 降低排版失控概率
- 限制文本容量
- 提高视觉一致性
- 提高 DOM-to-PPTX 导出稳定性
- 方便后续扩展模板风格

## 2. 组件目录结构

每个组件一个独立目录：

```text
components/
├── two-column-text/
│   ├── component.html
│   ├── component.css
│   ├── schema.json
│   └── preview.png
├── three-cards/
│   ├── component.html
│   ├── component.css
│   ├── schema.json
│   └── preview.png
└── comparison-table/
    ├── component.html
    ├── component.css
    ├── schema.json
    └── preview.png
```

## 3. 组件命名规范

组件名称使用 kebab-case：

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

禁止使用 `组件1`、`漂亮版式`、`new-style`、`test-component`、`final-final`。

## 4. 组件分类

### 4.1 文本类组件

```text
two-column-text
three-bullets
quote-highlight
problem-solution
key-takeaways
```

适合概念解释、问题分析、总结性页面。

### 4.2 卡片类组件

```text
three-cards
four-cards
paper-card-list
method-card-list
```

适合方法分类、文献总结、攻击类型、模块介绍。

### 4.3 表格类组件

```text
comparison-table
metric-table
dataset-table
method-comparison
```

适合指标对比、方法对比、数据集对比、实验结果展示。

### 4.4 流程类组件

```text
pipeline-flow
step-process
timeline
architecture-flow
```

适合算法流程、系统结构、研究路线、任务执行链路。

### 4.5 图文类组件

```text
image-text
image-caption
figure-analysis
screenshot-annotation
```

适合论文框架图、实验结果图、系统截图、示意图。

## 5. component.html 规范

组件 HTML 不应包含完整 slide，只包含 safe area 内部结构。

错误：

```html
<section class="slide">
  ...
</section>
```

正确：

```html
<div class="component component-two-column-text">
  <div class="panel">
    <h2>{{leftTitle}}</h2>
    <p>{{leftBody}}</p>
  </div>
  <div class="panel">
    <h2>{{rightTitle}}</h2>
    <p>{{rightBody}}</p>
  </div>
</div>
```

## 6. component.css 规范

组件 CSS 必须作用域化。

推荐：

```css
.component-two-column-text {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 36px;
  height: 100%;
}

.component-two-column-text .panel {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 28px;
  padding: 40px;
}

.component-two-column-text h2 {
  font-size: 38px;
  line-height: 1.2;
  color: var(--color-primary);
  margin: 0 0 24px;
}

.component-two-column-text p {
  font-size: 28px;
  line-height: 1.45;
  color: var(--color-text);
  margin: 0;
}
```

禁止写全局选择器，例如 `h1 { ... }`、`p { ... }`、`.card { ... }`，避免污染全局样式。

## 7. schema.json 规范

每个组件必须有 `schema.json`。

示例：

```json
{
  "name": "two-column-text",
  "displayName": "Two Column Text",
  "category": "text",
  "description": "用于展示两个并列概念、方法或观点。",
  "suitableFor": [
    "two concepts comparison",
    "problem and solution",
    "method A vs method B"
  ],
  "fields": {
    "leftTitle": {
      "type": "string",
      "required": true,
      "maxWords": 8
    },
    "leftBody": {
      "type": "string",
      "required": true,
      "maxWords": 55
    },
    "rightTitle": {
      "type": "string",
      "required": true,
      "maxWords": 8
    },
    "rightBody": {
      "type": "string",
      "required": true,
      "maxWords": 55
    }
  },
  "layoutLimits": {
    "minFontSize": 24,
    "maxPanels": 2,
    "allowImages": false,
    "allowTables": false,
    "allowNestedComponents": false
  },
  "exportRisk": "low"
}
```

## 8. component.registry.json 规范

所有组件需要登记到：

```text
configs/component.registry.json
```

示例：

```json
{
  "components": [
    {
      "name": "two-column-text",
      "path": "components/two-column-text",
      "category": "text",
      "description": "两个并列文本块。",
      "bestFor": ["comparison", "parallel explanation", "problem-solution"],
      "maxContentDensity": "medium",
      "exportRisk": "low"
    },
    {
      "name": "three-cards",
      "path": "components/three-cards",
      "category": "card",
      "description": "三个卡片并列展示。",
      "bestFor": ["taxonomy", "three methods", "three examples"],
      "maxContentDensity": "medium",
      "exportRisk": "low"
    },
    {
      "name": "pipeline-flow",
      "path": "components/pipeline-flow",
      "category": "flow",
      "description": "横向流程图。",
      "bestFor": ["algorithm pipeline", "system workflow"],
      "maxContentDensity": "low",
      "exportRisk": "medium"
    }
  ]
}
```

## 9. 推荐首批组件

### 9.1 two-column-text

用途：两个概念并列、两个方法对比、问题与解决方案、传统方法与深度学习方法。

字段：

```json
{
  "leftTitle": "",
  "leftBody": "",
  "rightTitle": "",
  "rightBody": ""
}
```

限制：每侧标题最多 8 个英文词，每侧正文最多 55 个英文词。

### 9.2 three-cards

用途：三类方法、三种攻击、三个贡献点、三个挑战。

字段：

```json
{
  "cards": [
    {
      "title": "",
      "body": "",
      "icon": ""
    }
  ]
}
```

限制：卡片数量固定为 3；每个标题最多 8 个英文词；每个正文最多 40 个英文词；icon 可选。

### 9.3 comparison-table

用途：方法对比、数据集对比、指标对比、优缺点对比。

字段：

```json
{
  "columns": [],
  "rows": []
}
```

限制：最多 5 行 × 4 列；单元格内容不超过 18 个英文词；不允许复杂嵌套。

### 9.4 pipeline-flow

用途：算法流程、系统流程、任务执行链、数据处理流程。

字段：

```json
{
  "steps": [
    {
      "title": "",
      "description": ""
    }
  ]
}
```

限制：步骤数量 3 到 6 个；每个步骤标题最多 6 个英文词；每个描述最多 20 个英文词。

### 9.5 image-text

用途：论文图解释、系统截图解释、实验结果解释。

字段：

```json
{
  "image": "",
  "imageCaption": "",
  "title": "",
  "body": "",
  "bullets": []
}
```

限制：图片必须本地路径；bullet 最多 4 条；每条 bullet 最多 16 个英文词。

### 9.6 paper-card-list

用途：文献综述、方法演进、相关工作总结。

字段：

```json
{
  "papers": [
    {
      "title": "",
      "venue": "",
      "year": "",
      "contribution": ""
    }
  ]
}
```

限制：每页最多 4 篇论文；每篇 contribution 最多 28 个英文词。

## 10. 素材规范

素材目录：

```text
assets/
├── images/
├── svg/
├── icons/
├── backgrounds/
└── references/
```

### 10.1 图片规范

推荐格式：`png`、`jpg`、`webp`。

要求：

```text
1. 尽量使用本地图片。
2. 不使用跨域远程图片。
3. 图片文件名使用英文和数字。
4. 图片命名要体现内容。
5. 图片尺寸不要过小。
```

推荐命名：

```text
face-attack-taxonomy.png
method-pipeline.png
dataset-comparison.png
robot-task-flow.png
```

不推荐：

```text
截图1.png
图片.png
final_final.png
微信图片_2026.png
```

### 10.2 SVG 规范

SVG 可以用于 icon、装饰元素、流程箭头、简单图形、背景纹理。

要求：尽量使用简单 SVG；不使用复杂 filter；不使用外部引用图片；不使用 `foreignObject`；不使用脚本。

### 10.3 PPT 截图素材规范

如果组件来自好看的 PPT 截图，处理流程：

```text
1. 将截图放入 assets/references/
2. 给截图命名
3. 写明截图中的版式意图
4. 不直接把截图作为组件使用
5. 用 HTML/CSS 复刻其布局思想
```

示例：

```text
assets/references/three-card-dark-blue-reference.png
```

对应说明：

```markdown
# three-card-dark-blue-reference

用途：
- 三个并列概念
- 深蓝背景
- 卡片式布局
- 顶部有小图标
- 每个卡片包含标题和 2-3 行解释

复刻要求：
- 不直接使用截图
- 用 HTML/CSS 重建卡片
- 主题色替换为当前 theme 变量
```

## 11. 组件选择策略

Codex 选择组件时应遵守：

```text
1. 先判断页面信息结构。
2. 再选择最接近组件。
3. 再压缩文本以适应组件容量。
4. 如果无法适配，则拆页。
5. 不允许为了塞内容破坏组件结构。
```

常见映射：

```text
两个并列观点          → two-column-text
三种方法/攻击/挑战    → three-cards
四种方法              → four-cards 或拆成两页
方法性能对比          → comparison-table
算法步骤              → pipeline-flow
文献综述              → paper-card-list
图 + 解释             → image-text
```

## 12. 组件验收清单

```text
[ ] 有 component.html
[ ] 有 component.css
[ ] 有 schema.json
[ ] 有 preview.png
[ ] CSS 已作用域化
[ ] 使用 theme 变量
[ ] 不污染全局样式
[ ] 字段限制明确
[ ] 文本容量明确
[ ] safe area 内显示正常
[ ] 导出为 PPTX 后基本可接受
[ ] 无复杂导出风险元素
```

## 13. Codex 新增组件流程

当 Codex 判断现有组件不足时，可以新增组件，但必须：

```text
1. 说明为什么现有组件不够用。
2. 给出新组件名称。
3. 给出适用场景。
4. 编写 component.html。
5. 编写 component.css。
6. 编写 schema.json。
7. 更新 component.registry.json。
8. 生成 preview.png 或截图。
9. 运行检查脚本。
```

新增组件后，Codex 必须在生成报告中说明新增组件名称、原因、使用页面和风险。

## 14. 导出风险等级

### low

纯文本、简单卡片、简单表格、简单形状、本地图片。

### medium

SVG、复杂流程图、圆角图片、阴影较多、多层嵌套。

### high

`canvas`、`iframe`、`video`、复杂 CSS filter、`foreignObject` SVG、跨域图片、动画。

高风险组件不应默认使用，除非用户明确需要。
