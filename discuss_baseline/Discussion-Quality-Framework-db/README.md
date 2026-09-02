# Discussion Quality Framework · 讨论质量框架

一次高质量讨论的**可执行路径**：从「开始」到「继续或退出」，用五个基线判断讨论是否值得投入。

> 不是"怎么赢"，而是怎么把讨论变成真正有质量的认知过程。

---

## 一句话

**概念定义 → 标准约束 → 事实依据 → 逻辑遵循 → 认知增量**，五关全过则继续，任一失败则该退出。

## 项目结构

```
Discussion-Quality-Framework/
├── index.html               # 唯一入口，双击即可运行（零依赖）
├── README.md                # 本文件：快速上手
├── design.md                # 设计规范：风格、色彩、字体、动效
├── framework.md             # 框架本体：五大基线完整定义与示例
├── interaction.md           # 交互说明：每个板块怎么用、JS 如何驱动
└── assets/
    ├── css/
    │   ├── theme.css        # 设计令牌（变量）：色彩、玻璃、尺寸
    │   ├── style.css        # 组件样式：全部板块布局
    │   └── animation.css    # 动画：Hero / Reveal / Flow / Pulse
    ├── js/
    │   ├── app.js           # 入口 + 滚动进度 + Reveal + 粒子 + 总览 + 滑块 + 决策树
    │   ├── cards.js         # 五大基线可展开卡片
    │   ├── flow.js          # D3 风格交互式流程图（SVG）
    │   ├── analyzer.js      # 讨论分析器 + 案例分析
    │   └── checklist.js     # Checklist 实时评分 + CountUp
    ├── svg/                 # 装饰性 SVG（divider 等）
    └── icons/               # 卡片图标（icon-*.svg）
```

## 快速开始

直接双击打开 `index.html`，或用浏览器打开：

```bash
open index.html        # macOS
```

无需安装、无需联网、无需构建。全部为原生 HTML5 + CSS3 + Vanilla JS（ES2022）。

## 页面板块

| 板块 | 说明 | 交互 |
| ---- | ---- | ---- |
| Hero | 标题 + 粒子背景 + 中央五级链路 | 进入视口后链路逐级点亮 |
| 框架总览 | 七步路径总览 | 点击节点查看说明 |
| 五大基线 | 五张可展开 Glass Card | 点击展开 / 收起 |
| 讨论流程 | D3 风格 SVG 流程图 | 点击节点显示说明、描线动画 |
| 讨论宽容度 | 场景严格度滑块 | 拖动实时更新各维度要求 |
| 讨论分析器 | 粘贴文本按规则打分 | 点击"分析" |
| 案例分析 | 5 个预设案例 | 切换 Tab 查看分歧与结论 |
| 认知增量 | 讨论的收益评估 | 静态展示 |
| 是否退出讨论 | 决策树 | 逐题点击 YES / NO |
| Checklist | 6 项自检 + 实时评分 | 勾选实时联动 |

## 技术栈

- 原生 HTML5 + CSS3（CSS Variables + Flex/Grid）
- Vanilla JavaScript（ES2022），模块按职责拆分，经 `window.DQF.register()` 统一注册启动
- SVG（流程图、图标、装饰）
- **零依赖**：无 React / Vue / Tailwind / Bootstrap / Node / npm

## 版权与声明

仅供认知与沟通学习使用。设计语言为自创「Liquid Glass / Dark / Orange Accent」风格。
