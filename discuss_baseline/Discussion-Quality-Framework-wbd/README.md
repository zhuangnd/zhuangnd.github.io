# Discussion Quality Framework · 讨论质量框架

> 从概念、标准、事实、逻辑到认知增量，建立可执行的讨论分析框架。
> **Thinking Framework Series · 第 01 篇**

一个零依赖的交互式思维框架站点。目的不是阅读，而是**分析问题**——把一场混乱的争论拆成五个可检查的层次，定位分歧到底卡在哪一环。

---

## 快速开始

**方式一：直接双击**

```
双击 index.html
```

**方式二：本地服务器**（推荐，行为与线上一致）

```bash
cd Discussion-Quality-Framework-wbd
python3 -m http.server 8000
# 打开 http://localhost:8000
```

两种方式都能完整运行——项目**无任何 CDN 依赖、无需构建、无需 npm install**，D3 已内置在 `assets/js/vendor/`。

---

## 目录结构

```
Discussion-Quality-Framework-wbd/
├── index.html                 主页面（13 个分区）
├── README.md                  本文件：项目说明与运行方式
├── design.md                  设计规范：色彩 / 排版 / 组件 / 动画契约
├── framework.md               理论框架：五条基线的定义、关系与评分规则
├── interaction.md             交互说明：各模块行为、状态机与模块间联动
│
└── assets/
    ├── css/
    │   ├── theme.css          设计令牌（唯一颜色/字体/间距来源）+ Light 主题覆盖
    │   ├── style.css          布局与组件
    │   └── animation.css      7 类动效与关键帧
    │
    ├── js/
    │   ├── app.js             ★ 主编排：公共工具 + 导航 + Hero + 6 个内容分区
    │   ├── cards.js           五大基线卡片（内容数据 + 展开 + 精度联动）
    │   ├── flow.js            D3 动态流程图（五道闸门）
    │   ├── analyzer.js        讨论诊断器（规则引擎）
    │   ├── radar.js           D3 雷达图 + 独立雷达模块
    │   ├── cases.js           案例分析（5 个场景）
    │   ├── checklist.js       自检清单与实时评分
    │   └── vendor/
    │       └── d3.min.js      D3 v7.9.0（内置，280 KB）
    │
    ├── svg/
    │   ├── hero-grid.svg      Hero 网格遮罩
    │   ├── divider.svg        分区分隔线
    │   └── flow-arrow.svg     认知增量链的方向箭头（CSS mask 使用）
    │
    └── icons/
        ├── icon-concept.svg   概念定义
        ├── icon-standard.svg  标准约束
        ├── icon-evidence.svg  事实依据
        ├── icon-logic.svg     逻辑遵循
        └── icon-gain.svg      认知增量
```

---

## 页面分区

| # | 分区 | id | 模块文件 | 交互 |
|---|------|----|---------|------|
| 1 | Hero | `#hero` | app.js | Canvas 粒子背景 + 五段链路流动光效 |
| 2 | 框架总览 | `#overview` | app.js | 8 节点点击切换详情面板 |
| 3 | 五大基线 | `#baselines` | cards.js | 5 张 Glass Card 手风琴展开 |
| 4 | 讨论流程 | `#flow` | flow.js | D3 流程图，节点可点，YES/NO 分支 |
| 5 | 精度等级 | `#precision` | app.js | 7 档滑块，全页联动 |
| 6 | 讨论诊断 | `#analyzer` | analyzer.js | 文本输入 → 六维评分 + 雷达图 |
| 7 | 讨论雷达 | `#radar` | radar.js | 5 个滑块 + 5 组预设，实时成图 |
| 8 | 案例分析 | `#cases` | cases.js | 5 个场景切换，可带入其他模块 |
| 9 | 认知增量 | `#gain` | app.js | 7 段演化链 + 6 条判定标准 |
| 10 | 退出判断 | `#exit` | app.js | 三问决策树，状态机驱动 |
| 11 | 讨论演化 | `#timeline` | app.js | 7 步垂直时间线 |
| 12 | 自检清单 | `#checklist` | checklist.js | 6 项勾选 → 实时评分与评级 |
| 13 | 思维原则 | `#principles` | app.js | 结尾屏，四句递进 |

另外还有固定导航（scrollspy + 主题切换）与回到顶部按钮。

---

## 技术栈

| 层 | 选型 | 说明 |
|---|------|------|
| 结构 | HTML5 | 语义化标签，`<main>` / `<section>` / `<nav>` |
| 样式 | CSS Variables + Grid + Flex | 无预处理器，令牌集中在 `theme.css` |
| 图形 | 原生 SVG + **D3 v7.9.0** | D3 仅用于流程图与雷达图，已本地内置 |
| 脚本 | Vanilla JavaScript (ES5+ 语法) | 无框架、无打包器、无 ES Module |
| 图标 | 自绘 SVG | 5 个线性图标，无图标库 |
| 字体 | 系统字体栈 | Inter → PingFang SC → Noto Sans SC 逐级回退，无 Web Font |
| 主题 | Dark 默认 + Light 覆盖 | 首次跟随系统，手动切换后写入 `localStorage` |

### 为什么不用 ES Module / 打包器

项目要能**双击 `index.html` 直接运行**。而 `file://` 协议下 ES Module 会被 CORS 拦截，`fetch()` 本地文件同样失败。因此：

- 所有脚本使用传统 `<script src>` + IIFE 包裹，通过 `window.DQF*` 命名空间通信；
- 所有资源使用相对路径，图标用 `<img>` 直接引用，不使用 `fetch`；
- 不使用任何需要构建的语法。

---

## 脚本加载顺序

```html
<script src="assets/js/vendor/d3.min.js"></script>
<script src="assets/js/cards.js"></script>       <!-- 仅注册 window.DQFCards -->
<script src="assets/js/flow.js"></script>        <!-- 仅注册 window.DQFFlow -->
<script src="assets/js/analyzer.js"></script>    <!-- 仅注册 window.DQFAnalyzer -->
<script src="assets/js/radar.js"></script>       <!-- 仅注册 window.DQFRadar -->
<script src="assets/js/cases.js"></script>       <!-- 仅注册 window.DQFCases -->
<script src="assets/js/checklist.js"></script>   <!-- 仅注册 window.DQFChecklist -->
<script src="assets/js/app.js"></script>         <!-- 定义 window.DQF 工具 + DOMContentLoaded 统一调度 -->
```

子模块在解析阶段只注册对象、不执行逻辑；`app.js` 最后加载，在 `DOMContentLoaded` 时按顺序调用各模块的 `init()`。因此子模块可以安全使用 `window.DQF` 提供的工具函数。

---

## 修改内容

大部分文案集中在各模块顶部的数据数组里，改文案不需要碰渲染逻辑：

| 想改什么 | 改哪里 |
|---------|--------|
| 五大基线的定义 / 案例 / 常见错误 | `assets/js/cards.js` → `BASELINES` |
| 流程图的五个判断点 | `assets/js/flow.js` → `FLOW` |
| 精度档位与星级 | `assets/js/app.js` → `DQF.PRECISION` |
| 总览八个节点 | `assets/js/app.js` → `OVERVIEW` |
| 诊断器的信号词库 | `assets/js/analyzer.js` → `LEX` |
| 诊断器的评分规则 | `assets/js/analyzer.js` → `RULES` |
| 案例分析场景 | `assets/js/cases.js` → `CASES` |
| 认知增量链 / 时间线 / 原则 | `assets/js/app.js` → `GAIN_CHAIN` / `TIMELINE` / `PRINCIPLES` |
| 配色 / 间距 / 字体 | `assets/css/theme.css`（只改这一处，全站生效） |

---

## 预览产生的 `data-page-node-id` 噪音

用 `present_files` 预览本页后，**源文件会被就地注入** `data-page-node-id="<nanoid>"`（每个元素一个，约 +8KB）。这是宿主预览管线（static-html 制品）为页面节点锚定而写入的，与本项目代码无关，实测确认：

- 即使预览的是 `/tmp` 下的副本，工作区的源文件同样被注入
- 即使把源文件改成只读（`chmod 444`），宿主也会把权限改回 `644` 后写入
- 该属性对渲染无任何作用，纯粹是 diff 噪音

项目侧无法阻止注入，改为在入库前拦截，两道防线：

| 防线 | 位置 | 特点 |
|------|------|------|
| clean 过滤器 | `.gitattributes` + 仓库 local config | 已在用；换机器/新克隆会失效 |
| **pre-commit 钩子** | `.githooks/pre-commit` | **随仓库提交**，启用一次后永久生效 |

启用钩子（每个克隆执行一次）：

```bash
git config core.hooksPath .githooks
```

想让工作区立刻干净，跑一次：

```bash
sh tools/clean-preview-attrs.sh
```

钩子只改写暂存区的 blob，不会把其它未暂存的改动一并提交；同时会同步清理工作区副本，避免提交后 `git status` 仍显示差异。

---

## 浏览器支持

- Chrome / Edge 90+
- Safari 15.4+（`backdrop-filter`、`color-mix()` 需要较新版本）
- Firefox 90+

`color-mix(in srgb, ...)` 用于少量半透明叠加（卡片图标底色、诊断结论徽标）。在不支持的浏览器上这些位置会退化为无背景色，布局与可读性不受影响。

`prefers-reduced-motion: reduce` 时，全部动效自动关闭，粒子背景不启动。
