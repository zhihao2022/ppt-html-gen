# 模板制作与接入规范

## 1. 目标

本文件规定如何将用户提供的 PPTX / PDF 模板转化为 HTML/CSS 模板，并供 HTML-to-PPTX Skill 使用。

模板的目标不是生成任意网页，而是生成固定尺寸、可导出为 PPTX 的 HTML 幻灯片。

## 2. 模板页类型

当前模板系统固定包含 5 类页面：

```text
cover     封面页
agenda    目录页
section   章节页
content   正文页
ending    结尾页
```

这 5 类页面不是最终 PPT 的 5 页，而是 5 种可复用 slide type。实际 PPT 可以包含多个 `section` 和多个 `content` 页面。

## 3. 模板输入资源

模板制作时可以使用以下输入：

```text
template.pptx
template.pdf
template screenshots
font files
background images
logo images
decorative SVG
color palette
```

建议将模板源文件放在：

```text
templates/source/
```

示例：

```text
templates/source/academic-blue-template.pptx
templates/source/academic-blue-template.pdf
templates/source/page-01-cover.png
templates/source/page-02-agenda.png
templates/source/page-03-section.png
templates/source/page-04-content.png
templates/source/page-05-ending.png
```

## 4. 模板分析流程

Codex 接入模板时，必须按以下步骤执行。

### Step 1：识别页面类型

从 PPTX/PDF 中识别哪一页是封面页、目录页、章节页、正文页、结尾页。

如果模板里有多个正文页样式，应命名为：

```text
content-default
content-two-column
content-image-left
content-comparison
content-table
```

最小版本必须包含 `content-default`。

### Step 2：提取视觉元素

每页模板需要提取：

```text
1. 页面背景色
2. 主标题位置
3. 副标题位置
4. 页眉区域
5. 页脚区域
6. 页码位置
7. logo 位置
8. 装饰图形位置
9. 内容安全区域
10. 参考文献区域
```

### Step 3：区分固定元素和可替换元素

固定元素包括背景、装饰线条、色块、logo、页脚样式、页码样式、章节编号样式。

可替换元素包括 PPT 标题、副标题、作者、日期、目录列表、章节标题、正文页标题、正文页内容、参考文献、结束语。

### Step 4：定义 safe area

正文页必须定义可变内容安全区域：

```html
<main class="slide-body" data-safe-area>
  {{content}}
</main>
```

safe area 是 Codex 生成正文内容的唯一合法区域。除页标题、页脚、参考文献外，正文内容不得超出 safe area。

## 5. 页面尺寸规范

所有模板默认使用 16:9：

```css
.slide {
  width: 1920px;
  height: 1080px;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
}
```

不建议使用响应式尺寸。禁止使用 `width: 100vw` 和 `height: 100vh` 作为 slide 尺寸，因为导出时需要稳定坐标，不能依赖浏览器窗口尺寸。

## 6. 模板 HTML 规范

### 6.1 base.html

`base.html` 是完整 HTML 的外壳。

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <title>{{deckTitle}}</title>
  <link rel="stylesheet" href="../styles/theme.css" />
  <link rel="stylesheet" href="../styles/layout.css" />
  <link rel="stylesheet" href="../styles/typography.css" />
  <link rel="stylesheet" href="../styles/components.css" />
  <link rel="stylesheet" href="../styles/export-safe.css" />
</head>
<body>
  <div class="deck">
    {{slides}}
  </div>
</body>
</html>
```

### 6.2 cover.html

```html
<section class="slide slide-cover" data-slide-type="cover" data-slide-id="{{slideId}}">
  <div class="cover-bg"></div>
  <div class="cover-content">
    <h1 class="cover-title">{{title}}</h1>
    <p class="cover-subtitle">{{subtitle}}</p>
  </div>
  <div class="cover-meta">
    <span>{{author}}</span>
    <span>{{date}}</span>
  </div>
</section>
```

要求：只允许替换文本；不允许动态插入正文组件；标题和副标题最多 2 行。

### 6.3 agenda.html

```html
<section class="slide slide-agenda" data-slide-type="agenda" data-slide-id="{{slideId}}">
  <header class="slide-header">
    <h1 class="slide-title">{{title}}</h1>
  </header>
  <main class="agenda-body">
    <ol class="agenda-list">
      {{items}}
    </ol>
  </main>
  <footer class="slide-footer">
    <span>{{deckTitle}}</span>
    <span>{{pageNumber}}</span>
  </footer>
</section>
```

目录项示例：

```html
<li>
  <span class="agenda-index">01</span>
  <span class="agenda-text">Research Background</span>
</li>
```

要求：目录项建议 4 到 6 个；目录页不放复杂图；列表样式由 CSS 控制。

### 6.4 section.html

```html
<section class="slide slide-section" data-slide-type="section" data-slide-id="{{slideId}}">
  <div class="section-index">{{sectionNumber}}</div>
  <div class="section-content">
    <h1 class="section-title">{{title}}</h1>
    <p class="section-subtitle">{{subtitle}}</p>
  </div>
  <footer class="slide-footer">
    <span>{{deckTitle}}</span>
    <span>{{pageNumber}}</span>
  </footer>
</section>
```

要求：章节页只替换文字；不允许插入正文组件；章节标题应短。

### 6.5 content.html

```html
<section class="slide slide-content" data-slide-type="content" data-slide-id="{{slideId}}">
  <header class="slide-header">
    <div class="slide-kicker">{{section}}</div>
    <h1 class="slide-title">{{title}}</h1>
  </header>
  <main class="slide-body" data-safe-area>
    {{content}}
  </main>
  <div class="slide-references">
    {{references}}
  </div>
  <footer class="slide-footer">
    <span>{{deckTitle}}</span>
    <span>{{pageNumber}}</span>
  </footer>
</section>
```

要求：正文内容必须在 `slide-body` 内；`slide-body` 必须带 `data-safe-area`；references 区域固定在底部；正文内容不得覆盖 references 和 footer。

### 6.6 ending.html

```html
<section class="slide slide-ending" data-slide-type="ending" data-slide-id="{{slideId}}">
  <div class="ending-content">
    <h1 class="ending-title">{{title}}</h1>
    <p class="ending-subtitle">{{subtitle}}</p>
  </div>
  <div class="ending-contact">
    {{contact}}
  </div>
</section>
```

要求：只允许替换文本；不允许插入复杂组件；结尾页视觉应简洁。

## 7. template.config.json 规范

示例：

```json
{
  "templateName": "academic-blue",
  "version": "1.0.0",
  "slideSize": {
    "width": 1920,
    "height": 1080,
    "aspectRatio": "16:9"
  },
  "slideTypes": {
    "cover": {
      "file": "templates/cover.html",
      "editableFields": ["title", "subtitle", "author", "date"],
      "fixedLayout": true
    },
    "agenda": {
      "file": "templates/agenda.html",
      "editableFields": ["title", "items"],
      "fixedLayout": true,
      "maxItems": 6
    },
    "section": {
      "file": "templates/section.html",
      "editableFields": ["sectionNumber", "title", "subtitle"],
      "fixedLayout": true
    },
    "content": {
      "file": "templates/content.html",
      "editableFields": ["section", "title", "content", "references"],
      "fixedLayout": false,
      "safeArea": {
        "x": 96,
        "y": 210,
        "width": 1728,
        "height": 760
      }
    },
    "ending": {
      "file": "templates/ending.html",
      "editableFields": ["title", "subtitle", "contact"],
      "fixedLayout": true
    }
  }
}
```

## 8. theme.config.json 规范

示例：

```json
{
  "themeName": "academic-blue",
  "colors": {
    "background": "#F8FAFC",
    "surface": "#FFFFFF",
    "primary": "#005082",
    "secondary": "#00A6A6",
    "accent": "#F59E0B",
    "textPrimary": "#0F172A",
    "textSecondary": "#475569",
    "muted": "#94A3B8",
    "border": "#CBD5E1"
  },
  "fonts": {
    "title": "Inter",
    "body": "Inter",
    "fallback": "Microsoft YaHei, Arial, sans-serif"
  },
  "typography": {
    "coverTitle": 84,
    "slideTitle": 54,
    "sectionTitle": 72,
    "body": 28,
    "caption": 18,
    "reference": 14
  },
  "spacing": {
    "slidePaddingX": 96,
    "slidePaddingY": 72,
    "contentGap": 32
  }
}
```

## 9. theme.css 规范

主题 CSS 必须使用 CSS 变量：

```css
:root {
  --color-bg: #F8FAFC;
  --color-surface: #FFFFFF;
  --color-primary: #005082;
  --color-secondary: #00A6A6;
  --color-accent: #F59E0B;
  --color-text: #0F172A;
  --color-text-secondary: #475569;
  --color-muted: #94A3B8;
  --color-border: #CBD5E1;
  --font-title: "Inter", "Microsoft YaHei", Arial, sans-serif;
  --font-body: "Inter", "Microsoft YaHei", Arial, sans-serif;
  --slide-w: 1920px;
  --slide-h: 1080px;
  --slide-pad-x: 96px;
  --slide-pad-y: 72px;
}
```

禁止在组件中硬编码主题色。组件必须使用变量。

## 10. export-safe.css 规范

为了提高 DOM-to-PPTX 导出稳定性，应避免复杂 CSS。

推荐：

```css
* {
  box-sizing: border-box;
}

.slide {
  transform: none;
  filter: none;
}

img {
  max-width: 100%;
  display: block;
}

svg {
  display: block;
}
```

谨慎使用 `filter`、`backdrop-filter`、`mix-blend-mode`、`clip-path`、`mask`、复杂 `transform`、`position: sticky`、`video`、`iframe`。

## 11. 模板验收清单

```text
[ ] 5 类页面均存在
[ ] 每页尺寸为 1920 × 1080
[ ] 每页 class 包含 slide
[ ] 每页 data-slide-type 正确
[ ] 正文页包含 data-safe-area
[ ] 封面页只替换文本即可
[ ] 目录页列表样式稳定
[ ] 章节页只替换文本即可
[ ] 正文页标题和内容区域分离
[ ] 结尾页只替换文本即可
[ ] 全局主题色变量化
[ ] 不依赖浏览器窗口大小
[ ] 不依赖滚动
[ ] 无跨域图片
[ ] 字体 fallback 合理
```
