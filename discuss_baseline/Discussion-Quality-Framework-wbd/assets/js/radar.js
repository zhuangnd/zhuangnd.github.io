/* =============================================================
   DQF · radar.js — D3 雷达图 + 独立雷达模块
   -------------------------------------------------------------
   职责：
     1. drawRadar(svgEl, values) — 通用雷达绘制，被诊断器与本模块共用
     2. 独立雷达区：五个滑块 + 预设，实时更新图形与诊断建议
   依赖：D3 v7、window.DQF
   导出：window.DQFRadar
   ============================================================= */
(function () {
  'use strict';

  var DIMS = [
    { key: 'concept',  cn: '概念', color: 'var(--c-concept)' },
    { key: 'standard', cn: '标准', color: 'var(--c-standard)' },
    { key: 'evidence', cn: '事实', color: 'var(--c-evidence)' },
    { key: 'logic',    cn: '逻辑', color: 'var(--c-logic)' },
    { key: 'gain',     cn: '认知', color: 'var(--c-gain)' }
  ];

  var SIZE = 360, R = 108, CX = 180, CY = 172, MAX = 5;

  function angle(i) {
    return (Math.PI * 2 * i) / DIMS.length - Math.PI / 2;
  }
  function pt(i, v) {
    var a = angle(i);
    var r = (R * Math.max(0, Math.min(MAX, v))) / MAX;
    return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
  }

  /* ---------------- 通用绘制 ---------------- */
  function drawRadar(svgEl, values) {
    if (!svgEl || !window.d3) return false;

    svgEl.setAttribute('viewBox', '0 0 ' + SIZE + ' ' + (CY + R + 34));
    svgEl.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    var svg = d3.select(svgEl);
    svg.selectAll('*').remove();

    /* 同心多边形网格 */
    var g = svg.append('g');
    d3.range(1, MAX + 1).forEach(function (lv) {
      var pts = DIMS.map(function (_, i) { return pt(i, lv).join(','); }).join(' ');
      g.append('polygon')
        .attr('class', 'radar__grid')
        .attr('points', pts)
        .style('opacity', lv === MAX ? 0.85 : 0.4);
    });

    /* 轴线 + 轴标签 */
    DIMS.forEach(function (d, i) {
      var p = pt(i, MAX);
      g.append('line')
        .attr('class', 'radar__axis')
        .attr('x1', CX).attr('y1', CY)
        .attr('x2', p[0]).attr('y2', p[1]);

      var lp = pt(i, MAX + 1.05);
      g.append('text')
        .attr('class', 'radar__label')
        .attr('x', lp[0]).attr('y', lp[1] + 4)
        .attr('text-anchor', 'middle')
        .style('fill', d.color)
        .text(d.cn);
    });

    /* 刻度 */
    d3.range(1, MAX + 1).forEach(function (lv) {
      g.append('text')
        .attr('class', 'radar__scale')
        .attr('x', CX + 4).attr('y', CY - (R * lv) / MAX + 3)
        .text(lv);
    });

    /* 数据区域 */
    var area = DIMS.map(function (d, i) {
      return pt(i, values[d.key] || 0).join(',');
    }).join(' ');

    svg.append('polygon')
      .attr('class', 'radar__area')
      .attr('points', area);

    DIMS.forEach(function (d, i) {
      var p = pt(i, values[d.key] || 0);
      svg.append('circle')
        .attr('class', 'radar__pt')
        .attr('cx', p[0]).attr('cy', p[1]).attr('r', 3.4)
        .style('fill', d.color);
    });

    return true;
  }

  /* ---------------- 诊断建议 ---------------- */
  var ADVICE = {
    concept:  '概念定义最弱：先停下来统一「我们在说什么」，再往下谈。',
    standard: '标准约束最弱：分歧可能来自评价函数不同，先协商「按什么判断」。',
    evidence: '事实依据最弱：论点缺少可核对的来源，把「我觉得」换成数据。',
    logic:    '逻辑遵循最弱：把推理链条逐步摊开，检查跳步与相关/因果混淆。',
    gain:     '认知增量最弱：讨论没有产生新信息，考虑结束或换一个切入角度。'
  };

  function advise(values) {
    var worst = null, wv = 99, sum = 0;
    DIMS.forEach(function (d) {
      var v = values[d.key] || 0;
      sum += v;
      if (v < wv) { wv = v; worst = d.key; }
    });
    var avg = sum / DIMS.length;

    if (avg >= 4.4) return '五维均衡且饱满，这是一场高质量讨论。保持这个状态。';
    if (avg <= 1.6) return '五个维度全面塌陷，当前更像立场表达而非讨论。建议先补概念与标准。';
    return ADVICE[worst] || '';
  }

  /* ---------------- 独立雷达区 ---------------- */
  var state = { concept: 3, standard: 3, evidence: 2, logic: 3, gain: 3 };

  var PRESETS = [
    { name: '理想讨论', v: { concept: 5, standard: 5, evidence: 5, logic: 5, gain: 5 } },
    { name: '学术讨论', v: { concept: 5, standard: 4, evidence: 5, logic: 5, gain: 4 } },
    { name: '工作决策', v: { concept: 3, standard: 3, evidence: 2, logic: 3, gain: 3 } },
    { name: '日常闲聊', v: { concept: 2, standard: 2, evidence: 1, logic: 2, gain: 2 } },
    { name: '网络争论', v: { concept: 1, standard: 1, evidence: 1, logic: 2, gain: 1 } }
  ];

  function buildControls() {
    var box = document.getElementById('radarSliders');
    if (!box) return;

    box.innerHTML = DIMS.map(function (d) {
      return '' +
        '<label class="radar__sl" style="--sl-color:' + d.color + '">' +
          '<span>' + d.cn + '</span>' +
          '<input type="range" min="0" max="5" step="1" value="' + state[d.key] + '" data-k="' + d.key + '">' +
          '<span class="mono" data-v="' + d.key + '">' + state[d.key] + '</span>' +
        '</label>';
    }).join('');

    box.querySelectorAll('input[type="range"]').forEach(function (inp) {
      inp.addEventListener('input', function () {
        state[inp.dataset.k] = +inp.value;
        box.querySelector('[data-v="' + inp.dataset.k + '"]').textContent = inp.value;
        refresh();
      });
    });

    var ps = document.getElementById('radarPresets');
    if (ps) {
      ps.innerHTML = PRESETS.map(function (p, i) {
        return '<button class="btn btn--sm' + (i === 0 ? '' : ' btn--ghost') +
               '" type="button" data-p="' + i + '">' + p.name + '</button>';
      }).join('');
      ps.querySelectorAll('[data-p]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var p = PRESETS[+btn.dataset.p];
          DIMS.forEach(function (d) { state[d.key] = p.v[d.key]; });
          syncSliders();
          refresh();
        });
      });
    }
  }

  function syncSliders() {
    var box = document.getElementById('radarSliders');
    if (!box) return;
    DIMS.forEach(function (d) {
      var inp = box.querySelector('input[data-k="' + d.key + '"]');
      if (inp) inp.value = state[d.key];
      var v = box.querySelector('[data-v="' + d.key + '"]');
      if (v) v.textContent = state[d.key];
    });
  }

  function refresh() {
    drawRadar(document.getElementById('radarSvg'), state);
    var tip = document.getElementById('radarTip');
    if (tip) tip.textContent = advise(state);
  }

  window.DQFRadar = {
    dims: DIMS,
    draw: drawRadar,
    advise: advise,
    init: function () {
      buildControls();
      refresh();
    },
    /* 供案例分析调用：把案例数据灌进独立雷达 */
    load: function (values) {
      DIMS.forEach(function (d) {
        if (values[d.key] !== undefined) state[d.key] = values[d.key];
      });
      syncSliders();
      refresh();
    }
  };
})();
