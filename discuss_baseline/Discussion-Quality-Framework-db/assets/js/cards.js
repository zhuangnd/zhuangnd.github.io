/* ============================================================
   cards.js — 五大基线 Glass Card
   Discussion Quality Framework
   职责：按数据渲染 5 张可展开卡片（定义 / 为什么重要 / 常见错误
        / 示例 / 何时需要严格），点击展开与收起。
   ============================================================ */
(function () {
  "use strict";

  var DQF = window.DQF || (window.DQF = { init: [] });

  var CARDS = [
    {
      num: '01', en: 'Concept', title: '概念定义',
      icon: 'icon-concept.svg',
      summary: '确定讨论对象 —— 我们讨论的到底是什么？',
      why: '本质是确定讨论对象。很多争论不是观点不同，而是讨论的对象不同："文明是什么？""自由是什么？""效率高是什么意思？"没有统一定义，后面所有推理都建立在不同对象上。',
      errors: ['偷换概念', '语义混乱', '对象不同步'],
      cases: ['文明', '自由', '公平', 'AI'],
      example: '"AI 会取代程序员" —— AI 指什么（LLM？Agent？AGI？）；取代是什么意思（全部失业？岗位减少？工作方式改变？）；程序员范围（初级？高级？全部？）。',
      strict: '学术讨论必须精确定义，必要时给出操作性定义；日常讨论可允许模糊，只要大致理解一致。',
      scene: '学术论文 · 政策讨论 · 技术评审'
    },
    {
      num: '02', en: 'Standard', title: '标准约束',
      icon: 'icon-standard.svg',
      summary: '确定评价函数 —— 依据什么来判断？',
      why: '第二步不是讨论事实，而是讨论"什么算成立"。标准不同时，双方都可能正确——不是事实冲突，而是评价函数不同。没有评价函数，就不存在统一结论。',
      errors: ['评价体系不同', '标准隐含', '权重不明'],
      cases: ['世界第一', 'NBA GOAT'],
      example: '"世界第一"可用收入、奖项、技术水平、商业价值或历史影响力衡量；NBA 有人按 MVP/冠军/数据，有人按技术天花板/巅峰高度/比赛影响力。',
      strict: '学术讨论必须说明评价指标、权重如何分配、为什么这样选择；日常讨论允许隐含标准。',
      scene: '排名对比 · 方案选型 · 绩效评估'
    },
    {
      num: '03', en: 'Evidence', title: '事实依据',
      icon: 'icon-evidence.svg',
      summary: '保证前提真实 —— 事实本身可靠吗？',
      why: '即使定义一致、标准一致、逻辑正确，如果事实本身错了，结论依然会错。逻辑只能保证"前提为真则结论成立"，不能保证前提本身真实，因此事实依据应作为独立的一层。',
      errors: ['假数据', '证据不足', '来源不可靠'],
      cases: ['GDP 增长', '全球升温'],
      example: '"中国 GDP 增长"不等于"每个人都更富有"；"全球平均气温上升"必须引用数据与研究，区分数据、样本、来源、偏差与统计方法。',
      strict: '学术讨论要求可验证、可复现、可溯源的事实；日常讨论可接受个人经历、常识与新闻。',
      scene: '研究论文 · 新闻报道 · 投资决策'
    },
    {
      num: '04', en: 'Logic', title: '逻辑遵循',
      icon: 'icon-logic.svg',
      summary: '保证推理有效 —— 结论能由前提推出吗？',
      why: '第三步才真正进入推理。中间每一步都需要证明：不能跳步、不能偷换、不能循环论证、不能把相关当因果。逻辑遵循的本质是保证推理有效。',
      errors: ['跳步', '偷换概念', '循环论证', '相关当因果'],
      cases: ['GDP → 每个人更富有'],
      example: 'GDP 增长 → 收入增长？→ 居民收入增长？→ 所有居民？每一步都需要证明；"房价涨，租金大概率涨"是高效但不完整的推理。',
      strict: '学术讨论必须完整严谨、避免逻辑谬误；日常讨论允许部分跳步和直觉推理。',
      scene: '数学证明 · 法律裁判 · 工程设计'
    },
    {
      num: '05', en: 'Cognitive Gain', title: '认知增量',
      icon: 'icon-gain.svg',
      summary: '评估讨论收益 —— 是否增加了认知？',
      why: '把讨论目标从"改变他人"转变为"增加认知"。讨论最大的价值不一定是得到答案，而是缩小问题。高质量讨论未必产生共识，但一定产生认知增量。',
      errors: ['以输赢为目标', '只重复观点', '无信息增量'],
      cases: ['AI 到底好不好？'],
      example: '讨论一小时后变成"我们真正分歧的是“效率优先”还是“就业优先”"——虽然没有统一观点，但问题被缩小了，这就是认知增量。',
      strict: '高质量讨论结束时，双方都能准确表述：自己的观点、对方的观点、真正分歧在哪里、为什么目前无法统一。',
      scene: '长期合作 · 跨团队沟通 · 价值判断'
    }
  ];

  function stars(n) {
    var s = '';
    for (var i = 1; i <= 5; i++) s += '<span class="' + (i <= n ? 'on' : '') + '">★</span>';
    return s;
  }

  function render() {
    var grid = document.getElementById('baselineGrid');
    if (!grid) return;
    var html = '';
    CARDS.forEach(function (c) {
      html +=
        '<article class="card glass reveal" data-key="' + c.title + '">' +
          '<div class="card-head">' +
            '<div class="card-num">' + c.num + '</div>' +
            '<div class="card-title">' +
              '<img class="ic" src="assets/icons/' + c.icon + '" alt="">' +
              '<h3>' + c.title + '</h3><span class="en">' + c.en + '</span>' +
            '</div>' +
            '<p class="card-summary">' + c.summary + '</p>' +
          '</div>' +
          '<div class="card-body"><div class="card-inner">' +
            '<div class="card-sec"><h5>为什么重要</h5><p>' + c.why + '</p></div>' +
            '<div class="card-sec"><h5>常见错误</h5><div class="chips">' +
              c.errors.map(function (e) { return '<span class="chip warn">' + e + '</span>'; }).join('') +
            '</div></div>' +
            '<div class="card-sec"><h5>示例</h5><div class="chips">' +
              c.cases.map(function (x) { return '<span class="chip">' + x + '</span>'; }).join('') +
            '</div><p style="margin-top:10px">' + c.example + '</p></div>' +
            '<div class="card-sec"><h5>何时需要严格</h5><p>' + c.strict + '</p></div>' +
            '<div class="card-sec"><h5>适用场景</h5><p>' + c.scene + '</p></div>' +
          '</div></div>' +
          '<div class="card-foot"><span class="hint">点击展开 / 收起</span><span class="arrow">▾</span></div>' +
        '</article>';
    });
    grid.innerHTML = html;

    grid.querySelectorAll('.card').forEach(function (card) {
      card.addEventListener('click', function () {
        var isOpen = card.classList.contains('open');
        grid.querySelectorAll('.card').forEach(function (c) { c.classList.remove('open'); });
        if (!isOpen) card.classList.add('open');
      });
    });
    // 重新触发 Reveal 观察（动态渲染的元素）
    if (window.DQF && window.DQF.reObserve) window.DQF.reObserve(grid);
  }

  DQF.register(render);
})();
