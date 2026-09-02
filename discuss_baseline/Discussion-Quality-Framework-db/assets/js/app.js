/* ============================================================
   app.js — 应用入口与核心交互
   Discussion Quality Framework
   职责：命名空间注册 / 滚动进度 / Scroll Reveal / Hero 粒子
        / Hero 中央流程 / 框架总览 / 讨论宽容度 Slider / 退出决策树
   ============================================================ */
(function () {
  "use strict";

  var DQF = window.DQF || (window.DQF = { init: [] });
  DQF.register = function (fn) { DQF.init.push(fn); };

  /* ---------- 1. 滚动进度条 ---------- */
  DQF.register(function () {
    var bar = document.getElementById('scrollProgress');
    if (!bar) return;
    function upd() {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      var p = max > 0 ? h.scrollTop / max : 0;
      bar.style.transform = 'scaleX(' + p + ')';
    }
    window.addEventListener('scroll', upd, { passive: true });
    window.addEventListener('resize', upd);
    upd();
  });

  /* ---------- 2. Scroll Reveal ---------- */
  DQF.register(function () {
    var io;
    function observe(el) { if (io) io.observe(el); else el.classList.add('visible'); }
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            io.unobserve(e.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    }
    // 供动态渲染的模块（如 cards.js）对新增元素重新观察
    DQF.reObserve = function (root) {
      if (!root) return;
      root.querySelectorAll('.reveal:not(.visible)').forEach(observe);
    };
    var els = document.querySelectorAll('.reveal');
    if (!io) { els.forEach(function (el) { el.classList.add('visible'); }); return; }
    els.forEach(observe);
  });

  /* ---------- 3. Hero 粒子背景（Canvas，轻量） ---------- */
  DQF.register(function () {
    var canvas = document.getElementById('particles');
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var W, H, parts = [];
    var COLORS = ['245,158,11', '96,165,250', '255,255,255'];

    function resize() {
      var r = canvas.parentNode.getBoundingClientRect();
      W = canvas.width = r.width;
      H = canvas.height = r.height;
    }
    function make() {
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.8 + .4,
        vx: (Math.random() - .5) * .35,
        vy: (Math.random() - .5) * .3 - .05,
        c: COLORS[Math.floor(Math.random() * COLORS.length)],
        a: Math.random() * .5 + .15
      };
    }
    function tick() {
      ctx.clearRect(0, 0, W, H);
      parts.forEach(function (p) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = W + 10;
        if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10;
        if (p.y > H + 10) p.y = -10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + p.c + ',' + p.a + ')';
        ctx.fill();
      });
      requestAnimationFrame(tick);
    }
    window.addEventListener('resize', resize);
    resize();
    var count = Math.min(60, Math.max(20, Math.floor(W / 24)));
    for (var i = 0; i < count; i++) parts.push(make());
    // 低功耗设备 / 减少动态偏好时暂停
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    tick();
  });

  /* ---------- 4. Hero 中央动态流程（交错发光） ---------- */
  DQF.register(function () {
    var chain = document.getElementById('heroChain');
    if (!chain) return;
    var nodes = chain.querySelectorAll('.chain-node');
    var links = chain.querySelectorAll('.chain-link');
    var started = false;
    function start() {
      if (started) return;
      started = true;
      nodes.forEach(function (n, i) {
        setTimeout(function () { n.classList.add('on'); }, 150 + i * 260);
      });
      links.forEach(function (l, i) {
        setTimeout(function () { l.classList.add('flow'); }, 340 + i * 260);
      });
    }
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { start(); io.disconnect(); } });
      }, { threshold: 0.2 });
      io.observe(chain);
    } else {
      start();
    }
  });

  /* ---------- 5. 框架总览（可点击节点） ---------- */
  DQF.register(function () {
    var data = [
      { title: '讨论', tag: '起点', desc: '一切分析从这里开始。判断一次对话是否值得投入，先看能否回答接下来的每一步。' },
      { title: '概念定义', tag: '对象', desc: '本质是确定讨论对象。若双方对象不同，所有后续推理都建立在不同对象上。例："AI 会取代程序员"需先定义 AI、取代、程序员。' },
      { title: '标准约束', tag: '评价函数', desc: '本质是确定评价函数。标准不同时双方都可能正确——不是事实冲突，而是评价体系不同。没有评价函数，就不存在统一结论。' },
      { title: '事实依据', tag: '前提', desc: '保证前提真实。即使定义、标准、逻辑都对，事实错了结论依然会错。逻辑只保证"前提为真则结论成立"，不能保证前提本身真实。' },
      { title: '逻辑遵循', tag: '推理', desc: '保证推理有效。中间每一步都需要证明：不跳步、不偷换、不循环论证、不把相关当因果。' },
      { title: '认知增量', tag: '收益', desc: '评估讨论是否产生了新的信息、新的理解或更清晰的问题。这是整个流程的"收益评估"。' },
      { title: '继续讨论', tag: 'YES', desc: '定义可统一、标准可协商、新证据可能出现、逻辑可修正——继续讨论有收益。' },
      { title: '停止讨论', tag: 'NO', desc: '价值观不同、标准不同且不接受修改、没有新事实、只重复观点、已进入情绪表达——继续的边际收益接近零。' }
    ];
    var detail = document.querySelector('.ov-detail');
    var nodes = document.querySelectorAll('.ov-node[data-ov]');
    if (!detail) return;
    function render(i) {
      var d = data[i];
      detail.innerHTML = '<h4>' + d.title + ' <span class="tag">' + d.tag + '</span></h4><p>' + d.desc + '</p>';
    }
    nodes.forEach(function (n) {
      n.addEventListener('click', function () {
        nodes.forEach(function (x) { x.classList.remove('active'); });
        n.classList.add('active');
        render(parseInt(n.getAttribute('data-ov'), 10));
      });
    });
  });

  /* ---------- 6. 讨论宽容度（Precision Slider） ---------- */
  DQF.register(function () {
    var levels = [
      { name: '闲聊', sub: '快速交流 · 分享观点 · 娱乐', tol: 1, dims: { concept: 2, standard: 3, evidence: 1, logic: 2 } },
      { name: '工作讨论', sub: '一般交流 · 建立共识', tol: .78, dims: { concept: 3, standard: 3, evidence: 3, logic: 3 } },
      { name: '技术讨论', sub: '工作决策 · 技术评审', tol: .5, dims: { concept: 4, standard: 4, evidence: 4, logic: 4 } },
      { name: '科研论文', sub: '学术研究 · 可验证可复现', tol: .24, dims: { concept: 5, standard: 5, evidence: 5, logic: 5 } },
      { name: '数学证明', sub: '接近严格证明 · 几乎零容忍', tol: .06, dims: { concept: 5, standard: 5, evidence: 5, logic: 5 } }
    ];
    var tolTxt = ['极大', '较大', '中等', '小', '极小'];
    var dimMeta = [
      { key: 'concept', name: '概念定义' },
      { key: 'standard', name: '标准约束' },
      { key: 'evidence', name: '事实依据' },
      { key: 'logic', name: '逻辑遵循' }
    ];
    function reqFor(key, n) {
      if (key === 'concept') return n <= 2 ? '可模糊' : n === 3 ? '需明确' : n === 4 ? '需精确定义' : '必须操作性定义';
      if (key === 'standard') return n <= 2 ? '可隐含' : n === 3 ? '需明确' : n === 4 ? '需显式标准' : '必须说明指标与权重';
      if (key === 'evidence') return n <= 2 ? '接受经验常识' : n === 3 ? '需较可靠' : n === 4 ? '需可验证' : '必须可复现、可溯源';
      return n <= 2 ? '允许跳步' : n === 3 ? '需较完整' : n === 4 ? '需严谨' : '几乎零容忍';
    }
    function stars(n) {
      var s = '';
      for (var i = 1; i <= 5; i++) s += '<span class="' + (i <= n ? 'on' : '') + '">★</span>';
      return s;
    }
    var range = document.getElementById('pRange');
    if (!range) return;
    var levelEl = document.getElementById('pLevel');
    var tolEl = document.getElementById('pTol');
    var tolTxtEl = document.getElementById('pTolTxt');
    var dimsEl = document.getElementById('pDims');
    function render() {
      var idx = Math.round(range.value / 25);
      var lv = levels[idx];
      levelEl.innerHTML = lv.name + '<small>' + lv.sub + '</small>';
      tolEl.style.width = (lv.tol * 100) + '%';
      tolTxtEl.textContent = '容忍误差：' + tolTxt[idx];
      range.style.setProperty('--fill', (idx * 25) + '%');
      var html = '';
      dimMeta.forEach(function (dm) {
        var n = lv.dims[dm.key];
        html += '<div class="p-dim"><div class="row"><span class="name">' + dm.name +
                '</span><span class="req">' + reqFor(dm.key, n) + '</span></div>' +
                '<div class="stars">' + stars(n) + '</div></div>';
      });
      dimsEl.innerHTML = html;
    }
    range.addEventListener('input', render);
    render();
  });

  /* ---------- 7. 是否退出讨论（决策树） ---------- */
  DQF.register(function () {
    var nodes = document.querySelectorAll('.dt-node');
    var result = document.getElementById('dtResult');
    var resetBtn = document.getElementById('dtReset');
    if (!result) return;
    var chosen = [];
    function reset() {
      chosen = [];
      nodes.forEach(function (n) {
        n.querySelectorAll('.dt-btn').forEach(function (b) { b.classList.remove('chosen-yes', 'chosen-no'); });
      });
      result.className = 'dt-result';
      result.innerHTML = '<div class="big">选择路径开始判断</div><div class="sub">逐题点击 YES / NO，追踪你的决策路径。</div>';
    }
    nodes.forEach(function (n) {
      n.querySelectorAll('.dt-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          n.querySelectorAll('.dt-btn').forEach(function (b) { b.classList.remove('chosen-yes', 'chosen-no'); });
          var isYes = btn.classList.contains('yes');
          btn.classList.add(isYes ? 'chosen-yes' : 'chosen-no');
          chosen[parseInt(n.getAttribute('data-dt'), 10)] = isYes;
          var last = chosen.length - 1;
          if (chosen[last]) {
            result.className = 'dt-result go';
            result.innerHTML = '<div class="big">继续讨论</div><div class="sub">还有进一步增加认知的可能，继续有收益。</div>';
          } else {
            result.className = 'dt-result stop';
            result.innerHTML = '<div class="big">停止讨论</div><div class="sub">继续讨论的边际收益接近零。退出 ≠ 认输，而是理性的认知决策。</div>';
          }
        });
      });
    });
    if (resetBtn) resetBtn.addEventListener('click', reset);
  });

  /* ---------- 启动 ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    DQF.init.forEach(function (fn) {
      try { fn(); } catch (e) { if (window.console) console.error('[DQF]', e); }
    });
  });
})();
