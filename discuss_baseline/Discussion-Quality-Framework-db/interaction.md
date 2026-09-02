# 交互说明 · Interaction Specification

> 本文件说明每个板块的交互方式、JS 如何驱动，以及如何扩展。
> 涉及 JS 的改动请先阅读本文件，再修改 `assets/js/` 下对应模块。

## 0. 模块注册机制

所有 JS 模块通过统一的注册表启动：

```js
// 每个模块文件末尾
var DQF = window.DQF || (window.DQF = { init: [] });
DQF.register(function () { /* 初始化逻辑 */ });
```

`app.js` 在 `DOMContentLoaded` 时依次执行 `DQF.init` 中的全部函数，任何单个模块出错不影响其他模块。

**模块职责边界**：

| 文件 | 职责 |
| ---- | ---- |
| `app.js` | 滚动进度 / Scroll Reveal / Hero 粒子 / Hero 链路 / 框架总览 / 宽容度滑块 / 退出决策树 |
| `cards.js` | 五大基线卡片渲染与展开 |
| `flow.js` | 讨论流程 SVG 生成、点击高亮、描线动画 |
| `analyzer.js` | 讨论分析器 + 案例分析 |
| `checklist.js` | Checklist 渲染、勾选、评分、CountUp |

## 1. Hero

- **粒子背景**：`#particles` Canvas，随窗口缩放重建，粒子数约 `width/24`（20–60 个）。
- **中央链路**：`#heroChain` 进入视口后，节点与连线按 `260ms` 间隔逐级点亮（`.on` / `.flow`）。
- 支持 `prefers-reduced-motion` 时跳过粒子循环。

## 2. 框架总览

- 七个 `.ov-node[data-ov]` 节点，`data-ov` 对应数据下标。
- 点击节点 → 高亮（`.active`）+ 右侧 `.ov-detail` 显示该层说明。
- 数据与文案在 `app.js` 内联数组，改文案即改数组。

## 3. 五大基线卡片

- `cards.js` 内置 `CARDS` 数组（5 项：概念 / 标准 / 事实 / 逻辑 / 认知）。
- 渲染到 `#baselineGrid`，点击卡片 `.card` 切换 `.open`（手风琴：同时只展开一张）。
- 图标来自 `assets/icons/icon-*.svg`；新增基线需同步新增图标。

## 4. 讨论流程（SVG）

- `flow.js` 程序化生成 SVG（`#flowSvg`），主链 x=240，五道关卡 y=155/275/395/515/635。
- 节点带 `data-flow` 下标，点击 → `.active` 高亮 + 右侧 `#flowDetailBody` 显示关卡说明与检查项。
- YES 线绿色、NO 线红色虚线；`pathLength=1` + CSS `draw-path` 实现描线动画，进入视口触发 `.drawn`。
- 修改关卡数需同步调整 `FLOW` 数组与 `CYS` 坐标。

## 5. 讨论宽容度（Slider）

- `#pRange`（0–100，步进 25）对应 5 档：闲聊 / 工作讨论 / 技术讨论 / 科研论文 / 数学证明。
- `input` 事件实时更新：`#pLevel`（档位名）、`#pTol`（容忍误差条）、`#pTolTxt`、`#pDims`（四维度星级与最低要求）。
- 数据与文案在 `app.js` 的 `levels` / `dimMeta` / `reqFor` 中。

## 6. 讨论分析器

- 输入 `#analyzeInput`，点击 `#analyzeBtn` 或 `⌘/Ctrl + Enter` 触发。
- `analyzer.js` 的 `analyze(text)` 返回 `{ dims, advice, verdict }`，渲染到 `#analyzerResult`。
- 评分规则见 `framework.md §7`。替换为 AI 接口时只需重写 `analyze()`，保持返回结构不变。

## 7. 案例分析

- 5 个 `.case-tab[data-case]`，点击切换 `#caseDims`（维度星级）与 `#casePanel`（分歧定位 + 结论）。
- 数据在 `analyzer.js` 的 `CASES` 对象；`verdict.type` 为 `go` / `stop` 决定按钮样式与文案。

## 8. 退出决策树

- 5 个 `.dt-node[data-dt]`，每节点 YES / NO 两个 `.dt-btn`。
- 点击后选中态（`.chosen-yes` / `.chosen-no`），并在 `#dtResult` 实时给出"继续 / 停止"结论（以最后一题为准）。
- `#dtReset` 一键重置全部选择。

## 9. Checklist

- `checklist.js` 渲染 6 条 `.check-item` 到 `#checkList`。
- 点击条目切换勾选（原生 checkbox 隐藏，自定义 `.check-box`）。
- 实时联动：`#scoreNum`（CountUp 动画）、`#scoreLabel`（等级）、`#scoreBar`（进度条）、`#scoreDots`（6 个点位）、`#scoreAdvice`（建议）。
- 评分口径见 `framework.md §6`。

## 10. 通用

- **Scroll Reveal**：`.reveal` 元素进入视口后加 `.visible`。动态渲染的模块需调用 `DQF.reObserve(root)` 让新元素被观察（`cards.js` 已示范）。
- **滚动进度条**：`#scrollProgress` 顶部细条，随滚动缩放。
- **断点**：980px 以下双栏转单栏并取消 sticky；640px 以下隐藏导航链接。
