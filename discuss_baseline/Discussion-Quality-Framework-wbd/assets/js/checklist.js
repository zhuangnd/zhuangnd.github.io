/* =============================================================
   DQF · checklist.js — 讨论自检清单与实时评分
   -------------------------------------------------------------
   六条自检项，勾选后实时计算 Discussion Quality 百分比。
   数字用 rAF 缓动滚动，进度环与评级同步联动。
   依赖：window.DQF
   导出：window.DQFChecklist
   ============================================================= */
(function () {
  'use strict';

  var ITEMS = [
    { key: 'concept',  t: '概念一致',   d: '双方讨论的是同一个对象，关键词含义已经对齐。' },
    { key: 'standard', t: '标准一致',   d: '双方采用同一套评价标准，没有中途更换。' },
    { key: 'evidence', t: '事实可靠',   d: '引用的数据有来源、样本与统计方法，不是印象。' },
    { key: 'logic',    t: '推理成立',   d: '每一步推导都能站住，没有跳步、偷换或循环论证。' },
    { key: 'gain',     t: '获得认知',   d: '至少有一方学到了新事实、发现了新角度或修正了旧判断。' },
    { key: 'worth',    t: '值得继续',   d: '继续讨论仍有可能产生新的信息，而不是重复立场。' }
  ];

  /* 0..6 档评级 */
  var GRADES = [
    { g: 'Not started', cn: '尚未开始', tip: '勾选左侧条目开始评估。',                     c: 'var(--text-faint)' },
    { g: 'Fragile',     cn: '基础薄弱', tip: '基础层尚未立住，此时下结论为时过早。',        c: 'var(--red)' },
    { g: 'Fragile',     cn: '基础薄弱', tip: '概念或标准仍不一致，先补这两层。',            c: 'var(--red)' },
    { g: 'Fair',        cn: '尚需补齐', tip: '过半通过，但仍有关键一层没对齐。',            c: 'var(--accent)' },
    { g: 'Good',        cn: '基本合格', tip: '讨论结构完整，可以继续推进到结论层。',        c: 'var(--accent)' },
    { g: 'Strong',      cn: '质量良好', tip: '只剩一项未确认，补上即为完整的高质量讨论。',  c: 'var(--green)' },
    { g: 'Complete',    cn: '完整',     tip: '六项全部通过：这是一场教科书式的讨论。',      c: 'var(--green)' }
  ];

  var CIRC = 2 * Math.PI * 74;   // = 464.96，与 index.html 中的 dasharray 一致

  var state = [false, false, false, false, false, false];
  var raf = null;
  var shown = 0;

  /* ---------------- 数字缓动 ---------------- */
  function countTo(target) {
    var numEl = document.getElementById('chkNum');
    if (!numEl) return;
    if (raf) cancelAnimationFrame(raf);

    var from = shown;
    var start = performance.now();
    var dur = 480;

    function step(now) {
      var p = Math.min(1, (now - start) / dur);
      var e = 1 - Math.pow(1 - p, 3);            // easeOutCubic
      var v = Math.round(from + (target - from) * e);
      numEl.textContent = v;
      if (p < 1) {
        raf = requestAnimationFrame(step);
      } else {
        shown = target;
        numEl.parentElement.classList.add('num-pop');
        setTimeout(function () {
          if (numEl.parentElement) numEl.parentElement.classList.remove('num-pop');
        }, 340);
      }
    }
    raf = requestAnimationFrame(step);
  }

  /* ---------------- 渲染 ---------------- */
  function render() {
    var n = state.filter(Boolean).length;
    var pct = Math.round((n / ITEMS.length) * 100);
    var meta = GRADES[n];

    var ring = document.getElementById('chkRing');
    if (ring) {
      ring.style.strokeDasharray = CIRC;
      ring.style.strokeDashoffset = CIRC * (1 - pct / 100);
      ring.style.stroke = meta.c;
    }

    countTo(pct);

    var gEl = document.getElementById('chkGrade');
    if (gEl) {
      gEl.textContent = meta.g + ' · ' + meta.cn;
      gEl.style.color = meta.c;
    }

    var tEl = document.getElementById('chkTip');
    if (tEl) tEl.textContent = meta.tip;

    // 未勾选项提示
    if (n > 0 && n < ITEMS.length) {
      var miss = ITEMS.filter(function (_, i) { return !state[i]; })
                      .map(function (it) { return it.t; });
      if (tEl) tEl.textContent = meta.tip + ' 待补齐：' + miss.join('、') + '。';
    }
  }

  function build() {
    var box = document.getElementById('chkList');
    if (!box) return;

    box.innerHTML = ITEMS.map(function (it, i) {
      return '' +
        '<label class="chk__item" data-i="' + i + '">' +
          '<span class="chk__box">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7"/></svg>' +
          '</span>' +
          '<span>' +
            '<span class="chk__t">' + it.t + '</span>' +
            '<span class="chk__d">' + it.d + '</span>' +
          '</span>' +
        '</label>';
    }).join('');

    box.querySelectorAll('.chk__item').forEach(function (el) {
      var i = +el.dataset.i;
      el.addEventListener('click', function (e) {
        e.preventDefault();
        state[i] = !state[i];
        el.classList.toggle('is-on', state[i]);
        render();
      });
    });

    var reset = document.getElementById('chkReset');
    if (reset) {
      reset.addEventListener('click', function () {
        state = state.map(function () { return false; });
        box.querySelectorAll('.chk__item').forEach(function (el) {
          el.classList.remove('is-on');
        });
        render();
      });
    }
  }

  window.DQFChecklist = {
    items: ITEMS,
    init: function () {
      build();
      render();
    },
    /* 供案例分析一键带入 */
    preset: function (arr) {
      state = ITEMS.map(function (it) { return arr.indexOf(it.key) > -1; });
      var box = document.getElementById('chkList');
      if (box) {
        box.querySelectorAll('.chk__item').forEach(function (el) {
          el.classList.toggle('is-on', state[+el.dataset.i]);
        });
      }
      render();
    }
  };
})();
