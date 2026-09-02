/* ============================================================
   flow.js — 讨论流程（D3 风格动态 SVG 流程图）
   Discussion Quality Framework
   职责：程序化生成可点击的流程图 —— 开始 → 五道关卡（YES/NO 分支）
        → 继续 / 退出。点击节点高亮并显示说明；描线动画。
   ============================================================ */
(function () {
  "use strict";

  var DQF = window.DQF || (window.DQF = { init: [] });

  var NS = 'http://www.w3.org/2000/svg';

  var FLOW = [
    { num: '01', title: '概念一致？', en: 'Same concept?',
      body: '先确认双方讨论的是同一个对象。很多争论不是观点不同，而是对象不同——"公平"双方理解完全不同。',
      checks: ['对象是否一致', '定义是否已统一', '必要时给出操作性定义'] },
    { num: '02', title: '标准一致？', en: 'Same standard?',
      body: '确认双方采用同一评价标准。标准不同时双方都可能正确，先明确评价函数，否则不存在统一结论。',
      checks: ['判断依据是否明确', '指标与权重是否一致', '适用范围是否说清'] },
    { num: '03', title: '事实一致？', en: 'Facts agreed?',
      body: '确认双方认可哪些事实、依据是否可靠。事实不可靠则结论不可靠，需要可验证的证据。',
      checks: ['关键事实可验证', '区分数据 / 样本 / 来源 / 偏差', '证据链是否完整'] },
    { num: '04', title: '逻辑成立？', en: 'Logic valid?',
      body: '检查推理是否有效。中间每一步都需要证明，不能跳步、不能偷换、不能循环论证、不能把相关当因果。',
      checks: ['是否有跳步', '是否偷换概念', '是否混淆相关与因果'] },
    { num: '05', title: '产生认知？', en: 'Gained insight?',
      body: '评估是否获得了新的信息、新的理解或更清晰的问题。认知增量是整个流程的收益评估。',
      checks: ['学到了新事实？', '发现了推理漏洞？', '问题是否被缩小？'] }
  ];

  var SPINE = 240;          // 主链 x 中心
  var EXIT_X = 560;         // 退出讨论 pill x 中心
  var CYS = [155, 275, 395, 515, 635];

  function el(name, attrs) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  function line(x1, y1, x2, y2, cls) {
    var l = el('line', {
      x1: x1, y1: y1, x2: x2, y2: y2,
      'class': 'flow-line ' + (cls || ''),
      'pathLength': 1,
      'stroke-linecap': 'round'
    });
    if (!cls) l.classList.add('draw-path');
    return l;
  }

  function build() {
    var wrap = document.getElementById('flowSvg');
    if (!wrap) return;
    var svg = el('svg', { viewBox: '0 0 720 760', role: 'img', 'aria-label': '讨论流程' });
    var detail = document.getElementById('flowDetailBody');

    /* 开始节点 */
    svg.appendChild(line(SPINE, 58, SPINE, CYS[0] - 34, 'yes draw-path'));
    var start = el('g', { 'class': 'flow-node start' });
    start.appendChild(el('rect', { 'class': 'rect', x: SPINE - 80, y: 12, width: 160, height: 46, rx: 12 }));
    var t = el('text', { x: SPINE, y: 41, 'text-anchor': 'middle', 'class': 'label zh' });
    t.textContent = '开始';
    start.appendChild(t);
    svg.appendChild(start);

    /* 五道关卡 */
    CYS.forEach(function (cy, i) {
      var d = FLOW[i];

      // YES 主线（节点之间）
      if (i < CYS.length - 1) {
        svg.appendChild(line(SPINE, cy + 34, SPINE, CYS[i + 1] - 34, 'yes draw-path'));
      }
      // YES 标签 — 放在节点下方的 YES 连线上
      var yesY = (i < CYS.length - 1) ? (cy + CYS[i + 1]) / 2 : 678;
      var yl = el('text', { x: SPINE + 10, y: yesY, 'class': 'flow-yes-label' });
      yl.textContent = 'YES ↓';
      svg.appendChild(yl);

      // NO 分支线 → 右侧退出
      svg.appendChild(line(SPINE + 120, cy, EXIT_X - 80, cy, 'no draw-path'));
      var nl = el('text', { x: SPINE + 132, y: cy - 6, 'class': 'flow-no-label' });
      nl.textContent = 'NO';
      svg.appendChild(nl);

      // 决策节点
      var g = el('g', { 'class': 'flow-node', 'data-flow': i });
      g.appendChild(el('rect', { 'class': 'rect', x: SPINE - 120, y: cy - 30, width: 240, height: 60, rx: 12 }));
      var zh = el('text', { x: SPINE, y: cy - 2, 'text-anchor': 'middle', 'class': 'label zh' });
      zh.textContent = d.title;
      g.appendChild(zh);
      var en = el('text', { x: SPINE, y: cy + 14, 'text-anchor': 'middle', 'class': 'label en' });
      en.textContent = d.en;
      g.appendChild(en);
      svg.appendChild(g);

      // 右侧退出 pill
      var ex = el('g', { 'class': 'flow-exit-node' });
      ex.appendChild(el('rect', { 'class': 'rect', x: EXIT_X - 80, y: cy - 18, width: 160, height: 36, rx: 10 }));
      var exl = el('text', { x: EXIT_X, y: cy + 4, 'text-anchor': 'middle', 'class': 'label zh' });
      exl.textContent = '退出讨论';
      ex.appendChild(exl);
      svg.appendChild(ex);
    });

    /* 底部结果：继续 / 退出 */
    svg.appendChild(line(SPINE, CYS[4] + 34, SPINE, 714 - 26, 'yes draw-path'));
    var ok = el('g', { 'class': 'flow-outcome' });
    ok.appendChild(el('rect', { 'class': 'rect', x: SPINE - 100, y: 690, width: 200, height: 48, rx: 12 }));
    var okl = el('text', { x: SPINE, y: 719, 'text-anchor': 'middle', 'class': 'label zh' });
    okl.textContent = '✓ 继续讨论';
    ok.appendChild(okl);
    svg.appendChild(ok);

    var ko = el('g', { 'class': 'flow-exit-node outcome2' });
    ko.appendChild(el('rect', { 'class': 'rect', x: EXIT_X - 100, y: 690, width: 200, height: 48, rx: 12 }));
    var kol = el('text', { x: EXIT_X, y: 719, 'text-anchor': 'middle', 'class': 'label zh' });
    kol.textContent = '✕ 退出讨论';
    ko.appendChild(kol);
    svg.appendChild(ko);

    wrap.appendChild(svg);

    /* 交互：点击节点 → 高亮 + 右侧说明 */
    var nodes = wrap.querySelectorAll('.flow-node[data-flow]');
    function render(i) {
      var d = FLOW[i];
      var html = '<h4><span class="num">' + d.num + '</span> ' + d.title + '</h4><p>' + d.body + '</p>';
      d.checks.forEach(function (c) { html += '<div class="check">' + c + '</div>'; });
      detail.innerHTML = html;
    }
    nodes.forEach(function (n) {
      n.addEventListener('click', function () {
        nodes.forEach(function (x) { x.classList.remove('active'); });
        n.classList.add('active');
        render(parseInt(n.getAttribute('data-flow'), 10));
      });
    });

    /* 描线动画：进入视口后触发 */
    function drawn() { wrap.classList.add('drawn'); }
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { drawn(); io.disconnect(); } });
      }, { threshold: 0.25 });
      io.observe(wrap);
    } else {
      drawn();
    }
  }

  DQF.register(build);
})();
