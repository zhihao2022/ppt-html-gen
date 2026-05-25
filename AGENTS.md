# AGENTS.md

本文件约束 Codex 或其他自动化 agent 在本仓库中的工作方式。

## 项目目标

本仓库是一个 HTML-to-PPTX 生成工具，同时也是一个 Codex Skill。核心目标是：

- 根据大纲、材料、模板和组件生成固定尺寸 HTML 幻灯片。
- 通过浏览器检查和自动检查脚本提前发现排版问题。
- 配合 DOM-to-PPTX 导出尽量可编辑的 PPTX。

## 工作原则

- 先读 `SKILL.md`，再读 `references/` 下与任务相关的文档。
- 不要绕过 `deck.plan.md` 的规划确认流程，除非任务明确只是工程开发或示例 fixture。
- 不要随意改模板固定结构、全局主题色或页面尺寸。
- 正文内容必须进入 content slide 的 `[data-safe-area]`。
- 内容超载时优先拆页、换组件或删减低优先级内容。
- 不要用极小字号、滚动容器、溢出 safe area 或整页截图掩盖排版问题。
- `tmp/` 是用户临时参考素材目录，不要提交。

## Git 规则

- 当前项目已经是 git 仓库。
- 每次完成文件修改后运行 `git status --short`。
- 每次实现一个完整阶段或一组相关变更后提交一次 commit。
- 不要提交 `node_modules/`、`tmp/`、临时截图缓存或导出的 `.pptx`。
- 不要回滚用户未要求回滚的改动。

## Python 规则

当前项目主要使用 Node.js。除非任务明确需要 Python，否则不要新增 Python 代码。

如果后续确实需要写 Python，且项目根目录没有 `.venv`，先使用：

```bash
uv venv
```

之后再管理 Python 依赖。

## Node.js 规则

Windows PowerShell 可能禁止执行 `npm.ps1` 或 `npx.ps1`。本仓库命令优先使用：

```bash
npm.cmd ...
npx.cmd ...
```

不要依赖全局安装的包；需要稳定依赖时写入 `package.json`。

## 常用验证

提交前按变更类型运行相关检查。

最小验证：

```bash
npm.cmd run check:syntax
```

完整验证：

```bash
npm.cmd run check
```

涉及视觉或模板/组件变更时追加：

```bash
npm.cmd run screenshots
npm.cmd run component-previews
```

涉及导出流程时追加：

```bash
npm.cmd run check:export
node --check userscript/export-html-to-pptx.user.js
```

## 目录职责

```text
configs/          配置合同
templates/        slide 模板
templates/source/ 用户模板源文件归档
components/       可复用正文组件
styles/           全局 CSS
scripts/          渲染和检查脚本
userscript/       导出辅助脚本
decks/input/      输入大纲和材料
decks/generated/  生成结果和检查报告
references/       skill 按需读取的参考文档
docs/             工程设计和规范文档
```

## 修改指南

- 改渲染逻辑：优先修改 `scripts/render-deck.js`，然后运行 `npm.cmd run render && npm.cmd run check`。
- 改模板：同时更新 `configs/template.config.json`、`templates/template.mapping.json` 或 `templates/template.analysis.md`，然后运行 `npm.cmd run check:template`。
- 新增组件：创建 `components/<name>/` 下 4 个必需文件，更新 `configs/component.registry.json`，然后运行 `npm.cmd run component-previews`。
- 改导出：更新 `configs/export.config.json`、`userscript/` 或 `scripts/check-export-readiness.js`，然后运行 `npm.cmd run check:export`。

## 输出要求

完成任务后给出：

- 修改了什么。
- 运行了哪些检查。
- 输出路径或远程链接。
- 是否还有已知限制。
