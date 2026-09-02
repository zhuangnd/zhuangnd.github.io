/* =============================================================
   DQF · analyzer.js — 讨论诊断器
   -------------------------------------------------------------
   设计原则：透明优先于聪明。
   这不是一个黑箱 AI 判断，而是一套可逐条核对的规则：
   每个维度的得分都由「信号词命中」驱动，命中的词会原样列出，
   用户可以立刻看出它有没有误判。

   五个维度：概念 / 标准 / 事实 / 逻辑 / 认知
   依赖：window.DQF、window.DQFRadar
   导出：window.DQFAnalyzer
   ============================================================= */
(function () {
  'use strict';

  /* ---------------- 信号词库 ---------------- */
  var LEX = {
    /* 抽象 / 多义概念：出现但没定义，就会拖垮讨论 */
    conceptWords: [
      '文明', '自由', '公平', '平等', '正义', '民主', '素质', '文化',
      '成功', '幸福', '效率', '质量', '价值', '意义', '创新', '内卷',
      '伟大', '最优', '最强', '最好', '第一', '高级', '低端',
      '割韭菜', '智商税', '骗人', '割韭菜的', '洗脑', '割裂',
      '中产', '精英', '底层', '主流', '趋势', '风口', '生态'
    ],
    /* 主动定义的信号 */
    conceptDef: [
      '指的是', '定义为', '意思是', '所谓', '这里说的', '我说的',
      '狭义', '广义', '换句话说', '具体来说', '从.*意义上', '界定为',
      '先明确一下', '口径'
    ],
    /* 比较 / 评价行为 */
    standardCmp: [
      '更', '最', '不如', '优于', '强于', '胜过', '比.*好', '比.*强',
      '第一', '历史最佳', '世界第一', '排行', '排名', '超过', '领先'
    ],
    /* 显式说明标准 */
    standardDef: [
      '标准是', '按.*来看', '按.*来说', '以.*为准', '以.*衡量',
      '指标', '衡量', '依据是', '权重', '评价', '从.*角度',
      '就.*而言', '打分', '维度', '口径'
    ],
    /* 主观代替事实 */
    evidenceSoft: [
      '我觉得', '我感觉', '我认为', '我以为', '想必', '大概', '应该吧',
      '肯定', '显然', '众所周知', '大家都', '大家都说', '网上都说',
      '网上说', '据说', '听说', '朋友说', '我朋友', '身边的人',
      '反正', '肯定是', '不用说', '还用说', '明摆着', '一看就知道'
    ],
    /* 可核对的事实支撑 */
    evidenceHard: [
      '数据', '统计', '调查', '报告', '研究', '实验', '样本', '来源',
      '引用', '文献', '论文', '证据', '数据显示', '结果表明',
      '根据', '引自', '出自', '%', '百分之', '调研', '年报', '公开数据'
    ],
    /* 推理连接词 */
    logicLink: [
      '因为', '所以', '因此', '由于', '导致', '可见', '由此可见',
      '说明', '证明', '意味着', '于是', '故而', '推出', '前提'
    ],
    /* 逻辑风险信号 */
    logicRisk: [
      '所有.*都', '全部.*都', '一定', '绝对', '永远', '从不', '必然',
      '傻', '蠢', '脑子', '无脑', '笨', '垃圾', '有病', '可笑', '荒唐',
      '本来就是这样', '自古以来', '还用说', '不用说', '就是这样',
      '你不懂', '你根本', '别杠', '杠精'
    ],
    /* 认知增量信号 */
    gainUp: [
      '原来', '没想到', '我才明白', '我理解了', '这么看来', '也就是说',
      '换个角度', '你的意思是', '我之前以为', '修正一下', '有道理',
      '受教了', '确实', '这么一说', '我同意.*部分', '分歧在于',
      '真正的分歧', '问题缩小', '重新想了想'
    ],
    /* 原地重复 / 情绪化 */
    gainDown: [
      '反正就是', '说到底还是', '不用说了', '没法聊', '懒得说',
      '你爱信不信', '就这么着', '我不跟你说', '无语', '离谱'
    ]
  };

  /* ---------------- 工具 ---------------- */
  function hits(text, words) {
    var out = [];
    words.forEach(function (w) {
      var re;
      try {
        re = new RegExp(w.indexOf('.*') > -1 ? w : w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      } catch (e) {
        re = new RegExp(w, 'g');
      }
      var m = text.match(re);
      if (m) out.push({ w: w, n: m.length });
    });
    return out;
  }

  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }
  function round1(v) {
    return Math.round(v * 10) / 10;
  }
  function total(list) {
    return list.reduce(function (s, x) { return s + x.n; }, 0);
  }

  /* ---------------- 五个维度的评分规则 ---------------- */
  var RULES = [
    {
      key: 'concept', cn: '概念定义', color: 'var(--c-concept)',
      score: function (t) {
        var vag = hits(t, LEX.conceptWords);
        var def = hits(t, LEX.conceptDef);
        var s;
        if (!vag.length && !def.length) {
          s = 3.8;                                   // 不涉及抽象概念
        } else {
          s = 3.2 + Math.min(def.length, 3) * 1.0    // 主动定义加分
                  - Math.min(total(vag), 6) * 0.62;  // 未定义抽象词扣分
        }
        return {
          v: clamp(s, 0, 5),
          hits: vag.slice(0, 5).map(function (x) { return x.w; }),
          good: def.slice(0, 3).map(function (x) { return x.w; })
        };
      },
      note: function (r, t) {
        if (!r.hits.length && !r.good.length) return '文本中没有出现需要特别定义的抽象概念。';
        if (r.good.length && r.hits.length) {
          return '已给出定义信号（' + r.good.join('、') + '），但仍有未澄清的抽象词（' + r.hits.join('、') + '）。';
        }
        if (r.good.length) return '出现了明确的定义行为（' + r.good.join('、') + '），讨论对象已收窄。';
        return '出现抽象词（' + r.hits.join('、') + '）但未给出定义，讨论对象可能不一致。';
      }
    },
    {
      key: 'standard', cn: '标准约束', color: 'var(--c-standard)',
      score: function (t) {
        var cmp = hits(t, LEX.standardCmp);
        var def = hits(t, LEX.standardDef);
        var s;
        if (!cmp.length && !def.length) {
          s = 3.6;
        } else {
          s = 3.0 + Math.min(def.length, 3) * 1.1
                  - Math.min(total(cmp), 5) * 0.5;
          if (cmp.length && !def.length) s -= 1.2;   // 有比较却不说标准，重罚
        }
        return {
          v: clamp(s, 0, 5),
          hits: cmp.slice(0, 5).map(function (x) { return x.w; }),
          good: def.slice(0, 3).map(function (x) { return x.w; })
        };
      },
      note: function (r) {
        if (!r.hits.length && !r.good.length) return '未涉及比较或评价，标准层不构成障碍。';
        if (r.hits.length && !r.good.length) {
          return '出现了比较/评价（' + r.hits.join('、') + '），但没有说明按什么标准判断——双方很可能各按各的。';
        }
        if (r.good.length) return '评价标准被显式说明（' + r.good.join('、') + '），可复核。';
        return '标准层基本清楚。';
      }
    },
    {
      key: 'evidence', cn: '事实依据', color: 'var(--c-evidence)',
      score: function (t) {
        var soft = hits(t, LEX.evidenceSoft);
        var hard = hits(t, LEX.evidenceHard);
        var s = 3.0 + Math.min(total(hard), 4) * 0.85
                    - Math.min(total(soft), 6) * 0.72;
        if (!soft.length && !hard.length) s = 2.6;   // 既无支撑也无主观，等于没证据
        return {
          v: clamp(s, 0, 5),
          hits: soft.slice(0, 5).map(function (x) { return x.w; }),
          good: hard.slice(0, 4).map(function (x) { return x.w; })
        };
      },
      note: function (r) {
        if (!r.hits.length && !r.good.length) return '既没有可核对的数据，也没有主观表述——事实层是空的。';
        if (r.good.length && r.hits.length) {
          return '有事实来源（' + r.good.join('、') + '），但混入了主观判断（' + r.hits.join('、') + '）。';
        }
        if (r.good.length) return '引用了可核对的事实支撑（' + r.good.join('、') + '）。';
        return '主要依靠主观表述（' + r.hits.join('、') + '），缺少可验证来源。';
      }
    },
    {
      key: 'logic', cn: '逻辑遵循', color: 'var(--c-logic)',
      score: function (t) {
        var link = hits(t, LEX.logicLink);
        var risk = hits(t, LEX.logicRisk);
        var s = 3.6 + Math.min(link.length, 4) * 0.6
                    - Math.min(total(risk), 5) * 0.95;
        if (!link.length && t.length > 60) s -= 0.6;  // 长文本却无推理连接词，疑似跳步
        return {
          v: clamp(s, 0, 5),
          hits: risk.slice(0, 5).map(function (x) { return x.w; }),
          good: link.slice(0, 4).map(function (x) { return x.w; })
        };
      },
      note: function (r, t) {
        if (r.hits.length) {
          return '命中逻辑风险信号（' + r.hits.join('、') + '）：常见为绝对化、以人为据或诉诸多数，结论未必由前提推出。';
        }
        if (r.good.length) return '有明确的推理连接（' + r.good.join('、') + '），链条可追踪。';
        return t.length > 60 ? '较长文本中没有推理连接词，中间环节可能被跳过了。' : '文本较短，尚不足以判断推理是否完整。';
      }
    },
    {
      key: 'gain', cn: '认知增量', color: 'var(--c-gain)',
      score: function (t) {
        var up = hits(t, LEX.gainUp);
        var down = hits(t, LEX.gainDown);
        var s = 2.0 + Math.min(total(up), 4) * 1.15
                    - Math.min(total(down), 4) * 1.0;
        return {
          v: clamp(s, 0, 5),
          hits: down.slice(0, 4).map(function (x) { return x.w; }),
          good: up.slice(0, 4).map(function (x) { return x.w; })
        };
      },
      note: function (r) {
        if (r.good.length) {
          return '出现认知增量信号（' + r.good.join('、') + '）：有人在重新表述、修正或收窄问题。';
        }
        if (r.hits.length) {
          return '出现原地重复 / 情绪化信号（' + r.hits.join('、') + '），继续讨论的边际收益偏低。';
        }
        return '未见认知增量信号，也未见明显情绪化——可能是陈述阶段，尚未进入交锋。';
      }
    }
  ];

  /* ---------------- 综合结论 ---------------- */
  function verdict(values, len) {
    var sum = 0;
    RULES.forEach(function (r) { sum += values[r.key]; });
    var avg = sum / RULES.length;

    if (len < 8) {
      return { tone: 'dim', label: '文本过短', text: '内容太少，无法做出有意义的判断。请粘贴更完整的讨论内容。' };
    }
    if (avg >= 4.0) {
      return { tone: 'green', label: '继续讨论', text: '五个维度均衡且饱满，这场讨论正在稳定产生认知。保持当前节奏。' };
    }
    if (avg >= 3.0) {
      return { tone: 'accent', label: '修复后再谈', text: '整体可用，但存在明显短板。按上面得分最低的那一层先补，再继续往下推。' };
    }
    if (avg >= 2.0) {
      return { tone: 'blue', label: '先补基础', text: '基础层（概念 / 标准 / 事实）尚未立住，此时谈结论为时过早。建议回到最低分的那一层重新对齐。' };
    }
    return { tone: 'red', label: '退出讨论', text: '多个维度同时塌陷，继续讨论的边际收益已接近零。退出不是认输，而是承认当前已无认知增量。' };
  }

  /* ---------------- 渲染 ---------------- */
  var TONE_COLOR = {
    green: 'var(--green)', accent: 'var(--accent)',
    blue: 'var(--blue)', red: 'var(--red)', dim: 'var(--text-dim)'
  };

  function render(text) {
    var out = document.getElementById('anaOut');
    if (!out) return;

    var values = {};
    var results = {};

    RULES.forEach(function (r) {
      var res = r.score(text);
      res.v = round1(res.v);
      values[r.key] = res.v;
      results[r.key] = res;
    });

    var vd = verdict(values, text.trim().length);

    var rows = RULES.map(function (r) {
      var res = results[r.key];
      var pct = (res.v / 5) * 100;
      return '' +
        '<div class="dim__row">' +
          '<span class="dim__name">' + r.cn + '</span>' +
          '<span class="dim__track"><span class="dim__fill" style="width:' + pct + '%;background:' + r.color + '"></span></span>' +
          '<span class="dim__val">' + res.v.toFixed(1) + '</span>' +
          '<span class="dim__note">' + r.note(res, text) + '</span>' +
        '</div>';
    }).join('');

    var hitList = [];
    RULES.forEach(function (r) {
      var res = results[r.key];
      res.hits.forEach(function (w) { hitList.push({ c: r.color, t: r.cn + ' 风险', w: w }); });
      res.good.forEach(function (w) { hitList.push({ c: 'var(--green)', t: r.cn + ' 支撑', w: w }); });
    });

    var hitsHTML = hitList.length
      ? '<div class="ana__hits">' + hitList.slice(0, 12).map(function (h) {
          return '<div class="hit"><b style="color:' + h.c + '">' + h.t + '</b><span>' + h.w + '</span></div>';
        }).join('') + '</div>'
      : '<div class="hit"><b>无</b><span>未命中任何信号词。文本可能过短，或表述非常中性。</span></div>';

    out.innerHTML =
      '<div class="verdict">' +
        '<span class="verdict__badge" style="background:color-mix(in srgb,' + TONE_COLOR[vd.tone] + ' 16%,transparent);color:' + TONE_COLOR[vd.tone] + '">' + vd.label + '</span>' +
        '<p>' + vd.text + '</p>' +
      '</div>' +
      '<div class="dim">' + rows + '</div>' +
      '<div class="card__label" style="margin-bottom:8px">命中信号（可逐条核对）</div>' +
      hitsHTML;

    /* 同步雷达图 */
    if (window.DQFRadar) {
      window.DQFRadar.draw(document.getElementById('anaRadar'), values);
    }
    return values;
  }

  /* ---------------- 交互 ---------------- */
  var DEMO = '直播带货都是骗人的。我朋友上次买的东西根本没法用，网上都说这个行业迟早要完。反正就是割韭菜，不用说了。';

  function init() {
    var ta = document.getElementById('anaInput');
    var meta = document.getElementById('anaMeta');
    var out = document.getElementById('anaOut');
    if (!ta) return;

    function updMeta() {
      if (meta) meta.textContent = ta.value.trim().length + ' 字';
    }

    ta.addEventListener('input', updMeta);

    var run = document.getElementById('anaRun');
    if (run) {
      run.addEventListener('click', function () {
        if (!ta.value.trim()) { ta.focus(); return; }
        if (out) out.classList.add('is-busy');
        // 轻微延时，让扫光动效可见，也避免大段文本时的卡顿感
        setTimeout(function () {
          render(ta.value);
          if (out) out.classList.remove('is-busy');
        }, 260);
      });
    }

    var demo = document.getElementById('anaDemo');
    if (demo) {
      demo.addEventListener('click', function () {
        ta.value = DEMO;
        updMeta();
        render(ta.value);
      });
    }

    var clear = document.getElementById('anaClear');
    if (clear) {
      clear.addEventListener('click', function () {
        ta.value = '';
        updMeta();
        if (out) {
          out.innerHTML = '<div class="ana__empty">输入内容后点击「分析这段讨论」<br>或在下方案例中选择一个场景</div>';
        }
        if (window.DQFRadar) {
          window.DQFRadar.draw(document.getElementById('anaRadar'),
            { concept: 0, standard: 0, evidence: 0, logic: 0, gain: 0 });
        }
        ta.focus();
      });
    }

    /* Ctrl / Cmd + Enter 快捷分析 */
    ta.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (run) run.click();
      }
    });

    updMeta();
  }

  window.DQFAnalyzer = {
    init: init,
    analyze: render,
    demo: DEMO,
    /* 供案例分析调用 */
    load: function (text) {
      var ta = document.getElementById('anaInput');
      if (!ta) return;
      ta.value = text;
      var meta = document.getElementById('anaMeta');
      if (meta) meta.textContent = ta.value.trim().length + ' 字';
      render(text);
      var el = document.getElementById('analyzer');
      if (el && el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
})();
