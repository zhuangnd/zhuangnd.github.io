/* =============================================================
   DQF · cases.js — 案例分析
   -------------------------------------------------------------
   展示框架在真实争论上的用法：同一场争吵拆成五维评分后，
   往往会发现分歧根本不在事实层面。
   每个案例可一键带入讨论诊断器、雷达图与自检清单。
   依赖：window.DQF、window.DQFRadar、window.DQFAnalyzer、window.DQFChecklist
   导出：window.DQFCases
   ============================================================= */
(function () {
  'use strict';

  var DIMS = [
    { key: 'concept',  cn: '概念定义', color: 'var(--c-concept)' },
    { key: 'standard', cn: '标准约束', color: 'var(--c-standard)' },
    { key: 'evidence', cn: '事实依据', color: 'var(--c-evidence)' },
    { key: 'logic',    cn: '逻辑遵循', color: 'var(--c-logic)' },
    { key: 'gain',     cn: '认知增量', color: 'var(--c-gain)' }
  ];

  /* 各维度得分的短评 */
  var REMARK = {
    1: '严重错位', 2: '明显不足', 3: '勉强可用',
    4: '基本清楚', 5: '完全对齐'
  };

  var CASES = [
    {
      name: '直播带货',
      title: 'A：直播带货很好 / B：直播带货就是割韭菜',
      a: '直播带货是高效的销售渠道，它压缩了中间环节、降低了流通成本，还帮产地农户卖掉了原本会烂在地里的货。',
      b: '直播带货就是割韭菜。主播靠话术诱导冲动消费，退货率高得离谱，买的都是不需要的东西。',
      scores: { concept: 2, standard: 2, evidence: 1, logic: 2, gain: 2 },
      gap: '概念层已经错位：A 说的是「直播作为销售渠道」，B 说的是「主播诱导消费」。这两件事甚至可以同时成立。',
      verdict: 'continue',
      verdictText: '值得继续，但必须先回到概念层：把「直播带货」拆成「渠道效率」和「消费诱导」两个独立问题，各自评价。',
      chk: [],
      text: '直播带货都是骗人的。我朋友上次买的东西根本没法用，网上都说这个行业迟早要完。反正就是割韭菜，不用说了。'
    },
    {
      name: 'AI 取代程序员',
      title: 'A：AI 会取代程序员 / B：不会',
      a: 'AI 会取代程序员。现在大模型已经能自动写代码了，以后根本不需要那么多人写业务代码。',
      b: '不会。AI 只能写玩具代码，稍微复杂的系统、架构设计和线上排障，还是得靠人。',
      scores: { concept: 1, standard: 2, evidence: 2, logic: 2, gain: 3 },
      gap: '三个关键词全都没有定义：AI 指 LLM、Agent 还是 AGI？取代是全部失业、岗位减少还是工作方式改变？程序员包括初级还是全部？',
      verdict: 'continue',
      verdictText: '先定义，再讨论。在这三个问题说清之前，任何结论都建立在不同的对象上，没有意义。',
      chk: [],
      text: 'AI 肯定会取代程序员，这个毫无疑问。现在大模型都能写代码了，以后所有人都不用干了，网上都说这是趋势。'
    },
    {
      name: 'NBA GOAT',
      title: 'A：乔丹是历史最佳 / B：詹姆斯更伟大',
      a: '乔丹是历史最佳：6 个总冠军、6 次 FMVP，总决赛从未失手，巅峰期统治力无人能及。',
      b: '詹姆斯更伟大：20 年持续巅峰，五项主要数据全部位列历史前列，在不同球队都能带队夺冠。',
      scores: { concept: 4, standard: 1, evidence: 4, logic: 3, gain: 2 },
      gap: '事实层完全没有争议，争议 100% 出在标准层：A 按荣誉与巅峰高度，B 按累积贡献与持久性。这不是事实问题，是评价函数问题。',
      verdict: 'stop',
      verdictText: '事实已完全对齐，分歧纯粹来自评价函数。如果双方都不愿调整标准，继续讨论不会改变任何一方的结论。',
      chk: ['concept', 'evidence'],
      text: '乔丹就是历史最佳，6 个冠军 6 个 FMVP，这还有什么好争的？所有人都知道他是最强的，不用说了。'
    },
    {
      name: '文明',
      title: 'A：五千年连续文明 / B：按标准只有三千多年',
      a: '中华文明五千年从未中断，是世界上唯一延续至今的古老文明。',
      b: '按考古学标准，文明的判定要素是文字、城市与青铜器，据此只有三千多年可考。',
      scores: { concept: 1, standard: 1, evidence: 3, logic: 3, gain: 4 },
      gap: '双方使用的是两套「文明」：一个是考古学术语（可测量的物质要素），一个是文化共同体概念（延续的认同与记忆）。两者都对，但不可通约。',
      verdict: 'stop',
      verdictText: '概念与标准双重错位。除非先约定采用哪一种「文明」定义，否则讨论只是在互相确认对方的术语用法。',
      chk: ['evidence', 'logic'],
      text: '中华文明五千年，这是众所周知的事实，全世界都承认。你要是按西方那套标准算，那当然不一样，但那套标准本来就不对。'
    },
    {
      name: '自由',
      title: 'A：自由是不受强制 / B：自由是有能力去做',
      a: '自由就是不受他人强制。政府管得越少，人就越自由。',
      b: '没有经济保障就没有真正的自由。一个吃不饱饭的人，形式上再自由也没有意义。',
      scores: { concept: 1, standard: 1, evidence: 2, logic: 4, gain: 5 },
      gap: '这是以赛亚·伯林所说的「两种自由概念」之争：消极自由（免于干涉）与积极自由（有能力去做）。双方推理都自洽，分歧是价值排序。',
      verdict: 'stop',
      verdictText: '逻辑都成立，分歧在价值排序。逻辑不能证明哪一种价值观绝对正确——此时停止是理性的，而不是认输。',
      chk: ['logic', 'gain'],
      text: '自由当然就是不受强制，这是显然的。政府管得越少越好，自古以来都是这样，你不懂。'
    }
  ];

  var current = 0;

  /* 标签栏只建一次，后续仅切换 is-on，避免重渲染导致键盘焦点丢失 */
  function buildTabs() {
    var tabs = document.getElementById('caseTabs');
    if (!tabs) return;

    tabs.innerHTML = CASES.map(function (c, i) {
      return '<button class="case__tab' + (i === current ? ' is-on' : '') +
             '" type="button" data-i="' + i + '">' + c.name + '</button>';
    }).join('');

    tabs.querySelectorAll('.case__tab').forEach(function (b) {
      b.addEventListener('click', function () {
        current = +b.dataset.i;
        tabs.querySelectorAll('.case__tab').forEach(function (x) {
          x.classList.toggle('is-on', +x.dataset.i === current);
        });
        renderBody();
      });
    });
  }

  function renderBody() {
    var body = document.getElementById('caseBody');
    if (!body) return;

    var c = CASES[current];
    var isStop = c.verdict === 'stop';

    var metrics = DIMS.map(function (d) {
      var v = c.scores[d.key];
      return '' +
        '<div class="case__metric">' +
          '<small>' + d.cn + '</small>' +
          '<span class="stars">' +
            Array.apply(null, Array(5)).map(function (_, i) {
              return '<i class="' + (i < v ? 'on' : '') + '" style="' +
                     (i < v ? 'background:' + d.color : '') + '"></i>';
            }).join('') +
          '</span>' +
          '<em>' + (REMARK[v] || '') + '</em>' +
        '</div>';
    }).join('');

    body.innerHTML =
      '<div class="case__top">' +
        '<div class="case__side a"><h4>观点 A</h4><p>' + c.a + '</p></div>' +
        '<div class="case__side b"><h4>观点 B</h4><p>' + c.b + '</p></div>' +
      '</div>' +

      '<div class="case__grid">' + metrics + '</div>' +

      '<div class="case__side" style="border-left:2px solid ' +
        (isStop ? 'var(--red)' : 'var(--green)') + '">' +
        '<h4>真正的分歧点</h4>' +
        '<p>' + c.gap + '</p>' +
      '</div>' +

      '<div class="case__verdict">' +
        '<span class="big" style="color:' + (isStop ? 'var(--red)' : 'var(--green)') + '">' +
          (isStop ? '停止讨论' : '继续讨论') +
        '</span>' +
        '<p>' + c.verdictText + '</p>' +
      '</div>' +

      '<div class="ana__bar">' +
        '<button class="btn btn--sm" type="button" id="caseToRadar">在雷达图中查看</button>' +
        '<button class="btn btn--sm" type="button" id="caseToAna">用诊断器分析</button>' +
        '<button class="btn btn--sm btn--ghost" type="button" id="caseToChk">带入自检清单</button>' +
      '</div>';

    var r = document.getElementById('caseToRadar');
    if (r) {
      r.addEventListener('click', function () {
        if (window.DQFRadar) window.DQFRadar.load(c.scores);
        var el = document.getElementById('radar');
        if (el && el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (window.DQF && window.DQF.backTo) window.DQF.backTo('cases', '返回案例分析');
      });
    }

    var a = document.getElementById('caseToAna');
    if (a) {
      a.addEventListener('click', function () {
        if (window.DQFAnalyzer) window.DQFAnalyzer.load(c.text);
        if (window.DQF && window.DQF.backTo) window.DQF.backTo('cases', '返回案例分析');
      });
    }

    var k = document.getElementById('caseToChk');
    if (k) {
      k.addEventListener('click', function () {
        if (window.DQFChecklist) window.DQFChecklist.preset(c.chk);
        var el = document.getElementById('checklist');
        if (el && el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (window.DQF && window.DQF.backTo) window.DQF.backTo('cases', '返回案例分析');
      });
    }
  }

  window.DQFCases = {
    data: CASES,
    init: function () {
      buildTabs();
      renderBody();
    }
  };
})();
