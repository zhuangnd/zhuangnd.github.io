# 设计规范 · Design Specification

> 本文件定义 Discussion Quality Framework 的视觉语言，是所有页面的"唯一权威"。
> 修改视觉前请先更新本文件，再同步到 `assets/css/`。

## 1. 风格定位

- **Modern Minimal / Liquid Glass / Dark / Orange Accent**
- 参考气质：Apple + Linear + Raycast 的克制与精致
- 关键词：**高级、克制、信息密度高** —— 不是"科技炫酷"，不要霓虹、不要粒子风暴、不要渐变滥用

## 2. 色彩令牌（theme.css）

| 令牌 | 值 | 用途 |
| ---- | --- | ---- |
| `--bg` | `#111315` | 页面背景 |
| `--glass` | `rgba(255,255,255,.06)` | 玻璃表面 |
| `--glass-strong` | `rgba(255,255,255,.10)` | 玻璃悬停 / 强调 |
| `--border` | `rgba(255,255,255,.10)` | 常规描边 |
| `--border-strong` | `rgba(255,255,255,.18)` | 强调描边 |
| `--primary` | `#F59E0B` | 主色（橙） |
| `--green` | `#22C55E` | 正向（继续 / 通过） |
| `--blue` | `#60A5FA` | 中性强调 |
| `--red` | `#EF4444` | 负向（退出 / 失败） |
| `--text` | `#F5F5F4` | 主文本 |
| `--text-dim` | `rgba(245,245,244,.66)` | 次级文本 |
| `--text-faint` | `rgba(245,245,244,.42)` | 弱化文本 |

**语义约定**：`primary` 只用于强调与焦点；`green/red` 只用于"继续 / 退出"这类二值判断；`blue` 慎用。

## 3. 玻璃拟态（Liquid Glass）

```css
.glass {
  background: linear-gradient(150deg, rgba(255,255,255,.08), rgba(255,255,255,.03));
  border: 1px solid rgba(255,255,255,.10);
  border-radius: 18px;
  backdrop-filter: blur(20px) saturate(140%);
}
```

- 背景必须有细微明度渐变，避免死板的单色玻璃
- 描边统一 `rgba(255,255,255,.10)`，悬停时 `transform: translateY(-2px)`
- 圆角：大卡片 `18px`，小元件 `12px`，胶囊 `999px`

## 4. 字体

- 栈：`-apple-system, "SF Pro Display", "Segoe UI", Roboto, "PingFang SC", "Noto Sans SC", "Microsoft YaHei", sans-serif`
- 标题 `font-weight: 800`，正文 `400`，小标签 `700 + letter-spacing`
- 字号：Hero 标题 `clamp(34px, 5.4vw, 60px)`，区块标题 `clamp(28px, 4vw, 40px)`，正文 `14–15px`

## 5. 动效原则（animation.css）

只保留**有信息价值**的动画，不做复杂粒子系统（粒子仅 Hero 背景的轻量 Canvas）：

| 动画 | 触发 | 用途 |
| ---- | ---- | ---- |
| Hero Fade | 页面加载 | 首屏渐入，错峰 0.05s/0.18s/0.32s |
| Card Hover | 鼠标悬停 | 卡片 `translateY(-2px)` |
| Flow Draw | 进入视口 | SVG 连线描线动画 |
| Scroll Reveal | 进入视口 | 区块 `translateY(26px) → 0` |
| Number Count | 数据变化 | Checklist 得分数字 CountUp |
| Node Pulse | Hero 链路 | 节点发光脉冲 |
| Glass Blur | 全局 | 背景光晕缓慢漂移 |

统一缓动：`cubic-bezier(.22, .61, .36, 1)`。支持 `prefers-reduced-motion` 降级。

## 6. 布局

- 内容最大宽 `1120px`，居中
- 区块纵向间距 `96px`（移动端 `72px`），左右 `24px`
- 优先 CSS Grid 做双栏（Hero、流程、分析器、Checklist），移动端单栏堆叠

## 7. 图标与装饰

- 卡片图标：`assets/icons/icon-*.svg`，24×24，描边 `1.7`，主色 `#F59E0B`，线稿风格
- 装饰：`assets/svg/divider.svg` 渐隐分隔线，仅作页脚等轻装饰

## 8. 验收自查清单

- [ ] 背景 `#111315`，玻璃不泛灰
- [ ] 主色只用橙色系，绿/红只做二值语义
- [ ] 无大面积靛蓝 / 紫配色
- [ ] 所有文字在深色玻璃上可读（对比度达标）
- [ ] 动画克制、有含义；`prefers-reduced-motion` 生效
- [ ] 移动端无横向滚动、无文字溢出
