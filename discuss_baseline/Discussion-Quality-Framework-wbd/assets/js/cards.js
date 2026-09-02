/* =============================================================
   DQF · cards.js — 五大基线交互卡片
   -------------------------------------------------------------
   职责：持有五大基线的内容数据，渲染卡片，展开/收起，
        并响应精度滑块的变化（卡片底部的「当前要求」）。
   依赖：window.DQF（由 app.js 提供工具函数）
   导出：window.DQFCards
   ============================================================= */
(function () {
  'use strict';

  /* ---------------- 数据 ---------------- */
  var BASELINES = [
    {
      key: 'concept',
      en: 'Concept Definition',
      cn: '概念定义',
      color: 'var(--c-concept)',
      icon: 'assets/icons/icon-concept.svg',
      teaser: '确定讨论对象。在讨论开始前统一「我们到底在说什么」。',
      blocks: [
        {
          label: '作用',
          text: '统一讨论对象。它回答一个问题：我们讨论的是同一个东西吗？'
        },
        {
          label: '为什么重要',
          text: '大量争论并不是观点不同，而是对象不同。「文明是什么」「自由是什么」「效率高是什么意思」——如果双方没有统一定义，后面所有推理都建立在不同对象上，讨论两小时也只是在各自说话。'
        },
        {
          label: '常见错误',
          text: '偷换概念；语义漂移（讨论中途悄悄改变了词的含义）；把多义词当单义词用；用比喻、口号或举例代替定义；把「大家都懂」当成已定义。'
        },
        {
          label: '示例',
          tags: ['文明', '自由', '公平', 'AI', '效率高', '成功']
        }
      ],
      when: '出现抽象名词、且双方都没说明它指什么时，必须先停下来定义。'
    },
    {
      key: 'standard',
      en: 'Standard Constraint',
      cn: '标准约束',
      color: 'var(--c-standard)',
      icon: 'assets/icons/icon-standard.svg',
      teaser: '确定评价函数。先讨论「什么算成立」，再讨论事实。',
      blocks: [
        {
          label: '作用',
          text: '统一评价规则。它回答一个问题：依据什么判断对错、高下、成败？'
        },
        {
          label: '为什么重要',
          text: '标准不同时，双方可能同时正确。NBA 的历史最佳之争就是典型：一组人按 MVP、冠军、累积数据评价，另一组人按技术天花板、巅峰高度、比赛影响力评价——这不是事实冲突，而是评价函数不同。没有共同的评价函数，就不存在统一结论。'
        },
        {
          label: '常见错误',
          text: '隐含标准（不说明自己按什么评价）；中途换标准（结论不利时改用另一套）；用结果反推标准；对己对人使用双重标准；把「综合评价」当作无需说明的免责声明。'
        },
        {
          label: '示例',
          tags: ['世界第一', '伟大', '成功', '最优', '划算', '有价值']
        }
      ],
      when: '只要出现比较级或最高级（更好、最强、第一），就必须先问「按什么标准」。'
    },
    {
      key: 'evidence',
      en: 'Evidence',
      cn: '事实依据',
      color: 'var(--c-evidence)',
      icon: 'assets/icons/icon-evidence.svg',
      teaser: '确认前提为真。逻辑管不了前提本身的真假。',
      blocks: [
        {
          label: '作用',
          text: '保证前提真实。它回答一个问题：我们引用的东西，是真的吗？'
        },
        {
          label: '为什么重要',
          text: '逻辑只能保证「如果前提为真，则结论成立」，它不能保证前提本身为真。定义正确、标准正确、推理也正确，只要数据是假的，结论依然是错的。因此事实依据必须作为独立的一层，而不是隐含在逻辑之中。'
        },
        {
          label: '常见错误',
          text: '以个人经历代替样本；幸存者偏差；把相关当因果；引用无从核实的「研究表明」「网上都说」；把感受当数据（「我觉得明显变好了」）；只看支持自己立场的证据。'
        },
        {
          label: '示例',
          tags: ['数据', '样本', '来源', '统计方法', '偏差', '可复现']
        }
      ],
      when: '一旦有人用「我觉得」支撑事实判断，就该追问：有多少样本？来源是什么？'
    },
    {
      key: 'logic',
      en: 'Logical Validity',
      cn: '逻辑遵循',
      color: 'var(--c-logic)',
      icon: 'assets/icons/icon-logic.svg',
      teaser: '保证推理有效。每一步推导都要能站住，不能跳步。',
      blocks: [
        {
          label: '作用',
          text: '保证推理有效。它回答一个问题：结论是从前提中有效推出的吗？'
        },
        {
          label: '为什么重要',
          text: '前三步都成立之后，才真正进入推理。而推理的每一步都需要证明：「GDP 增长 → 收入增长 → 居民收入增长 → 所有居民都更富有」，中间每一环都是一次独立的主张，跳一步，结论就悬空。'
        },
        {
          label: '常见错误',
          text: '跳步（省略关键中间环节）；偷换命题；循环论证；把相关当因果；以人为据（攻击对方而非论点）；诉诸多数；假两难（只给两个极端选项）；滑坡推论。'
        },
        {
          label: '示例',
          tags: ['GDP 增长 → 人人富有', '房价涨 → 租金涨', '相关 ≠ 因果', '举不出反例 ≠ 成立']
        }
      ],
      when: '出现「所以」「可见」「由此可见」时，把中间的推导环节逐个摊开检查。'
    },
    {
      key: 'gain',
      en: 'Cognitive Gain',
      cn: '认知增量',
      color: 'var(--c-gain)',
      icon: 'assets/icons/icon-gain.svg',
      teaser: '收益评估层。讨论结束后，是否有人获得了新的认知？',
      blocks: [
        {
          label: '作用',
          text: '评估这场讨论的收益。它回答一个问题：有没有人因此知道得更多了？'
        },
        {
          label: '为什么重要',
          text: '它把讨论目标从「说服对方」转向「增加认知」。前者容易变成输赢之争，让讨论滑向情绪与话术比拼；后者是可累积的——即便这次没有统一结论，澄清的概念、明确的边界、发现的漏洞都会沉淀到下一次分析里。'
        },
        {
          label: '常见错误',
          text: '把「没说服对方」当成失败；把「声音更大」当成赢了；只重复己方观点而不再回应对方论证；把情绪输出当成观点表达。'
        },
        {
          label: '示例',
          tags: ['学到新事实', '发现定义不准', '意识到另一套标准', '找到推理漏洞', '明确暂无法定论', '定位真正的分歧点']
        }
      ],
      when: '讨论超过十分钟仍无进展时，问一句：我们中有谁的想法因此改变过一点点？'
    }
  ];

  /* ---------------- 渲染 ---------------- */
  var grid = null;
  var built = false;
  var currentLevel = 1;

  function cardHTML(b, i) {
    var blocks = b.blocks.map(function (blk) {
      if (blk.tags) {
        return '' +
          '<div class="card__block">' +
            '<div class="card__label">' + blk.label + '</div>' +
            '<div class="card__tags">' +
              blk.tags.map(function (t) {
                return '<span class="chip">' + t + '</span>';
              }).join('') +
            '</div>' +
          '</div>';
      }
      return '' +
        '<div class="card__block">' +
          '<div class="card__label">' + blk.label + '</div>' +
          '<p>' + blk.text + '</p>' +
        '</div>';
    }).join('');

    return '' +
      '<article class="card" style="--card-color:' + b.color + '" data-key="' + b.key + '">' +
        '<button class="card__head" type="button" aria-expanded="false">' +
          '<span class="card__icon"><img src="' + b.icon + '" alt=""></span>' +
          '<span class="card__titles">' +
            '<span class="card__en">' + b.en + '</span>' +
            '<span class="card__cn">' + (i + 1) + '. ' + b.cn + '</span>' +
          '</span>' +
          '<span class="card__caret">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>' +
          '</span>' +
        '</button>' +
        '<p class="card__teaser">' + b.teaser + '</p>' +
        '<div class="card__body">' +
          blocks +
          '<div class="card__req">' +
            '<span data-req-text>' + b.when + '</span>' +
            '<span data-req-stars></span>' +
          '</div>' +
        '</div>' +
      '</article>';
  }

  function build() {
    grid = document.getElementById('cardsGrid');
    if (!grid) return;
    grid.innerHTML = BASELINES.map(cardHTML).join('');

    grid.querySelectorAll('.card__head').forEach(function (head) {
      head.addEventListener('click', function () {
        var card = head.closest('.card');
        var open = card.classList.toggle('is-open');
        head.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    });
    built = true;
  }

  /* ---------------- 精度联动 ---------------- */
  function setPrecision(idx) {
    currentLevel = idx;
    if (!built) return;

    var levels = window.DQF && window.DQF.PRECISION ? window.DQF.PRECISION[idx] : null;
    if (!levels || !levels.stars) return;

    BASELINES.forEach(function (b) {
      var card = grid.querySelector('.card[data-key="' + b.key + '"]');
      if (!card) return;
      var stars = card.querySelector('[data-req-stars]');
      if (stars) stars.innerHTML = window.DQF.stars(levels.stars[b.key], 5, 'sm');
    });
  }

  window.DQFCards = {
    data: BASELINES,
    init: function () {
      build();
      setPrecision(currentLevel);
    },
    setPrecision: setPrecision
  };
})();
