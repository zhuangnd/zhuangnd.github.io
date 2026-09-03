/* =============================================================
   DQF · app.js — 公共工具 + 主编排
   -------------------------------------------------------------
   职责：
     1. window.DQF 命名空间与工具函数（stars / scrollspy 等）
     2. Hero 粒子背景（Canvas）
     3. 框架总览、精度滑块、认知增量、退出判断、时间线、思维原则
     4. 导航 / 主题 / 滚动 Reveal / 回到顶部
     5. DOMContentLoaded 时统一调度各子模块
   加载顺序：本文件最后加载，因此各子模块此时已注册完毕。
   ============================================================= */
(function () {
  'use strict';

  /* =========================================================
     一、公共工具与共享数据
     ========================================================= */
  var DQF = {};

  /* ---------- 精度等级数据（7 档） ---------- */
  DQF.PRECISION = [
    {
      name: '闲聊', en: 'Casual', cost: '极低', tol: 88,
      stars: { concept: 2, standard: 2, evidence: 1, logic: 2, gain: 1 },
      req: {
        concept: '大致理解一致即可，不必追问每个词的含义。',
        standard: '默认社会共识，无需说明依据。',
        evidence: '个人感受与印象即可。',
        logic: '允许直觉跳跃，不必给出完整推导。'
      }
    },
    {
      name: '一般交流', en: 'Everyday', cost: '低', tol: 62,
      stars: { concept: 2, standard: 3, evidence: 1, logic: 2, gain: 2 },
      req: {
        concept: '大致理解一致即可，遇到明显歧义再澄清。',
        standard: '可默认社会共识，出现分歧时再议。',
        evidence: '可凭经验、常识与身边案例。',
        logic: '允许略去中间推导，交流成本优先。'
      }
    },
    {
      name: '工作决策', en: 'Work Decision', cost: '中', tol: 42,
      stars: { concept: 3, standard: 3, evidence: 2, logic: 3, gain: 3 },
      req: {
        concept: '关键术语需要当场确认含义。',
        standard: '重要判断需要说明依据。',
        evidence: '关键数字必须能说清来源。',
        logic: '关键结论需要给出理由。'
      }
    },
    {
      name: '技术评审', en: 'Tech Review', cost: '高', tol: 26,
      stars: { concept: 4, standard: 4, evidence: 3, logic: 4, gain: 4 },
      req: {
        concept: '核心概念需要给出明确定义。',
        standard: '需明确评价指标与适用范围。',
        evidence: '需引用数据，并说明样本与来源。',
        logic: '需完整推导，说明成立条件。'
      }
    },
    {
      name: '学术研究', en: 'Academic', cost: '很高', tol: 14,
      stars: { concept: 5, standard: 5, evidence: 5, logic: 5, gain: 5 },
      req: {
        concept: '必须给出可操作定义，并说明适用边界。',
        standard: '需说明指标、权重与选择理由，可被复核。',
        evidence: '需可验证、可复现，说明统计方法。',
        logic: '需逐步论证，主动检查反例。'
      }
    },
    {
      name: '法律裁判', en: 'Legal', cost: '极高', tol: 6,
      stars: { concept: 5, standard: 5, evidence: 5, logic: 5, gain: 5 },
      req: {
        concept: '定义需成文、可援引，不依赖语境。',
        standard: '标准需成文、可援引、可复核。',
        evidence: '需完整证据链，注明偏差与局限。',
        logic: '不得跳步，须排除替代解释。'
      }
    },
    {
      name: '数学证明', en: 'Proof', cost: '最高', tol: 1,
      stars: { concept: 5, standard: 5, evidence: 5, logic: 5, gain: 5 },
      req: {
        concept: '概念需形式化定义，边界完全确定。',
        standard: '评价函数需预先固定，全程不可变更。',
        evidence: '仅接受公理与已证命题。',
        logic: '每一步须由既定规则严格导出。'
      }
    }
  ];

  /* ---------- 星级 HTML ---------- */
  DQF.stars = function (n, max, cls) {
    max = max || 5;
    var s = '<span class="stars' + (cls ? ' ' + cls : '') + '">';
    for (var i = 0; i < max; i++) {
      s += '<i class="' + (i < n ? 'on' : '') + '"></i>';
    }
    return s + '</span>';
  };

  DQF.$ = function (sel, root) {
    return (root || document).querySelector(sel);
  };
  DQF.$$ = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };

  DQF.reducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  window.DQF = DQF;

  /* =========================================================
     二、Hero 粒子背景
     ========================================================= */
  function initHeroCanvas() {
    var cv = document.getElementById('heroCanvas');
    if (!cv || DQF.reducedMotion) return;

    var ctx = cv.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = 0, h = 0;
    var dots = [];
    var raf = null;
    var visible = true;

    function css(name, fallback) {
      var v = getComputedStyle(document.documentElement).getPropertyValue(name);
      return (v && v.trim()) || fallback;
    }

    function resize() {
      var r = cv.getBoundingClientRect();
      w = r.width; h = r.height;
      cv.width = w * dpr;
      cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function seed() {
      var n = Math.round(Math.min(64, Math.max(26, (w * h) / 22000)));
      dots = [];
      for (var i = 0; i < n; i++) {
        dots.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.16,
          vy: (Math.random() - 0.5) * 0.16,
          r: Math.random() * 1.3 + 0.5
        });
      }
    }

    function frame() {
      if (!visible) { raf = requestAnimationFrame(frame); return; }

      ctx.clearRect(0, 0, w, h);
      var accent = css('--accent', '#F59E0B').trim();
      var border = css('--border-strong', 'rgba(255,255,255,.18)').trim();

      for (var i = 0; i < dots.length; i++) {
        var d = dots[i];
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0 || d.x > w) d.vx *= -1;
        if (d.y < 0 || d.y > h) d.vy *= -1;

        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = accent;
        ctx.globalAlpha = 0.30;
        ctx.fill();
      }

      // 近邻连线
      ctx.globalAlpha = 1;
      ctx.lineWidth = 0.6;
      for (var a = 0; a < dots.length; a++) {
        for (var b = a + 1; b < dots.length; b++) {
          var dx = dots[a].x - dots[b].x;
          var dy = dots[a].y - dots[b].y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 118) {
            ctx.beginPath();
            ctx.moveTo(dots[a].x, dots[a].y);
            ctx.lineTo(dots[b].x, dots[b].y);
            ctx.strokeStyle = border;
            ctx.globalAlpha = 0.5 * (1 - dist / 118);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    }

    function boot() {
      resize();
      seed();
      if (!raf) raf = requestAnimationFrame(frame);
    }

    window.addEventListener('resize', function () {
      resize();
      seed();
    });

    // 离开视口时暂停绘制
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        visible = es[0].isIntersecting;
      }, { threshold: 0 }).observe(cv);
    }

    boot();
  }

  /* =========================================================
     三、框架总览
     ========================================================= */
  var OVERVIEW = [
    {
      cn: '讨论', en: 'Discussion',
      q: '我们为什么在这里？',
      desc: '所有讨论的起点。开口之前先确认目标：是分享观点、做决策，还是求真。目标决定后面每一步该用多高的精度要求。',
      fail: '目标不清时，讨论会在「说服」与「求真」之间反复横跳。',
      fix: '先花十秒说清楚：这次讨论想要什么结果。'
    },
    {
      cn: '概念定义', en: 'Concept',
      q: '我们讨论的是同一个对象吗？',
      desc: '第一优先级。大量争论其实不是观点不同，而是对象不同。「AI 会取代程序员」里，AI 指什么、取代是什么意思、程序员包括谁，每一处都可能各说各的。',
      fail: '对象不一致时，后面所有推理都建立在不同前提上。',
      fix: '把关键词的定义说出来，直到双方指的是同一个东西。'
    },
    {
      cn: '标准约束', en: 'Standard',
      q: '依据什么判断？',
      desc: '第二步不是讨论事实，而是讨论「什么算成立」。按收入还是按影响力，按 MVP 还是按巅峰高度，评价函数不同，答案天然不同。',
      fail: '标准不同时双方都可能正确，讨论永远无法收敛。',
      fix: '把评价函数摊开：按什么指标、权重如何、适用什么范围。'
    },
    {
      cn: '事实依据', en: 'Evidence',
      q: '事实是真的吗？',
      desc: '逻辑只能保证「前提为真则结论成立」，它管不了前提本身的真假。因此事实必须作为独立的一层，而不是隐含在逻辑之中。',
      fail: '定义对、标准对、推理对，只要数据是假的，结论依然错。',
      fix: '追问来源、样本、统计方法与已知偏差。'
    },
    {
      cn: '逻辑遵循', en: 'Logic',
      q: '推理成立吗？',
      desc: '前三步都成立之后，才真正进入推理。「GDP 增长 → 收入增长 → 居民收入增长 → 所有居民都更富有」，中间每一环都是一次独立的主张。',
      fail: '跳一步，结论就悬空；偷换一次，讨论就偏离。',
      fix: '把链条逐步摊开，检查跳步、偷换、循环与相关／因果混淆。'
    },
    {
      cn: '认知增量', en: 'Cognitive Gain',
      q: '有没有人因此知道得更多？',
      desc: '整个框架的收益评估层。它不问「谁赢了」，而问「有没有增加认知」。新的认知不等于改变立场——发现自己的定义不准、意识到另一套标准、找到推理漏洞，都算。',
      fail: '没有认知增量的讨论，只是一次立场表演。',
      fix: '复述对方观点、指出真正的分歧点，把问题缩小。'
    },
    {
      cn: '继续？', en: 'Continue?',
      q: '还有继续的价值吗？',
      desc: '判断是否进入下一轮。看是否还有新证据、新角度，或还有哪一层的推理可以修正。',
      fail: '把「还没说服对方」误判成「还有必要继续」。',
      fix: '问一句：再来一轮，最可能新增什么？'
    },
    {
      cn: '停止', en: 'Stop',
      q: '为什么停下？',
      desc: '停止不是认输，而是判断当前讨论已不再具有信息增量。这是一次理性的资源分配决策。',
      fail: '把退出当成失败，于是用情绪替代论证，继续消耗双方。',
      fix: '明确记录：这次讨论沉淀了什么，分歧卡在哪一层。'
    }
  ];

  function initOverview() {
    var rail = document.getElementById('ovRail');
    var panel = document.getElementById('ovPanel');
    if (!rail || !panel) return;

    rail.innerHTML = OVERVIEW.map(function (n, i) {
      return '' +
        '<button class="ov__node" type="button" data-i="' + i + '">' +
          '<span class="ov__idx">' + (i === 0 ? '·' : i) + '</span>' +
          '<b>' + n.cn + '</b>' +
          '<small>' + n.en + '</small>' +
        '</button>';
    }).join('');

    function paint(i) {
      var n = OVERVIEW[i];
      panel.innerHTML =
        '<h3>' + (i === 0 ? '' : i + '. ') + n.cn + ' <span class="chip">' + n.en + '</span></h3>' +
        '<div class="q">' + n.q + '</div>' +
        '<p>' + n.desc + '</p>' +
        '<dl>' +
          '<div class="ov__row"><dt>失败后果</dt><dd>' + n.fail + '</dd></div>' +
          '<div class="ov__row"><dt>怎么修</dt><dd>' + n.fix + '</dd></div>' +
        '</dl>';
      rail.querySelectorAll('.ov__node').forEach(function (el) {
        el.classList.toggle('is-on', +el.dataset.i === i);
      });
    }

    rail.querySelectorAll('.ov__node').forEach(function (el) {
      el.addEventListener('click', function () { paint(+el.dataset.i); });
    });

    paint(1);
  }

  /* =========================================================
     四、讨论精度滑块
     ========================================================= */
  var PREC_ROWS = [
    { key: 'concept',  cn: '概念定义' },
    { key: 'standard', cn: '标准约束' },
    { key: 'evidence', cn: '事实依据' },
    { key: 'logic',    cn: '逻辑遵循' }
  ];

  function initPrecision() {
    var range = document.getElementById('precRange');
    if (!range) return;

    var ticks = document.getElementById('precTicks');
    var rows = document.getElementById('precRows');
    var notes = document.getElementById('precNotes');
    var nameEl = document.getElementById('precName');
    var idxEl = document.getElementById('precIdx');
    var tolVal = document.getElementById('tolVal');
    var tolFill = document.getElementById('tolFill');
    var pill = document.getElementById('navPill');

    /* 刻度 */
    if (ticks) {
      ticks.innerHTML = DQF.PRECISION.map(function (p, i) {
        return '<span class="slider__tick" data-i="' + i + '">' + p.name + '</span>';
      }).join('');
      ticks.querySelectorAll('.slider__tick').forEach(function (el) {
        el.addEventListener('click', function () {
          range.value = el.dataset.i;
          apply(+el.dataset.i);
        });
      });
    }

    /* 四行星级 */
    if (rows) rows.innerHTML = PREC_ROWS.map(function (r) {
      return '' +
        '<div class="prec__row">' +
          '<span>' + r.cn + '</span>' +
          '<span data-stars="' + r.key + '"></span>' +
          '<span class="mono" data-num="' + r.key + '"></span>' +
        '</div>';
    }).join('');

    /* 要求说明 */
    if (notes) notes.innerHTML = PREC_ROWS.map(function (r) {
      return '' +
        '<div class="prec__note">' +
          '<h4>' + r.cn + '</h4>' +
          '<p data-req="' + r.key + '"></p>' +
        '</div>';
    }).join('');

    function apply(idx) {
      var p = DQF.PRECISION[idx];

      if (nameEl) nameEl.textContent = p.name;
      if (idxEl) idxEl.textContent = 'Lv.' + (idx + 1) + ' / 7 · 讨论成本 ' + p.cost;
      if (pill) pill.textContent = p.name;

      range.style.setProperty('--fill', (idx / (DQF.PRECISION.length - 1)) * 100 + '%');

      if (ticks) {
        ticks.querySelectorAll('.slider__tick').forEach(function (el) {
          el.classList.toggle('is-on', +el.dataset.i === idx);
        });
      }

      if (rows) {
        PREC_ROWS.forEach(function (r) {
          var s = rows.querySelector('[data-stars="' + r.key + '"]');
          if (s) s.innerHTML = DQF.stars(p.stars[r.key], 5);
          var n = rows.querySelector('[data-num="' + r.key + '"]');
          if (n) n.textContent = p.stars[r.key] + '/5';
        });
      }

      if (notes) {
        PREC_ROWS.forEach(function (r) {
          var el = notes.querySelector('[data-req="' + r.key + '"]');
          if (el) el.textContent = p.req[r.key];
        });
      }

      if (tolVal) tolVal.textContent = p.tol + '%';
      if (tolFill) tolFill.style.width = p.tol + '%';

      document.documentElement.dataset.precision = String(idx);

      if (window.DQFCards) window.DQFCards.setPrecision(idx);
    }

    range.addEventListener('input', function () { apply(+range.value); });
    apply(+range.value || 1);
  }

  /* =========================================================
     五、认知增量
     ========================================================= */
  var GAIN_CHAIN = [
    { t: '讨论',     d: '起点：双方各自带着不完整的信息' },
    { t: '新事实',   d: '有人拿出此前不知道的数据或案例' },
    { t: '新定义',   d: '发现原来的概念边界不清楚，重新界定' },
    { t: '新标准',   d: '意识到存在另一套评价函数' },
    { t: '新逻辑',   d: '找到推理链上断掉的那一环' },
    { t: '问题缩小', d: '从「XX 到底好不好」变成「A 和 B 如何取舍」' },
    { t: '认知增加', d: '即便立场未变，双方的理解都前进了' }
  ];

  var GAIN_ITEMS = [
    '学到了新的事实。',
    '发现自己的概念定义不够准确。',
    '意识到存在另一种评价标准。',
    '找到了自己推理中的漏洞。',
    '明确了这个问题目前无法下结论。',
    '发现真正的分歧点在哪里。'
  ];

  function initGain() {
    var chain = document.getElementById('gainChain');
    if (chain) {
      var arrow = '<span class="gain__arrow">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M5 12h13M12.5 5.5 19 12l-6.5 6.5"/></svg></span>';
      chain.innerHTML = GAIN_CHAIN.map(function (s, i) {
        return '' +
          '<div class="gain__step"><b>' + s.t + '</b><small>' + s.d + '</small></div>' +
          (i < GAIN_CHAIN.length - 1 ? arrow : '');
      }).join('');
    }

    var grid = document.getElementById('gainGrid');
    if (grid) {
      grid.innerHTML = GAIN_ITEMS.map(function (t, i) {
        return '<div class="gain__item"><span class="gain__num">' + (i + 1) + '</span><p>' + t + '</p></div>';
      }).join('');
    }
  }

  /* =========================================================
     六、退出讨论决策树
     ========================================================= */
  var EXIT_Q = [
    {
      q: '还有可能出现新事实吗？',
      d: '分歧来自信息不足时，讨论仍有收益——去查数据、找样本、看原始来源。',
      yes: '继续讨论：等待或寻找更多证据。',
      no: '没有新事实可补充，进入下一问。'
    },
    {
      q: '还能统一概念定义吗？',
      d: '如果双方愿意重新界定关键词，讨论对象就有机会重新对齐。',
      yes: '继续讨论：先把对象重新对齐。',
      no: '概念无法统一，进入下一问。'
    },
    {
      q: '还能协商出共同标准吗？',
      d: '即便事实与概念一致，只要评价函数不同，结论依然会分岔。',
      yes: '继续讨论：先说清按什么判断。',
      no: '停止讨论。'
    }
  ];

  function initExit() {
    var box = document.getElementById('exitTree');
    var res = document.getElementById('exitResult');
    if (!box || !res) return;

    var picks = [null, null, null];

    box.innerHTML = EXIT_Q.map(function (n, i) {
      return '' +
        '<div class="exit__q" data-i="' + i + '">' +
          '<span class="exit__n">Q' + (i + 1) + '</span>' +
          '<div>' +
            '<div class="exit__qt">' + n.q + '</div>' +
            '<div class="exit__qd">' + n.d + '</div>' +
            '<div class="exit__pick">' +
              '<button class="exit__btn yes" type="button" data-i="' + i + '" data-v="1">YES</button>' +
              '<button class="exit__btn no" type="button" data-i="' + i + '" data-v="0">NO</button>' +
            '</div>' +
          '</div>' +
        '</div>';
    }).join('');

    function paint() {
      // 决定每个问题的激活状态：前面全为 NO 时该题激活
      EXIT_Q.forEach(function (_, i) {
        var el = box.querySelector('.exit__q[data-i="' + i + '"]');
        var prevAllNo = true;
        for (var k = 0; k < i; k++) {
          if (picks[k] !== false) { prevAllNo = false; break; }
        }
        var answered = picks[i] !== null;
        el.classList.toggle('is-off', !prevAllNo);
        el.classList.toggle('is-on', prevAllNo && answered && picks[i] === true);
        el.classList.toggle('is-last', prevAllNo && answered && picks[i] === false && i === EXIT_Q.length - 1);

        el.querySelectorAll('.exit__btn').forEach(function (b) {
          var v = b.dataset.v === '1';
          b.classList.toggle('is-on', picks[i] === v);
        });
      });

      var html;
      if (picks[0] === null) {
        html = '<span class="big" style="color:var(--text-dim)">待判断</span>' +
               '<p>从 Q1 开始回答。任意一题答 YES，讨论就还有继续的价值。</p>';
      } else if (picks[0] === true) {
        html = '<span class="big" style="color:var(--green)">继续讨论</span>' +
               '<p>' + EXIT_Q[0].yes + '</p>';
      } else if (picks[1] === true) {
        html = '<span class="big" style="color:var(--green)">继续讨论</span>' +
               '<p>' + EXIT_Q[1].yes + '</p>';
      } else if (picks[2] === true) {
        html = '<span class="big" style="color:var(--green)">继续讨论</span>' +
               '<p>' + EXIT_Q[2].yes + '</p>';
      } else if (picks[2] === false) {
        html = '<span class="big" style="color:var(--red)">停止讨论</span>' +
               '<p>没有新事实、概念无法统一、标准无法协商——继续讨论的边际收益已接近零。这不是认输，而是承认当前已无认知增量。</p>';
      } else {
        html = '<span class="big" style="color:var(--text-dim)">回答中</span>' +
               '<p>继续回答 Q' + ((picks.findIndex(function (p) { return p === null; })) + 1) + '。</p>';
      }
      res.innerHTML = html;
    }

    box.querySelectorAll('.exit__btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var i = +btn.dataset.i;
        var v = btn.dataset.v === '1';
        picks[i] = (picks[i] === v) ? null : v;
        // 改动上游答案时清空下游
        for (var k = i + 1; k < picks.length; k++) picks[k] = null;
        paint();
      });
    });

    paint();
  }

  /* =========================================================
     七、讨论演化时间线
     ========================================================= */
  var TIMELINE = [
    {
      t: '开始', tag: '起点', key: false,
      d: '抛出原始问题：「AI 到底好不好？」双方立场鲜明，但都没有说清自己指的是什么。'
    },
    {
      t: '概念混乱', tag: '概念定义', key: false,
      d: '三轮之后发现，A 说的是「大模型作为生产力工具」，B 说的是「AI 对就业结构的冲击」——讨论对象根本不同。'
    },
    {
      t: '标准统一', tag: '标准约束', key: true,
      d: '双方约定本次只按「未来五年的就业影响」评价，暂不讨论技术能力。评价函数第一次被摊开写在明面上。'
    },
    {
      t: '发现事实不足', tag: '事实依据', key: false,
      d: '进入事实层后，双方都在用「我觉得」「网上都说」，没有一个可核对的数字。讨论原地打转。'
    },
    {
      t: '补充数据', tag: '事实依据', key: true,
      d: '引入行业报告与就业统计数据，逐条核对来源、样本与统计口径。这一步把讨论从印象拉回证据。'
    },
    {
      t: '认知增加', tag: '认知增量', key: true,
      d: '分歧从「AI 到底好不好」缩小为「效率优先还是就业优先」。立场没变，但问题被精确切开了。'
    },
    {
      t: '结束', tag: '退出判断', key: false,
      d: '双方确认分歧已落在价值排序上，而非事实或逻辑。继续讨论不再产生新信息，于是理性停止，并记录沉淀。'
    }
  ];

  function initTimeline() {
    var box = document.getElementById('timelineBody');
    if (!box) return;
    box.innerHTML = TIMELINE.map(function (s, i) {
      return '' +
        '<div class="tl__item' + (s.key ? ' is-key' : '') + '">' +
          '<span class="tl__dot">' + (i + 1) + '</span>' +
          '<div class="tl__h"><b>' + s.t + '</b><span class="chip chip--accent">' + s.tag + '</span></div>' +
          '<p class="tl__p">' + s.d + '</p>' +
        '</div>';
    }).join('');
  }

  /* =========================================================
     八、思维原则
     ========================================================= */
  var PRINCIPLES = [
    { t: '高质量讨论的目标不是证明自己正确', x: true },
    { t: '而是不断减少误解', x: false },
    { t: '不断增加认知', x: false },
    { t: '在无法增加认知时停止讨论', x: false }
  ];

  function initPrinciples() {
    var box = document.getElementById('prinList');
    if (!box) return;
    var arrow = '<div class="prin__arrow">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M12 5v13M5.5 11.5 12 18l6.5-6.5"/></svg></div>';

    box.innerHTML = PRINCIPLES.map(function (p, i) {
      return '' +
        '<div class="prin__row' + (p.x ? ' is-x' : '') + '">' +
          '<span class="prin__n">' + (i + 1) + '</span>' +
          '<b>' + p.t + '</b>' +
        '</div>' +
        (i < PRINCIPLES.length - 1 ? arrow : '');
    }).join('');
  }

  /* =========================================================
     九、导航 / 主题 / 滚动
     ========================================================= */

  /* ---------- 返回按钮 ----------
     用途：案例分析中的「在雷达图中查看 / 用诊断器分析 / 带入自检清单」
     会把用户带离 #cases，跳转时由 DQF.backTo(fromId, label) 唤起本按钮，
     点击后滚回来源小节；回到来源后自动收起。
     注意：平滑滚动期间不判定，否则刚点跳转就会被误判为「已回到来源」。 */
  var backOrigin = null;   // 跳转来源 section id
  var backArmAt = 0;       // 该时间戳之后才允许自动隐藏

  function hideBack() {
    var btn = document.getElementById('backToCases');
    if (btn) btn.classList.remove('is-on');
    backOrigin = null;
  }

  /* 已滚回来源小节则收起。平滑滚动结束前不能判定，
     否则刚点跳转（人还在来源小节）就会被误判为「已返回」。 */
  function checkBack() {
    if (!backOrigin || Date.now() <= backArmAt) return;
    var o = document.getElementById(backOrigin);
    if (!o) return;
    var r = o.getBoundingClientRect();
    if (r.top <= 240 && r.bottom > 240) hideBack();
  }

  DQF.backTo = function (fromId, label) {
    var btn = document.getElementById('backToCases');
    if (!btn) return;
    backOrigin = fromId;
    var txt = btn.querySelector('.backto__txt');
    if (txt && label) txt.textContent = label;
    btn.classList.add('is-on');
    backArmAt = Date.now() + 900;
  };

  function initBackTo() {
    var btn = document.getElementById('backToCases');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var el = backOrigin && document.getElementById(backOrigin);
      if (el && el.scrollIntoView) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      // 回程期间保持可见，滚到位后自动收起。
      // 平滑滚动结束前不能判定；scrollend 不是所有浏览器都有，故加定时兜底。
      backArmAt = Date.now() + 900;
      if ('onscrollend' in window) {
        window.addEventListener('scrollend', checkBack, { once: true });
      }
      setTimeout(checkBack, 1600);
      setTimeout(checkBack, 2600);
    });
  }

  /* =========================================================
     八·补 窄屏悬浮章节导航
     ≤720px 时 #navLinks 变成左侧悬浮竖列菜单：
     - 滚动时自动展开，停滚 1.5s 收起
     - 左下角圆钮可手动开合，手动开启后不再自动收起
     滚动唤起重用 initNav 的 onScroll，不另开监听器
     ========================================================= */
  var mobNavBump = null;

  function initMobileNav() {
    var fab = document.getElementById('navFab');
    var links = document.getElementById('navLinks');
    if (!fab || !links) return;

    var mq = window.matchMedia('(max-width: 720px)');
    var timer = null;
    var pinned = false; // 手动开启：跳过自动收起
    var im = document.getElementById('iconMenu');
    var ic = document.getElementById('iconClose');

    function setOpen(on) {
      links.classList.toggle('is-open', on);
      fab.classList.toggle('is-on', on);
      fab.setAttribute('aria-expanded', on ? 'true' : 'false');
      if (im) im.style.display = on ? 'none' : '';
      if (ic) ic.style.display = on ? '' : 'none';
    }

    function close() {
      clearTimeout(timer);
      timer = null;
      pinned = false;
      setOpen(false);
    }

    function hideLater(ms) {
      clearTimeout(timer);
      timer = setTimeout(function () { if (!pinned) close(); }, ms);
    }

    // 由 initNav 的 onScroll 调用
    mobNavBump = function () {
      if (!mq.matches) return;
      if (!links.classList.contains('is-open')) setOpen(true);
      hideLater(1500);
    };

    fab.addEventListener('click', function () {
      var on = !links.classList.contains('is-open');
      pinned = on;
      clearTimeout(timer);
      setOpen(on);
    });

    // 小屏上面板内部需要滚动时，别让用户在翻找章节的过程中菜单被收走。
    // 元素 scroll 不冒泡到 window，所以必须单独续期
    links.addEventListener('scroll', function () {
      if (mq.matches) hideLater(1500);
    }, { passive: true });

    // 点章节后留 700ms 看高亮切换，再收起
    links.addEventListener('click', function (e) {
      if (!e.target.closest('.nav__link')) return;
      pinned = false;
      hideLater(700);
    });

    // 手动展开时点空白处收起
    document.addEventListener('click', function (e) {
      if (!pinned) return;
      if (e.target.closest('#navLinks') || e.target.closest('#navFab')) return;
      close();
    });

    mq.addEventListener('change', function (e) {
      if (e.matches) return;
      clearTimeout(timer);
      pinned = false;
      setOpen(false);
    });
  }

  function initNav() {
    var nav = document.getElementById('nav');
    var links = DQF.$$('#navLinks .nav__link');
    var sections = links
      .map(function (a) { return document.querySelector(a.getAttribute('href')); })
      .filter(Boolean);

    function onScroll() {
      var y = window.scrollY || document.documentElement.scrollTop;
      if (nav) nav.classList.toggle('is-stuck', y > 8);

      var totop = document.getElementById('toTop');
      if (totop) totop.classList.toggle('is-on', y > 620);

      // scrollspy：取当前视口内最靠上的已激活分区
      var best = -1;
      sections.forEach(function (sec, i) {
        var top = sec.getBoundingClientRect().top;
        if (top <= 140) best = i;
      });
      links.forEach(function (a, i) {
        a.classList.toggle('is-active', i === best);
      });

      // 已经滚回来源小节（含手动滚回）→ 收起返回按钮
      checkBack();
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    // 唤起单独挂在 scroll 事件上：initNav 末尾的 onScroll() 是初始化调用，
    // 若在其内部唤起，页面一加载菜单就会自己弹出来
    window.addEventListener('scroll', function () {
      if (mobNavBump) mobNavBump();
    }, { passive: true });
    onScroll();

    var totop = document.getElementById('toTop');
    if (totop) {
      totop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  function initTheme() {
    var btn = document.getElementById('themeBtn');
    var moon = document.getElementById('iconMoon');
    var sun = document.getElementById('iconSun');
    var root = document.documentElement;

    function paint(theme) {
      root.setAttribute('data-theme', theme);
      if (moon && sun) {
        var dark = theme === 'dark';
        moon.style.display = dark ? 'block' : 'none';
        sun.style.display = dark ? 'none' : 'block';
      }
    }

    var saved = null;
    try { saved = localStorage.getItem('dqf-theme'); } catch (e) { /* 隐私模式 */ }

    if (saved) {
      paint(saved);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      paint('light');
    } else {
      paint('dark');
    }

    if (btn) {
      btn.addEventListener('click', function () {
        var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        paint(next);
        try { localStorage.setItem('dqf-theme', next); } catch (e) { /* ignore */ }
      });
    }
  }

  function initReveal() {
    var els = DQF.$$('.rv');
    if (!els.length) return;

    if (!('IntersectionObserver' in window) || DQF.reducedMotion) {
      els.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('is-in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    els.forEach(function (el) { io.observe(el); });
  }

  /* =========================================================
     十、调度
     ========================================================= */
  function boot() {
    initTheme();
    initMobileNav();
    initNav();
    initBackTo();
    initHeroCanvas();

    initOverview();
    initPrecision();
    initGain();
    initExit();
    initTimeline();
    initPrinciples();

    // 子模块
    if (window.DQFCards) window.DQFCards.init();
    if (window.DQFFlow) window.DQFFlow.init();
    if (window.DQFRadar) window.DQFRadar.init();
    if (window.DQFCases) window.DQFCases.init();
    if (window.DQFAnalyzer) window.DQFAnalyzer.init();
    if (window.DQFChecklist) window.DQFChecklist.init();

    initReveal();

    document.body.classList.add('is-ready');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
