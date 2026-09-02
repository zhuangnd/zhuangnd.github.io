/* ============================================================
   analyzer.js — Discussion Analyzer + Case Study
   Discussion Quality Framework
   职责：
   ① 讨论分析器：输入一段话，基于规则从六个维度打分并给出建议；
   ② 案例分析：内置 5 个可切换案例，展示维度评分、真正分歧与结论。
   说明：V1 为规则启发式实现（零依赖），后续可替换为 AI 接口。
   ============================================================ */
(function () {
  "use strict";

  var DQF = window.DQF || (window.DQF = { init: [] });

  /* ---------- 通用：星级渲染 ---------- */
  function stars(n) {
    var s = '';
    var v = Math.max(0, Math.min(5, Math.round(n)));
    for (var i = 1; i <= 5; i++) s += '<span class="' + (i <= v ? 'on' : '') + '">★</span>';
    return s;
  }

  /* ============================================================
     ① Discussion Analyzer（规则启发式）
     ============================================================ */
  var VAGUE = ['公平', '自由', '文明', '效率', '意义', '价值', '好', '坏', '厉害', 'AI', '智能',
               '进步', '科学', '素质', '水平', '现代化', '民主', '应该'];
  var DEFINE = ['是指', '定义为', '指', '包括', '涵盖', '包含', '特指', '限定', '区分', '即'];
  var CRITERIA = ['标准', '依据', '指标', '权重', '衡量', '按', '以', '比较', '维度', '优先级'];
  var OPINION = ['我觉得', '我认为', '我感觉', '感觉', '应该', '最好', '比较好', '厉害'];
  var EVIDENCE = ['数据', '统计', '报告', '研究', '调查', '实验', '证据', '来源', '%', '％',
                  '万人', '亿元', '文献', '案例', '样本', '调研'];
  var REASON = ['因为', '所以', '因此', '如果', '那么', '必然', '肯定', '证明', '推导',
                '意味着', '由于', '导致', '取决于', '否则', '意味着'];
  var ABSOLUTE = ['都是', '全都', '所有', '一定', '绝对', '必然', '不可能'];
  var IMPLICIT = ['骗', '割韭菜', '垃圾', '没用', '最好', '最差', '邪恶', '伟大'];
  var OPEN = ['？', '?', '是否', '怎么', '为什么', '如何', '到底', '其实', '可能', '换个角度',
              '不一定', '值得', '是不是', '要不要'];

  function countHits(text, list) {
    var n = 0;
    list.forEach(function (w) { if (text.indexOf(w) > -1) n++; });
    return n;
  }

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function analyze(text) {
    var t = text || '';
    var hits = {
      vague: countHits(t, VAGUE),
      define: countHits(t, DEFINE),
      criteria: countHits(t, CRITERIA),
      opinion: countHits(t, OPINION),
      evidence: countHits(t, EVIDENCE),
      reason: countHits(t, REASON),
      absolute: countHits(t, ABSOLUTE),
      implicit: countHits(t, IMPLICIT),
      open: countHits(t, OPEN)
    };

    var dims = {};

    // 概念：定义词越多越高，模糊词/绝对化越低
    dims.concept = clamp(3 + hits.define - hits.vague - hits.absolute, 1, 5);

    // 标准：出现评价准则词则高；隐式价值判断则低
    dims.standard = clamp(3 + hits.criteria - hits.implicit - (hits.opinion > 0 ? 1 : 0), 1, 5);

    // 事实：证据词越多越高；无证据的强断言则低
    dims.evidence = clamp(2 + hits.evidence - hits.absolute, 1, 5);

    // 逻辑：推理词越多越高；绝对化断言则低
    dims.logic = clamp(3 + hits.reason - hits.absolute, 1, 5);

    // 认知增量：开放式/疑问式更高；封闭式断言更低
    dims.cognitive = clamp(2 + hits.open - (hits.absolute > 0 ? 1 : 0) - (t.length === 0 ? 2 : 0), 0, 5);

    // 建议
    var advice = [];
    if (dims.concept <= 2) advice.push('先统一定义，确认讨论对象（概念）');
    if (dims.standard <= 2) advice.push('先明确评价标准与权重（标准）');
    if (dims.evidence <= 2) advice.push('先补充可验证的证据（事实）');
    if (dims.logic <= 2) advice.push('先检查推理是否有跳步或偷换（逻辑）');
    if (dims.cognitive <= 2) advice.push('评估当前讨论是否还有认知增量');
    if (advice.length === 0) advice.push('六个维度基本就位，可继续深入讨论');

    var avg = (dims.concept + dims.standard + dims.evidence + dims.logic + dims.cognitive) / 5;
    var verdict = avg >= 4 ? { cls: 'high', txt: '讨论质量高' }
                : avg >= 2.5 ? { cls: 'mid', txt: '讨论质量中等' }
                : { cls: 'low', txt: '当前讨论价值较低' };

    return { dims: dims, advice: advice, verdict: verdict };
  }

  function renderAnalyzer(text) {
    var r = analyze(text);
    var box = document.getElementById('analyzerResult');
    if (!box) return;
    var labels = [
      ['概念定义', r.dims.concept],
      ['标准约束', r.dims.standard],
      ['事实依据', r.dims.evidence],
      ['逻辑遵循', r.dims.logic],
      ['认知增量', r.dims.cognitive]
    ];
    var html = '<div class="head"><h4>分析结果</h4><span class="verdict ' + r.verdict.cls + '">' + r.verdict.txt + '</span></div>';
    labels.forEach(function (it) {
      html += '<div class="an-dim"><span class="nm">' + it[0] + '</span><span class="st stars">' + stars(it[1]) + '</span>' +
              '<span class="note">' + reqNote(it[0], it[1]) + '</span></div>';
    });
    html += '<div class="an-advice"><b>建议：</b>' + r.advice.join('；') + '。</div>';
    box.innerHTML = html;
  }

  function reqNote(name, n) {
    if (n >= 4) return '要求高';
    if (n === 3) return '要求中等';
    return '要求低，需补强';
  }

  /* ============================================================
     ② Case Study（可切换案例）
     ============================================================ */
  var CASES = {
    nba: {
      name: 'NBA GOAT', flag: 'hot', flagTxt: '经典辩题',
      desc: '乔丹与科比，谁更伟大？',
      dims: { concept: 5, standard: 2, evidence: 4, logic: 3, cognitive: 3 },
      divergence: '真正分歧：评价标准不同 —— 一方按荣誉/数据，一方按技术天花板/巅峰高度/影响力。',
      verdict: { type: 'go', text: '先协商评价标准（指标与权重），可继续讨论。' }
    },
    ai: {
      name: 'AI 取代程序员', flag: 'hot', flagTxt: '前沿话题',
      desc: 'AI 会不会取代程序员？',
      dims: { concept: 1, standard: 2, evidence: 2, logic: 2, cognitive: 3 },
      divergence: '真正分歧：概念未统一定义 —— AI（LLM/Agent/AGI）、取代（失业/岗位减少/方式改变）、程序员范围都未界定。',
      verdict: { type: 'stop', text: '先统一定义再继续，否则讨论没有共同对象。' }
    },
    live: {
      name: '直播带货', flag: 'hot', flagTxt: '现实争议',
      desc: '直播带货是销售渠道，还是割韭菜？',
      dims: { concept: 2, standard: 1, evidence: 1, logic: 2, cognitive: 1 },
      divergence: '真正分歧：概念对象不同（销售渠道 vs 诱导消费）+ 价值排序不同（商业效率 vs 消费者权益）。',
      verdict: { type: 'stop', text: '分歧在价值排序而非事实，继续边际收益低，建议退出。' }
    },
    freedom: {
      name: '自由', flag: 'cold', flagTxt: '抽象概念',
      desc: '自由是什么？',
      dims: { concept: 1, standard: 2, evidence: 3, logic: 3, cognitive: 3 },
      divergence: '真正分歧：概念未定义 —— "自由"指什么？消极自由还是积极自由？',
      verdict: { type: 'stop', text: '先给出"自由"的可操作性定义，再谈判断标准。' }
    },
    civilization: {
      name: '文明', flag: 'cold', flagTxt: '抽象概念',
      desc: '文明是什么？',
      dims: { concept: 1, standard: 2, evidence: 3, logic: 3, cognitive: 3 },
      divergence: '真正分歧：概念未定义 —— 文明是器物、制度还是观念？',
      verdict: { type: 'stop', text: '先定义"文明"的边界与标准，否则无法讨论。' }
    }
  };

  function renderCase(key) {
    var c = CASES[key];
    if (!c) return;
    var dimBox = document.getElementById('caseDims');
    var panelBox = document.getElementById('casePanel');
    if (!dimBox || !panelBox) return;
    var order = [['概念定义', c.dims.concept], ['标准约束', c.dims.standard], ['事实依据', c.dims.evidence],
                 ['逻辑遵循', c.dims.logic], ['认知增量', c.dims.cognitive]];
    var html = '<div class="case-title">' + c.name + ' <span class="flag ' + c.flag + '">' + c.flagTxt + '</span></div>' +
               '<p class="case-desc">' + c.desc + '</p>';
    order.forEach(function (it) {
      html += '<div class="an-dim"><span class="nm">' + it[0] + '</span><span class="st stars">' + stars(it[1]) + '</span></div>';
    });
    dimBox.innerHTML = html;

    var verdictCls = c.verdict.type === 'go' ? 'go' : 'stop';
    var verdictTxt = c.verdict.type === 'go' ? '→ 继续讨论' : '✕ 退出讨论';
    panelBox.innerHTML =
      '<h4>分歧定位</h4>' +
      '<div class="case-divergence">' + c.divergence + '</div>' +
      '<h4>结论</h4>' +
      '<div class="case-verdict"><span class="' + verdictCls + '">' + verdictTxt + '</span>　' + c.verdict.text + '</div>';
  }

  /* ---------- 初始化 ---------- */
  DQF.register(function () {
    // 分析器
    var btn = document.getElementById('analyzeBtn');
    var input = document.getElementById('analyzeInput');
    if (btn && input) {
      function run() { renderAnalyzer(input.value); }
      btn.addEventListener('click', run);
      input.addEventListener('keydown', function (e) { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) run(); });
    }
    // 案例
    var tabs = document.querySelectorAll('.case-tab');
    if (tabs.length) {
      tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
          tabs.forEach(function (x) { x.classList.remove('active'); });
          tab.classList.add('active');
          renderCase(tab.getAttribute('data-case'));
        });
      });
      renderCase('nba');
    }
  });
})();
