# DQF · 设计规范

> 本文件是项目的视觉与交互契约。所有实现必须以本文件为准；
> 若实现与本文件冲突，以本文件为正确版本。

---

## 一、设计原则

### 1. 高级克制，不是科技炫酷

参照 Apple Human Interface Guidelines 与 Linear 的调性：**留白多、质感强、信息密度高**。
禁止使用霓虹发光、大面积渐变、3D 变换、粒子爆炸等炫技效果。

### 2. 内容优先于装饰

每一个视觉元素都要回答"它帮助读者理解了什么"。无法回答的元素应当删除。

### 3. 一页一主题

每个分区只讲一件事。分区之间用分隔线断开，不让内容互相渗透。

### 4. 工具感

这是一个**知识工具**，不是文章。读者应该能在这里输入、拖动、点击、得到反馈，
而不只是滚动阅读。

---

## 二、色彩系统

所有颜色定义在 `assets/css/theme.css` 的 `:root` 中。**组件样式中禁止出现硬编码色值**。

### 2.1 中性色

| 令牌 | Dark | Light | 用途 |
|------|------|-------|------|
| `--bg` | `#111315` | `#f6f7f8` | 页面底色 |
| `--bg-elev` | `#16181b` | `#ffffff` | 抬升一层（导航、输入框浮起状态） |
| `--bg-sunken` | `#0c0d0f` | `#eceef0` | 下沉一层（进度条轨道、代码块） |
| `--glass` | `rgba(255,255,255,.06)` | `rgba(255,255,255,.72)` | 玻璃卡片默认底 |
| `--glass-strong` | `rgba(255,255,255,.09)` | `rgba(255,255,255,.88)` | 玻璃卡片强调底 |
| `--glass-hover` | `rgba(255,255,255,.12)` | `rgba(255,255,255,.96)` | 悬停态 |
| `--glass-sunken` | `rgba(0,0,0,.22)` | `rgba(0,0,0,.035)` | 卡片内部下沉块 |

### 2.2 描边

| 令牌 | Dark | Light |
|------|------|-------|
| `--border` | `rgba(255,255,255,.10)` | `rgba(16,20,26,.10)` |
| `--border-strong` | `rgba(255,255,255,.18)` | `rgba(16,20,26,.18)` |
| `--border-faint` | `rgba(255,255,255,.06)` | `rgba(16,20,26,.06)` |

### 2.3 文本

| 令牌 | Dark | Light | 用途 |
|------|------|-------|------|
| `--text` | `#f2f4f7` | `#14181d` | 标题、正文 |
| `--text-soft` | `#b7bdc6` | `#4a525c` | 次要正文 |
| `--text-dim` | `#7c8490` | `#6b7480` | 说明文字、标签 |
| `--text-faint` | `#545b64` | `#97a0ab` | 序号、刻度、页脚 |

### 2.4 语义色

| 令牌 | Dark | Light | 语义 |
|------|------|-------|------|
| `--accent` | `#f59e0b` | `#d97706` | 主强调（橙色） |
| `--green` | `#22c55e` | `#16a34a` | 通过 / YES / 继续 |
| `--red` | `#ef4444` | `#dc2626` | 失败 / NO / 停止 |
| `--blue` | `#60a5fa` | `#2563eb` | 说明 / 观点 A |
| `--purple` | `#a78bfa` | `#7c3aed` | 逻辑层 |

### 2.5 五基线专属色

每个基线有固定色，全站一致（图标、卡片强调、雷达轴、案例星级）：

| 基线 | 令牌 | 色值 |
|------|------|------|
| 概念定义 | `--c-concept` | `#60a5fa` 蓝 |
| 标准约束 | `--c-standard` | `#f59e0b` 橙 |
| 事实依据 | `--c-evidence` | `#22c55e` 绿 |
| 逻辑遵循 | `--c-logic` | `#a78bfa` 紫 |
| 认知增量 | `--c-gain` | `#f472b6` 粉 |

**规则**：同一基线在所有出现位置必须使用同一颜色，形成视觉锚点。

---

## 三、排版

### 3.1 字体栈

```css
--font-sans: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
             "PingFang SC", "Hiragino Sans GB", "Noto Sans SC",
             "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif;
--font-mono: "SF Mono", "JetBrains Mono", ui-monospace, SFMono-Regular,
             Menlo, Consolas, "Liberation Mono", monospace;
```

不加载 Web Font，全部使用系统字体——保证离线可用与零加载延迟。

### 3.2 字号（流式，`clamp()`）

| 令牌 | 范围 | 用途 |
|------|------|------|
| `--fs-hero` | 2.4rem → 4.6rem | Hero 主标题 |
| `--fs-h2` | 1.7rem → 2.6rem | 分区标题 |
| `--fs-h3` | 1.05rem → 1.25rem | 面板小标题 |
| `--fs-body` | .9rem → .975rem | 正文（基准） |
| `--fs-sm` | .845rem | 次要正文 |
| `--fs-xs` | .775rem | 说明、标签 |
| `--fs-micro` | .7rem | 序号、eyebrow、刻度 |

### 3.3 行高与字距

- 正文行高 `1.7`
- 标题 `letter-spacing: -.02em`，Hero `-.035em`
- eyebrow：`letter-spacing: .16em` + 全大写 → 制造层级反差

---

## 四、间距与圆角

### 4.1 间距阶梯（8pt 基准）

```
--sp-1: 4px    --sp-2: 8px    --sp-3: 12px   --sp-4: 16px
--sp-5: 24px   --sp-6: 32px   --sp-7: 48px   --sp-8: 64px   --sp-9: 96px
```

分区垂直内边距：`clamp(56px, 8vw, 108px)`。

### 4.2 圆角

```
--r-sm:   8px     小元素（按钮、标签、复选框内部）
--r-md:  12px     卡片内部块、面板
--r-lg:  18px     标准卡片、大面板
--r-xl:  26px     Hero 链路容器
--r-pill: 999px   胶囊（按钮、chip、导航项）
```

### 4.3 布局

- 内容最大宽度 `--max-w: 1200px`
- 左右留白 `clamp(18px, 4vw, 40px)`
- 导航高度 `--nav-h: 58px`（≤720px 时 52px）

---

## 五、组件

### 5.1 Glass Card

```css
background: var(--glass);
border: 1px solid var(--border);
border-radius: var(--r-lg);
backdrop-filter: saturate(180%) blur(20px);
```

悬停：`translateY(-3px)` + `--sh-md`。
展开态：描边变为 `--card-color`（该基线的专属色）。

### 5.2 Chip

胶囊标签，四种语义变体：`--accent` / `--green` / `--blue` / `--red`。

### 5.3 星级 Stars

12×12 圆角方块，激活态填充基线色，未激活填充 `--border-strong`。
`.stars.sm` 为 9×9，用于卡片底部。

### 5.4 滑块 Slider

- 轨道 4px，`--accent` 填充到当前位置（通过 `--fill` 百分比变量控制）
- 滑块 20px 圆点，`--bg-elev` 底 + 2px `--accent` 描边 + 5px 外发光
- 下方 7 个刻度标签，当前档位高亮为 `--accent` 且加粗，刻度本身可点击

### 5.5 进度环（Checklist）

- `r = 74`，周长 `464.96`
- 通过 `stroke-dashoffset` 控制进度，颜色跟随评级
- 数字用 `requestAnimationFrame` 缓动，easeOutCubic，480ms

---

## 六、动画契约

**只允许以下 7 类动效**（定义在 `assets/css/animation.css`）：

| 类型 | 时长 | 曲线 | 说明 |
|------|------|------|------|
| Hero 渐入 | .85s | `--ease-out` | 标题逐行上浮 + 去模糊 |
| 卡片 Hover | .28s | `--ease` | `translateY(-3px)` + 阴影 |
| SVG Draw | .42s | `--ease-out` | 流程图连线逐条 draw-in，间隔 55ms |
| Scroll Reveal | .58s | `--ease-out` | `.rv` 元素进入视口时上浮淡入 |
| Number CountUp | .48s | easeOutCubic | 评分数字滚动 |
| Slider 过渡 | .38s | `--ease-out` | 星级、进度条、容错条宽度 |
| Glass Blur 呼吸 | 7s | ease-in-out | 仅 Hero 链路容器描边 |

### 曲线定义

```css
--ease:      cubic-bezier(.22, .61, .36, 1);
--ease-out:  cubic-bezier(.16, 1, .3, 1);
--dur-fast:  .16s;
--dur:       .28s;
--dur-slow:  .62s;
```

### 阶梯延迟

容器加 `.rv-stagger`，子元素按 `:nth-child` 自动获得 40ms 递增延迟（最多 9 个）。

### 降级

`prefers-reduced-motion: reduce` 时：所有 `animation` / `transition` 归零，
Scroll Reveal 元素直接显示，Hero 粒子背景不启动。

---

## 七、响应式断点

| 断点 | 变化 |
|------|------|
| `≤ 1040px` | 所有双栏网格降为单栏；自检评分取消 sticky |
| `≤ 720px` | 导航链接与精度徽标隐藏（仅保留品牌 + 主题按钮）；Hero 高度自适应；认知增量链改为纵向；退出公式改为纵向堆叠 |

网格统一使用 `repeat(auto-fit, minmax(...))`，卡片数量自适应，不写死每行列数。

---

## 八、主题切换

- `<html data-theme="dark|light">` 驱动
- 初始值：`localStorage['dqf-theme']` → 系统 `prefers-color-scheme` → `dark`
- Light 主题不是 Dark 的简单反转，而是一套独立挑选的灰阶：
  玻璃层改为半透明白 + 更强模糊，描边压深以保证卡片边界在浅底上依然清晰

---

## 九、无障碍

- 所有可点击元素使用 `<button>` 或 `<a>`，键盘可达
- 卡片展开按钮带 `aria-expanded` 状态
- SVG 图形带 `role="img"` + `aria-label`
- 焦点样式：2px `--accent` 描边 + 3px 偏移
- 语义色不单独承载信息——YES/NO 分支同时有文字标签与颜色
