/* =============================================================
   DQF · flow.js — D3 动态流程图
   -------------------------------------------------------------
   职责：用 D3 绘制「五道闸门」流程图，支持
         · 节点点击 → 右侧面板同步说明
         · YES 向下走，NO 走右侧红色虚线支路
         · 首次滚动到视口时连线逐条 draw-in
         · 选中节点时其 NO 支路高亮
   依赖：D3 v7（assets/js/vendor/d3.min.js）、window.DQF
   导出：window.DQFFlow
   ============================================================= */
(function () {
  'use strict';

  /* ---------------- 数据 ---------------- */
  var FLOW = [
    {
      id: 'concept', en: 'CONCEPT', cn: '概念一致？', color: 'var(--c-concept)',
      q: '我们讨论的是同一个对象吗？',
      desc: '第一道闸门。如果双方说的根本不是同一个东西，后面所有推理都建立在不同对象上——推理做得再严谨，结论也与你无关。',
      yes: '对象一致，进入第二层：标准约束。',
      no: '讨论对象不同。此时继续争论不会收敛，应先退回定义层，把「我们到底在说什么」讲清楚。',
      repair: '回到概念定义'
    },
    {
      id: 'standard', en: 'STANDARD', cn: '标准一致？', color: 'var(--c-standard)',
      q: '我们在用同一套评价标准吗？',
      desc: '第二道闸门。很多人把「结论不同」误认为「事实判断不同」，实际上只是评价函数不同——按冠军数还是按巅峰高度，答案天然相反。',
      yes: '标准一致，进入第三层：事实依据。',
      no: '双方各按各的标准，且都可能正确。先协商「按什么判断」，再谈谁对。',
      repair: '协商评价标准'
    },
    {
      id: 'evidence', en: 'EVIDENCE', cn: '事实一致？', color: 'var(--c-evidence)',
      q: '我们引用的事实可靠吗？',
      desc: '第三道闸门。逻辑只能保证「前提为真则结论成立」，它管不了前提本身的真假。这一步检查证据的来源、样本、统计方法与偏差。',
      yes: '事实可靠，进入第四层：逻辑遵循。',
      no: '前提存疑。要么补充可验证、可复现的证据，要么把结论降级为「目前只是一个猜测」。',
      repair: '补充可验证证据'
    },
    {
      id: 'logic', en: 'LOGIC', cn: '逻辑成立？', color: 'var(--c-logic)',
      q: '结论是从前提有效推出的吗？',
      desc: '第四道闸门。把推理链条逐步摊开检查：有没有跳步？有没有偷换命题？有没有把相关当因果？有没有循环论证或诉诸多数？',
      yes: '推理有效，进入第五层：认知增量。',
      no: '推理断裂。定位断在哪一步，修好链条再谈结论——结论正确不代表推理正确。',
      repair: '修正推理链条'
    },
    {
      id: 'gain', en: 'GAIN', cn: '产生认知？', color: 'var(--c-gain)',
      q: '这场讨论产生了新的认知吗？',
      desc: '第五道闸门，也是整个框架的收益评估层。它不问「谁赢了」，而问「有没有人因此知道得更多」。',
      yes: '有认知增量，讨论值得继续。',
      no: '进入退出判断：继续讨论的边际收益已接近零，此时停止是一种理性决策。',
      repair: '退出讨论'
    }
  ];

  /* ---------------- 几何 ---------------- */
  var W = 560, H = 604;
  var NW = 160, NH = 44;          // 主节点尺寸
  var X = 30;                     // 主列左边
  var RX = 356, RW = 164;         // 右侧支路列
  var YS = [20, 128, 236, 344, 452];
  var END_Y = 544, END_H = 40;    // 底部「继续讨论」

  var CX = X + NW / 2;            // 主列中线 = 110

  var svgSel = null;
  var panelEl = null;
  var current = 0;

  /* ---------------- 面板 ---------------- */
  function renderPanel(i) {
    var d = FLOW[i];
    panelEl.innerHTML =
      '<h3>' + (i + 1) + '. ' + d.cn + '</h3>' +
      '<div class="q">' + d.q + '</div>' +
      '<p>' + d.desc + '</p>' +
      '<div class="flow__branch">' +
        '<div class="yes"><h4>YES</h4><p>' + d.yes + '</p></div>' +
        '<div class="no"><h4>NO</h4><p>' + d.no + '</p></div>' +
      '</div>' +
      '<div class="flow__foot">' +
        '<a class="btn btn--sm" href="#gain">查看认知增量</a>' +
        '<a class="btn btn--sm btn--ghost" href="#exit">进入退出判断</a>' +
      '</div>';
  }

  function select(i) {
    current = i;
    if (!svgSel) return;
    svgSel.selectAll('.flow__node').classed('is-on', function (d) {
      return d && d.i === i;
    });
    svgSel.selectAll('.flow__link').classed('is-lit', function (d) {
      return d && d.from === i && d.kind === 'no';
    });
    renderPanel(i);
  }

  /* ---------------- 绘制 ---------------- */
  function draw() {
    var svgNode = document.getElementById('flowSvg');
    panelEl = document.getElementById('flowPanel');
    if (!svgNode) return;

    if (!window.d3) {
      var fb = document.getElementById('flowFallback');
      if (fb) fb.hidden = false;
      svgNode.style.display = 'none';
      // D3 缺失时仍给出静态面板，保证信息不丢
      renderPanel(0);
      return;
    }

    svgNode.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svgNode.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svgSel = d3.select(svgNode);
    svgSel.selectAll('*').remove();

    /* --- 箭头 --- */
    var defs = svgSel.append('defs');
    defs.append('marker')
      .attr('id', 'arw').attr('viewBox', '0 0 10 10')
      .attr('refX', 9).attr('refY', 5)
      .attr('markerWidth', 6).attr('markerHeight', 6)
      .attr('orient', 'auto-start-reverse')
      .append('path').attr('d', 'M0,1 L9,5 L0,9')
      .attr('fill', 'var(--text-faint)');
    defs.append('marker')
      .attr('id', 'arw-no').attr('viewBox', '0 0 10 10')
      .attr('refX', 9).attr('refY', 5)
      .attr('markerWidth', 6).attr('markerHeight', 6)
      .attr('orient', 'auto-start-reverse')
      .append('path').attr('d', 'M0,1 L9,5 L0,9')
      .attr('fill', 'var(--red)');

    /* --- 连线数据 --- */
    var links = [];
    for (var i = 0; i < YS.length - 1; i++) {
      links.push({
        kind: 'yes', from: i, to: i + 1,
        d: 'M' + CX + ',' + (YS[i] + NH) + ' V' + YS[i + 1],
        label: 'YES', lx: CX + 8, ly: (YS[i] + NH + YS[i + 1]) / 2 + 3
      });
    }
    for (var j = 0; j < YS.length; j++) {
      var yMid = YS[j] + NH / 2;
      links.push({
        kind: 'no', from: j, to: 'r' + j,
        d: 'M' + (X + NW) + ',' + yMid + ' H' + RX,
        label: 'NO', no: true, lx: X + NW + 14, ly: yMid - 6
      });
    }
    // 第五关 YES → 继续讨论
    links.push({
      kind: 'yes', from: 4, to: 'end',
      d: 'M' + CX + ',' + (YS[4] + NH) + ' V' + END_Y,
      label: 'YES', lx: CX + 8, ly: (YS[4] + NH + END_Y) / 2 + 3
    });

    var gLink = svgSel.append('g').attr('class', 'flow-links');
    var linkSel = gLink.selectAll('path').data(links).join('path')
      .attr('class', function (d) {
        return 'flow__link' + (d.kind === 'no' ? ' is-no' : '');
      })
      .attr('d', function (d) { return d.d; })
      .attr('marker-end', function (d) {
        return d.kind === 'no' ? 'url(#arw-no)' : 'url(#arw)';
      });

    var labSel = gLink.selectAll('text').data(links).join('text')
      .attr('class', function (d) {
        return 'flow__elabel' + (d.kind === 'no' ? ' no' : '');
      })
      .attr('x', function (d) { return d.lx; })
      .attr('y', function (d) { return d.ly; })
      .text(function (d) { return d.label; });

    /* --- 主节点 --- */
    var mainNodes = FLOW.map(function (d, k) {
      return {
        i: k, kind: 'main', x: X, y: YS[k], w: NW, h: NH,
        cn: d.cn, en: d.en, color: d.color
      };
    });
    // 右侧支路终点
    var rightNodes = FLOW.map(function (d, k) {
      return {
        i: k, kind: 'right', x: RX, y: YS[k], w: RW, h: NH,
        cn: d.repair, en: '',
        color: d.color, isExit: k === 4
      };
    });
    // 底部终点
    var endNode = {
      i: 5, kind: 'end', x: X, y: END_Y, w: NW, h: END_H,
      cn: '继续讨论', en: 'CONTINUE', color: 'var(--green)'
    };

    var nodes = mainNodes.concat(rightNodes, [endNode]);

    var gNode = svgSel.append('g').attr('class', 'flow-nodes');
    var nodeSel = gNode.selectAll('g').data(nodes).join('g')
      .attr('class', 'flow__node')
      .attr('transform', function (d) {
        return 'translate(' + d.x + ',' + d.y + ')';
      });

    nodeSel.append('rect')
      .attr('width', function (d) { return d.w; })
      .attr('height', function (d) { return d.h; })
      .attr('rx', 11)
      .style('stroke', function (d) {
        if (d.kind === 'right' && d.isExit) return 'var(--red-line)';
        if (d.kind === 'right') return 'var(--border)';
        if (d.kind === 'end') return 'var(--green-line)';
        return 'var(--border-strong)';
      })
      .style('fill', function (d) {
        if (d.kind === 'right' && d.isExit) return 'var(--red-soft)';
        if (d.kind === 'end') return 'var(--green-soft)';
        return null;
      });

    nodeSel.append('text')
      .attr('class', 'fn-cn')
      .attr('x', 15)
      .attr('y', function (d) { return d.kind === 'end' ? 25 : 20; })
      .text(function (d) { return d.cn; });

    nodeSel.filter(function (d) { return d.en; })
      .append('text')
      .attr('class', 'fn-en')
      .attr('x', 15)
      .attr('y', function (d) { return d.kind === 'end' ? 25 : 36; })
      .text(function (d) { return d.en; });

    // 只有主节点可点击
    nodeSel.filter(function (d) { return d.kind === 'main'; })
      .style('cursor', 'pointer')
      .on('click', function (evt, d) { select(d.i); });

    /* --- 连线 draw-in 动画 --- */
    linkSel.each(function () {
      var len = this.getTotalLength ? this.getTotalLength() : 200;
      d3.select(this)
        .style('stroke-dasharray', len + ' ' + len)
        .style('stroke-dashoffset', len)
        .style('opacity', 0);
    });
    labSel.style('opacity', 0);

    function revealLinks() {
      linkSel.transition()
        .delay(function (d, k) { return k * 55; })
        .duration(420)
        .style('opacity', 1)
        .styleTween('stroke-dashoffset', function () {
          var len = this.getTotalLength ? this.getTotalLength() : 200;
          return d3.interpolateNumber(len, 0);
        });
      labSel.transition().delay(function (d, k) { return k * 55 + 260; })
        .duration(200).style('opacity', 1);
    }

    var stage = document.getElementById('flowStage');
    if (stage && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            revealLinks();
            io.disconnect();
          }
        });
      }, { threshold: 0.25 });
      io.observe(stage);
    } else {
      revealLinks();
    }

    select(0);
  }

  window.DQFFlow = {
    data: FLOW,
    init: draw,
    select: select
  };
})();
