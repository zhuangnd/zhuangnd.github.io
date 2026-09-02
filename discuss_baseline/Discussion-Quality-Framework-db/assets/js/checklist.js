/* ============================================================
   checklist.js — Checklist 实时评分
   Discussion Quality Framework
   职责：渲染 6 条讨论质量自检项，点击勾选后实时计算得分、
        CountUp 数字动画、进度条、等级与建议联动。
   ============================================================ */
(function () {
  "use strict";

  var DQF = window.DQF || (window.DQF = { init: [] });

  var ITEMS = [
    { q: '明确讨论对象', d: '双方清楚"我们在讨论什么"吗？' },
    { q: '定义关键概念', d: '关键术语是否已统一定义？' },
    { q: '明确评价标准', d: '判断对错 / 好坏的标准是否清楚？' },
    { q: '核实事实依据', d: '所依赖的事实是否可靠、可验证？' },
    { q: '检查逻辑链条', d: '推理是否连贯，有无跳步或偷换？' },
    { q: '评估认知增量', d: '讨论是否产生了新的认知？' }
  ];

  function render() {
    var list = document.getElementById('checkList');
    if (!list) return;
    var html = '';
    ITEMS.forEach(function (it, i) {
      html +=
        '<label class="check-item" data-i="' + i + '">' +
          '<input type="checkbox">' +
          '<span class="check-box">✓</span>' +
          '<span class="txt"><b>' + it.q + '</b><span>' + it.d + '</span></span>' +
        '</label>';
    });
    list.innerHTML = html;

    var numEl = document.getElementById('scoreNum');
    var labelEl = document.getElementById('scoreLabel');
    var barEl = document.getElementById('scoreBar');
    var advEl = document.getElementById('scoreAdvice');
    var dotsEl = document.getElementById('scoreDots');
    var count = 0;

    function labelFor(n) {
      if (n === 0) return { t: '尚未开始', cls: 'mid', adv: '逐条勾选你已做到的检查项，开始评估这场讨论的质量。' };
      if (n <= 2) return { t: '有待提升 · LOW', cls: 'bad', adv: '讨论基础较弱，建议回到“概念定义”与“标准约束”再对齐。' };
      if (n <= 4) return { t: '中等 · FAIR', cls: 'mid', adv: '有讨论基础，但仍有薄弱环节，优先补上未勾选的检查项。' };
      if (n === 5) return { t: '良好 · GOOD', cls: 'good', adv: '讨论质量较高，注意最后一个环节：评估认知增量是否达成。' };
      return { t: '优秀 · EXCELLENT', cls: 'good', adv: '六个维度全部就位，这是一场高质量讨论。' };
    }

    function countUp(from, to, dur) {
      var start = null;
      var done = false;
      function finish() {
        if (done) return;
        done = true;
        numEl.innerHTML = to + '<small>/6</small>';
      }
      function step(ts) {
        if (done) return;
        if (!start) start = ts;
        var p = Math.min(1, (ts - start) / (dur || 500));
        numEl.innerHTML = Math.round(from + (to - from) * p) + '<small>/6</small>';
        if (p < 1) requestAnimationFrame(step);
        else done = true;
      }
      requestAnimationFrame(step);
      // 兜底：无论 rAF 是否被节流，最终一定落到目标值
      setTimeout(finish, (dur || 500) + 120);
    }

    function update() {
      var n = 0;
      list.querySelectorAll('.check-item input:checked').forEach(function () { n++; });
      var lv = labelFor(n);
      countUp(count, n, 420);
      count = n;
      labelEl.textContent = lv.t;
      advEl.className = 'score-advice ' + lv.cls;
      advEl.innerHTML = lv.t === '优秀 · EXCELLENT' ? '<b>' + lv.t + '</b>　' + lv.adv : '<b>' + lv.t + '</b>　' + lv.adv;
      barEl.style.width = (n / ITEMS.length * 100) + '%';
      var dots = '';
      for (var i = 0; i < ITEMS.length; i++) dots += '<i class="' + (i < n ? 'on' : '') + '"></i>';
      dotsEl.innerHTML = dots;
    }

    list.addEventListener('click', function (e) {
      var item = e.target.closest ? e.target.closest('.check-item') : null;
      if (item) {
        var box = item.querySelector('input');
        box.checked = !box.checked;
        item.classList.toggle('checked', box.checked);
        update();
      }
    });
    update();
  }

  DQF.register(render);
})();
