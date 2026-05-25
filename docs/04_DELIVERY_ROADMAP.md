# 后续实现落地流程

## 1. 落地顺序

建议按最小闭环优先，而不是一开始追求模板智能化。

```text
Phase 0：项目骨架
  ├── 初始化目录结构
  ├── 建立 package.json
  ├── 固定 slide 尺寸、主题变量和基础模板
  └── 建立示例输入与示例 deck.data.json

Phase 1：HTML 渲染闭环
  ├── 实现 render-deck.js
  ├── 支持 cover / agenda / section / content / ending
  ├── 输出 decks/generated/deck.html
  └── 本地浏览器可打开预览

Phase 2：自动检查闭环
  ├── 实现 check-overflow.js
  ├── 实现 check-layout.js
  ├── 实现 check-assets.js
  ├── 生成 visual-check-report.json
  └── 对失败项给出可修复定位

Phase 3：首批组件库
  ├── two-column-text
  ├── three-cards
  ├── comparison-table
  ├── pipeline-flow
  ├── image-text
  └── component.registry.json

Phase 4：油猴导出
  ├── 接入 dom-to-pptx
  ├── 只导出 .slide
  ├── 验证文本、图片、SVG 的可编辑性
  └── 记录导出限制和人工检查项

Phase 5：模板接入
  ├── 接收用户 PPTX / PDF / 截图
  ├── 抽取 5 类 slide type
  ├── 复刻为 HTML/CSS 模板
  ├── 固化 template.config.json
  └── 通过视觉截图检查

Phase 6：Codex skill 固化
  ├── 编写 SKILL.md
  ├── 固化 deck.plan.md 先行规则
  ├── 固化用户确认点
  ├── 固化生成报告格式
  └── 用样例 deck 回归验证
```

## 2. 第一轮实现任务清单

第一轮只做能跑通的基础工程：

```text
[ ] 创建 package.json
[ ] 创建 configs/theme.config.json
[ ] 创建 configs/template.config.json
[ ] 创建 templates/base.html
[ ] 创建 templates/cover.html
[ ] 创建 templates/agenda.html
[ ] 创建 templates/section.html
[ ] 创建 templates/content.html
[ ] 创建 templates/ending.html
[ ] 创建 styles/theme.css
[ ] 创建 styles/layout.css
[ ] 创建 styles/typography.css
[ ] 创建 styles/components.css
[ ] 创建 styles/export-safe.css
[ ] 创建 decks/input/outline.md
[ ] 创建 decks/input/materials.md
[ ] 创建 decks/generated/deck.data.json 示例
[ ] 实现 scripts/render-deck.js
[ ] 实现 scripts/check-overflow.js
[ ] 创建 userscript/export-html-to-pptx.user.js 初版
```

验收命令：

```bash
node scripts/render-deck.js
node scripts/check-overflow.js
```

验收结果：

```text
decks/generated/deck.html
decks/generated/visual-check-report.json
```

## 3. 第二轮实现任务清单

第二轮补齐工程稳定性：

```text
[ ] 实现 check-layout.js
[ ] 实现 check-assets.js
[ ] 实现 make-screenshots.js
[ ] 实现 scripts/serve.js
[ ] 加入 Playwright 或浏览器截图检查
[ ] 检查 slide 数量、尺寸、safe area、空标题、空列表项
[ ] 检查图片加载失败、字体过小、导出风险元素
[ ] 输出统一的 visual-check-report.json
```

验收命令：

```bash
node scripts/render-deck.js
node scripts/check-overflow.js
node scripts/check-layout.js
node scripts/check-assets.js
node scripts/make-screenshots.js
```

## 4. 第三轮实现任务清单

第三轮开始建设组件库：

```text
[ ] 创建 components/two-column-text
[ ] 创建 components/three-cards
[ ] 创建 components/comparison-table
[ ] 创建 components/pipeline-flow
[ ] 创建 components/image-text
[ ] 为每个组件编写 component.html
[ ] 为每个组件编写 component.css
[ ] 为每个组件编写 schema.json
[ ] 更新 configs/component.registry.json
[ ] 渲染每个组件的 preview.png 或截图
```

组件验收：

```text
[ ] CSS 已作用域化
[ ] 使用 theme 变量
[ ] 不污染全局样式
[ ] 字段限制明确
[ ] 文本容量明确
[ ] safe area 内显示正常
[ ] 无高风险导出元素
```

## 5. 第四轮实现任务清单

第四轮处理模板接入：

```text
[ ] 建立 templates/source/
[ ] 支持模板源文件归档
[ ] 提供模板截图命名规范
[ ] 根据 5 类 slide type 建立模板映射
[ ] 完善 template.config.json
[ ] 将固定视觉元素和可替换内容分离
[ ] 明确每类 content 模板的 safe area
```

模板验收：

```text
[ ] 5 类页面均存在
[ ] 每页尺寸为 1920 × 1080
[ ] 每页 data-slide-type 正确
[ ] 正文页包含 data-safe-area
[ ] 全局主题色变量化
[ ] 不依赖浏览器窗口大小
[ ] 不依赖滚动
```

## 6. 第五轮实现任务清单

第五轮把流程封装为 Codex skill：

```text
[ ] 创建 SKILL.md
[ ] 写明输入目录和输出目录
[ ] 写明必须先生成 deck.plan.md
[ ] 写明用户确认前不得生成最终 HTML
[ ] 写明 deck.data.json schema
[ ] 写明渲染和检查命令
[ ] 写明修复策略：优先拆页或换组件，不允许硬塞
[ ] 写明生成报告格式
```

## 7. 推荐优先级

近期优先级：

```text
P0：render-deck.js 能生成固定尺寸 deck.html
P0：check-overflow.js 能发现 safe area 溢出
P0：模板结构和主题变量稳定
P1：支持首批 5 个组件
P1：支持截图检查
P1：油猴脚本能导出 pptx
P2：支持用户模板 PPTX/PDF 接入
P2：形成正式 SKILL.md
```

## 8. 开发纪律

实现时遵守以下规则：

- 每次新增功能后运行对应检查脚本。
- 组件和模板分离，组件不得包含完整 slide。
- `deck.data.json` 只描述内容和结构，不承载复杂 CSS。
- 对溢出问题优先拆页、换组件、删低优先级内容。
- 禁止通过极小字号、滚动容器、整页截图绕过问题。
- 所有导出相关 DOM 必须本地资源优先，避免跨域图片和远程字体。
