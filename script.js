function createRange(start, end, step) {
  const values = [];
  for (let x = start; x <= end + 0.000001; x += step) {
    values.push(Number(x.toFixed(4)));
  }
  return values;
}

function pointsFrom(xs, fn) {
  return xs.map((x) => ({ x: x, y: fn(x) }));
}

function normalizeText(value) {
  return value.toLowerCase().replace(/\s+/g, ' ').trim();
}

function sameSet(a, b) {
  if (a.length !== b.length) return false;
  const setA = new Set(a);
  return b.every((item) => setA.has(item));
}

function formatNumber(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function buildAbsoluteFormula(a, h, k) {
  const aText = a === 1 ? '' : a === -1 ? '-' : formatNumber(a);
  const hText = h === 0 ? 'x' : h > 0 ? 'x-' + formatNumber(h) : 'x+' + formatNumber(Math.abs(h));
  const kText = k === 0 ? '' : k > 0 ? '+' + formatNumber(k) : formatNumber(k);
  return '\\(f(x)=' + aText + '|' + hText + '|'+ kText + '\\)';
}

const emphasizedAxesPlugin = {
  id: 'emphasizedAxesPlugin',
  afterDraw(chart) {
    const xScale = chart.scales.x;
    const yScale = chart.scales.y;
    if (!xScale || !yScale) return;

    const hasZeroX = yScale.min <= 0 && yScale.max >= 0;
    const hasZeroY = xScale.min <= 0 && xScale.max >= 0;
    const ctx = chart.ctx;
    const axisColor = '#111827';
    const xLineY = hasZeroX ? yScale.getPixelForValue(0) : yScale.bottom;
    const yLineX = hasZeroY ? xScale.getPixelForValue(0) : xScale.left;

    function drawArrow(x1, y1, x2, y2) {
      const headLength = 8;
      const angle = Math.atan2(y2 - y1, x2 - x1);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineTo(
        x2 - headLength * Math.cos(angle - Math.PI / 6),
        y2 - headLength * Math.sin(angle - Math.PI / 6)
      );
      ctx.moveTo(x2, y2);
      ctx.lineTo(
        x2 - headLength * Math.cos(angle + Math.PI / 6),
        y2 - headLength * Math.sin(angle + Math.PI / 6)
      );
      ctx.stroke();
    }

    function drawChip(text, x, y) {
      ctx.font = '700 12px Source Sans 3';
      const width = ctx.measureText(text).width + 16;
      const height = 22;
      ctx.fillStyle = axisColor;
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, 11);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillText(text, x + 8, y + 15);
    }

    ctx.save();
    ctx.lineWidth = 2.8;
    ctx.strokeStyle = axisColor;

    if (hasZeroX) {
      ctx.beginPath();
      ctx.moveTo(xScale.left, xLineY);
      ctx.lineTo(xScale.right, xLineY);
      ctx.stroke();
    }

    if (hasZeroY) {
      ctx.beginPath();
      ctx.moveTo(yLineX, yScale.top);
      ctx.lineTo(yLineX, yScale.bottom);
      ctx.stroke();
    }

    drawArrow(xScale.right - 18, xLineY, xScale.right, xLineY);
    drawArrow(yLineX, yScale.top + 18, yLineX, yScale.top);
    drawChip('X: abscisas', xScale.right - 96, yScale.bottom - 30);
    drawChip('Y: ordenadas', xScale.left + 10, yScale.top + 8);

    ctx.restore();
  }
};

function createLinearChart(canvasId, datasets, bounds, withLegend) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || typeof Chart === 'undefined') return null;

  return new Chart(canvas, {
    type: 'scatter',
    data: { datasets: datasets },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 2.2,
      animation: false,
      plugins: {
        emphasizedAxesPlugin: true,
        legend: { display: Boolean(withLegend) },
        tooltip: { enabled: true }
      },
      scales: {
        x: {
          type: 'linear',
          min: bounds.xMin,
          max: bounds.xMax,
          ticks: { color: '#3b414a' },
          grid: { color: '#d7dce2' },
          border: { color: '#1f2429', width: 2 },
          title: {
            display: true,
            text: 'Eje de abscisas (x)',
            color: '#1f2429',
            font: { weight: 'bold' }
          }
        },
        y: {
          min: bounds.yMin,
          max: bounds.yMax,
          ticks: { color: '#3b414a' },
          grid: { color: '#d7dce2' },
          border: { color: '#1f2429', width: 2 },
          title: {
            display: true,
            text: 'Eje de ordenadas (y)',
            color: '#1f2429',
            font: { weight: 'bold' }
          }
        }
      },
      elements: {
        line: { borderWidth: 3, tension: 0.08 },
        point: { radius: 0 }
      }
    }
  });
}

function setFeedback(node, ok, message) {
  if (!node) return;
  node.textContent = message;
  node.classList.remove('ok', 'bad');
  node.classList.add(ok ? 'ok' : 'bad');
}

function initVocabulary() {
  const cards = Array.from(document.querySelectorAll('.vocab-card'));
  cards.forEach((card) => {
    card.addEventListener('click', () => {
      card.classList.toggle('active');
      const term = card.dataset.term || '';
      const def = card.dataset.def || '';
      card.setAttribute('aria-label', term + ': ' + def);
    });
  });

  const starterButtons = Array.from(document.querySelectorAll('#starter-chips button'));
  const output = document.getElementById('starter-output');
  starterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      if (!output) return;
      const chunk = button.dataset.starter || '';
      output.value = (output.value + ' ' + chunk).trim() + ' ';
      output.focus();
    });
  });
}

function initObserveAndDescribe() {
  const tasks = [
    {
      title: 'Graph 1: Linear behavior',
      formula: '\\(f(x)=0.8x-1\\)',
      hint: 'Look at slope and intercept: one constant change.',
      statements: [
        'The function is increasing in all the interval.',
        'The graph cuts the y-axis at y = -1.',
        'The graph is an exponential curve.',
        'It has a maximum point.'
      ],
      correct: [0, 1],
      data: [{
        data: pointsFrom(createRange(-6, 6, 0.2), (x) => 0.8 * x - 1),
        showLine: true,
        borderColor: '#b5242b',
        backgroundColor: '#b5242b'
      }],
      bounds: { xMin: -6, xMax: 6, yMin: -6, yMax: 6 }
    },
    {
      title: 'Graph 2: Quadratic behavior',
      formula: '\\(f(x)=-(x-1)^2+4\\)',
      hint: 'There is a highest point: the vertex.',
      statements: [
        'The function has a maximum point near (1,4).',
        'The graph opens upward.',
        'It is decreasing and then increasing.',
        'It has no x-intercepts.'
      ],
      correct: [0],
      data: [{
        data: pointsFrom(createRange(-3, 5, 0.1), (x) => -1 * Math.pow(x - 1, 2) + 4),
        showLine: true,
        borderColor: '#0f766e',
        backgroundColor: '#0f766e'
      }],
      bounds: { xMin: -3, xMax: 5, yMin: -4, yMax: 5 }
    },
    {
      title: 'Graph 3: Piecewise behavior',
      formula: '\\(f(x)=\\begin{cases}x+1,&x<0\\\\x^2,&x\\ge 0\\end{cases}\\)',
      hint: 'At x = 0 there is a jump between y = 1 and y = 0.',
      statements: [
        'The function is continuous at x = 0.',
        'The graph is discontinuous at x = 0.',
        'For x >= 0 the graph follows a parabola.',
        'For x < 0 the graph is horizontal.'
      ],
      correct: [1, 2],
      data: [
        {
          data: pointsFrom(createRange(-6, -0.2, 0.2), (x) => x + 1),
          showLine: true,
          borderColor: '#b5242b',
          backgroundColor: '#b5242b'
        },
        {
          data: pointsFrom(createRange(0, 6, 0.2), (x) => x * x),
          showLine: true,
          borderColor: '#b5242b',
          backgroundColor: '#b5242b'
        },
        {
          data: [{ x: 0, y: 1 }],
          showLine: false,
          pointRadius: 5,
          pointHoverRadius: 6,
          pointBackgroundColor: '#ffffff',
          pointBorderColor: '#b5242b',
          pointBorderWidth: 2
        },
        {
          data: [{ x: 0, y: 0 }],
          showLine: false,
          pointRadius: 5,
          pointHoverRadius: 6,
          pointBackgroundColor: '#b5242b',
          pointBorderColor: '#b5242b',
          pointBorderWidth: 2
        }
      ],
      bounds: { xMin: -6, xMax: 6, yMin: -6, yMax: 16 }
    }
  ];

  const title = document.getElementById('observe-title');
  const formula = document.getElementById('observe-formula');
  const optionsBox = document.getElementById('observe-options');
  const textBox = document.getElementById('observe-text');
  const feedback = document.getElementById('observe-feedback');
  const hintBtn = document.getElementById('observe-hint');
  const checkBtn = document.getElementById('observe-check');
  const resetBtn = document.getElementById('observe-reset');
  const tryBtn = document.getElementById('observe-try');
  const nextBtn = document.getElementById('observe-next');

  let current = 0;
  let chart = null;

  function renderTask() {
    const task = tasks[current];
    if (!task || !title || !formula || !optionsBox) return;

    title.textContent = task.title;
    formula.textContent = task.formula;
    optionsBox.innerHTML = '';

    task.statements.forEach((statement, index) => {
      const row = document.createElement('label');
      row.className = 'option-item';

      const input = document.createElement('input');
      input.type = 'checkbox';
      input.value = String(index);

      const text = document.createElement('span');
      text.textContent = statement;

      row.appendChild(input);
      row.appendChild(text);
      optionsBox.appendChild(row);
    });

    if (chart) chart.destroy();
    chart = createLinearChart('observe-chart', task.data, task.bounds, false);

    if (feedback) {
      feedback.textContent = '';
      feedback.classList.remove('ok', 'bad');
    }
    if (textBox) textBox.value = '';

    if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
      MathJax.typesetPromise([formula]).catch(() => {});
    }
  }

  function clearSelections() {
    const checks = Array.from(optionsBox.querySelectorAll('input[type="checkbox"]'));
    checks.forEach((check) => {
      check.checked = false;
    });
    if (textBox) textBox.value = '';
  }

  if (hintBtn) {
    hintBtn.addEventListener('click', () => {
      setFeedback(feedback, true, 'Hint: ' + tasks[current].hint);
    });
  }

  if (checkBtn) {
    checkBtn.addEventListener('click', () => {
      const selected = Array.from(optionsBox.querySelectorAll('input:checked')).map((input) => Number(input.value));
      const text = normalizeText(textBox ? textBox.value : '');

      const optionsOk = sameSet(selected, tasks[current].correct);
      const languageOk = text.length >= 30 && (text.includes('because') || text.includes('increasing') || text.includes('decreasing'));

      if (optionsOk && languageOk) {
        setFeedback(feedback, true, 'Great. Correct graph analysis and clear English justification.');
      } else if (optionsOk) {
        setFeedback(feedback, false, 'Good graph reading. Add a longer English justification using because.');
      } else {
        setFeedback(feedback, false, 'Not yet. Re-check the behavior and use Show hint.');
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      clearSelections();
      setFeedback(feedback, true, 'Activity reset. Start again.');
    });
  }

  if (tryBtn) {
    tryBtn.addEventListener('click', () => {
      setFeedback(feedback, true, 'Try again: focus on intercepts, variation and continuity.');
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      current = (current + 1) % tasks.length;
      renderTask();
    });
  }

  renderTask();
}

function initSliderChart() {
  const sliderA = document.getElementById('slider-a');
  const sliderH = document.getElementById('slider-h');
  const sliderK = document.getElementById('slider-k');
  const valueA = document.getElementById('value-a');
  const valueH = document.getElementById('value-h');
  const valueK = document.getElementById('value-k');
  const formula = document.getElementById('slider-formula');

  if (!sliderA || !sliderH || !sliderK) return;

  let chart = null;

  function render() {
    const a = Number(sliderA.value);
    const h = Number(sliderH.value);
    const k = Number(sliderK.value);

    if (valueA) valueA.textContent = String(a);
    if (valueH) valueH.textContent = String(h);
    if (valueK) valueK.textContent = String(k);
    if (formula) {
      formula.textContent = buildAbsoluteFormula(a, h, k);
      if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
        MathJax.typesetPromise([formula]).catch(() => {});
      }
    }

    const data = [{
      data: pointsFrom(createRange(-8, 8, 0.1), (x) => a * Math.abs(x - h) + k),
      showLine: true,
      borderColor: '#0b7285',
      backgroundColor: '#0b7285'
    }];

    if (chart) chart.destroy();
    chart = createLinearChart('slider-chart', data, { xMin: -8, xMax: 8, yMin: -8, yMax: 10 }, false);
  }

  [sliderA, sliderH, sliderK].forEach((slider) => {
    slider.addEventListener('input', render);
  });

  render();
}

function initMatchActivity() {
  const bank = document.getElementById('desc-bank');
  const draggables = Array.from(document.querySelectorAll('.draggable'));
  const zones = Array.from(document.querySelectorAll('.dropzone'));
  const checkBtn = document.getElementById('match-check');
  const resetBtn = document.getElementById('match-reset');
  const hintBtn = document.getElementById('match-hint');
  const tryBtn = document.getElementById('match-try');
  const feedback = document.getElementById('match-feedback');

  if (!bank) return;

  const assignments = { a: '', b: '', c: '' };

  function buildMatchCharts() {
    createLinearChart('match-chart-a', [{
      data: pointsFrom(createRange(-6, 6, 0.1), (x) => Math.abs(x - 1) + 1),
      showLine: true,
      borderColor: '#b5242b',
      backgroundColor: '#b5242b'
    }], { xMin: -6, xMax: 6, yMin: -1, yMax: 8 }, false);

    createLinearChart('match-chart-b', [{
      data: pointsFrom(createRange(-3, 4, 0.05), (x) => Math.pow(2, x)),
      showLine: true,
      borderColor: '#0f766e',
      backgroundColor: '#0f766e'
    }], { xMin: -3, xMax: 4, yMin: -1, yMax: 17 }, false);

    createLinearChart('match-chart-c', [
      {
        data: pointsFrom(createRange(-7, -0.2, 0.08), (x) => 3 / x),
        showLine: true,
        borderColor: '#c05621',
        backgroundColor: '#c05621'
      },
      {
        data: pointsFrom(createRange(0.2, 7, 0.08), (x) => 3 / x),
        showLine: true,
        borderColor: '#c05621',
        backgroundColor: '#c05621'
      }
    ], { xMin: -7, xMax: 7, yMin: -8, yMax: 8 }, false);
  }

  function onDrop(zone, item) {
    const zoneId = zone.dataset.zone;
    if (!zoneId) return;

    if (assignments[zoneId]) {
      const previous = document.querySelector('.draggable[data-id="' + assignments[zoneId] + '"]');
      if (previous) bank.appendChild(previous);
    }

    assignments[zoneId] = item.dataset.id || '';
    zone.innerHTML = '';
    zone.appendChild(item);
    zone.classList.add('filled');
  }

  draggables.forEach((item) => {
    item.addEventListener('dragstart', () => {
      item.classList.add('dragging');
    });
    item.addEventListener('dragend', () => {
      item.classList.remove('dragging');
    });
  });

  zones.forEach((zone) => {
    zone.addEventListener('dragover', (event) => {
      event.preventDefault();
    });

    zone.addEventListener('drop', (event) => {
      event.preventDefault();
      const dragging = document.querySelector('.draggable.dragging');
      if (!dragging) return;
      onDrop(zone, dragging);
    });
  });

  bank.addEventListener('dragover', (event) => {
    event.preventDefault();
  });

  bank.addEventListener('drop', (event) => {
    event.preventDefault();
    const dragging = document.querySelector('.draggable.dragging');
    if (!dragging) return;

    const parentZone = dragging.closest('.dropzone');
    if (parentZone) {
      const parentId = parentZone.dataset.zone;
      if (parentId) assignments[parentId] = '';
      parentZone.textContent = 'Drop description here';
      parentZone.classList.remove('filled');
    }
    bank.appendChild(dragging);
  });

  function resetMatch() {
    Object.keys(assignments).forEach((key) => {
      assignments[key] = '';
    });

    draggables.forEach((item) => bank.appendChild(item));
    zones.forEach((zone) => {
      zone.textContent = 'Drop description here';
      zone.classList.remove('filled');
    });

    setFeedback(feedback, true, 'Board reset. Drag again.');
  }

  if (hintBtn) {
    hintBtn.addEventListener('click', () => {
      setFeedback(feedback, true, 'Hint: V-shape = absolute, very fast growth = exponential, two branches = inverse.');
    });
  }

  if (checkBtn) {
    checkBtn.addEventListener('click', () => {
      const ok = assignments.a === 'desc-abs' && assignments.b === 'desc-exp' && assignments.c === 'desc-inv';
      if (ok) {
        setFeedback(feedback, true, 'Perfect match. LOTS skill completed.');
      } else {
        setFeedback(feedback, false, 'Some matches are incorrect. Use hint and try again.');
      }
    });
  }

  if (resetBtn) resetBtn.addEventListener('click', resetMatch);
  if (tryBtn) {
    tryBtn.addEventListener('click', () => {
      setFeedback(feedback, true, 'Try again: first identify shape, then asymptotes/intercepts.');
    });
  }

  buildMatchCharts();
}

function initRealLife() {
  const realData = [
    {
      id: 'temp',
      title: 'Temperature over a day',
      text: 'It rises in the morning, peaks, then decreases at night.',
      answer: 'quadratic-like'
    },
    {
      id: 'call',
      title: 'Phone call cost',
      text: 'Fixed initial fee plus a cost per minute.',
      answer: 'linear'
    },
    {
      id: 'distance',
      title: 'Distance traveled',
      text: 'Distance grows with time at near constant speed.',
      answer: 'linear'
    },
    {
      id: 'water',
      title: 'Water bill',
      text: 'One rate up to a threshold, a higher rate after it.',
      answer: 'piecewise'
    },
    {
      id: 'population',
      title: 'Population growth',
      text: 'Rate depends on current population and grows faster over time.',
      answer: 'exponential'
    }
  ];

  const wrap = document.getElementById('real-grid');
  const checkBtn = document.getElementById('real-check');
  const resetBtn = document.getElementById('real-reset');
  const feedback = document.getElementById('real-feedback');
  if (!wrap) return;

  wrap.innerHTML = '';

  realData.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'real-card';
    card.innerHTML =
      '<h3>' + item.title + '</h3>' +
      '<p>' + item.text + '</p>' +
      '<label>Model<select data-real="' + item.id + '">' +
      '<option value="">Choose</option>' +
      '<option value="linear">Linear</option>' +
      '<option value="piecewise">Piecewise</option>' +
      '<option value="exponential">Exponential</option>' +
      '<option value="quadratic-like">Quadratic-like</option>' +
      '</select></label>';
    wrap.appendChild(card);
  });

  if (checkBtn) {
    checkBtn.addEventListener('click', () => {
      const selects = Array.from(wrap.querySelectorAll('select[data-real]'));
      let correct = 0;
      selects.forEach((select) => {
        const id = select.dataset.real;
        const expected = realData.find((row) => row.id === id);
        if (expected && select.value === expected.answer) {
          correct += 1;
        }
      });

      if (correct === realData.length) {
        setFeedback(feedback, true, 'Excellent. You connected all functions with real contexts.');
      } else {
        setFeedback(feedback, false, 'Score: ' + correct + '/' + realData.length + '. Recheck the context clues.');
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      const selects = Array.from(wrap.querySelectorAll('select[data-real]'));
      selects.forEach((select) => {
        select.value = '';
      });
      setFeedback(feedback, true, 'Selections cleared.');
    });
  }
}

function initHotsSection() {
  const q1 = document.getElementById('hots-q1');
  const q2 = document.getElementById('hots-q2');
  const text = document.getElementById('hots-text');
  const checkBtn = document.getElementById('hots-check');
  const resetBtn = document.getElementById('hots-reset');
  const hintBtn = document.getElementById('hots-hint');
  const tryBtn = document.getElementById('hots-try');
  const feedback = document.getElementById('hots-feedback');

  createLinearChart(
    'hots-chart',
    [
      {
        data: pointsFrom(createRange(-6, -0.2, 0.2), (x) => x + 1),
        showLine: true,
        borderColor: '#b5242b',
        backgroundColor: '#b5242b'
      },
      {
        data: pointsFrom(createRange(0, 6, 0.2), (x) => x * x),
        showLine: true,
        borderColor: '#b5242b',
        backgroundColor: '#b5242b'
      },
      {
        data: [{ x: 0, y: 1 }],
        showLine: false,
        pointRadius: 5,
        pointHoverRadius: 6,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#b5242b',
        pointBorderWidth: 2
      },
      {
        data: [{ x: 0, y: 0 }],
        showLine: false,
        pointRadius: 5,
        pointHoverRadius: 6,
        pointBackgroundColor: '#b5242b',
        pointBorderColor: '#b5242b',
        pointBorderWidth: 2
      }
    ],
    { xMin: -6, xMax: 6, yMin: -6, yMax: 16 },
    false
  );

  if (hintBtn) {
    hintBtn.addEventListener('click', () => {
      setFeedback(feedback, true, 'Hint: compare left and right values at x = 0, then think vertical translation.');
    });
  }

  if (checkBtn) {
    checkBtn.addEventListener('click', () => {
      const ok1 = q1 && q1.value === 'no';
      const ok2 = q2 && q2.value === 'up';
      const txt = normalizeText(text ? text.value : '');
      const ok3 = txt.length >= 45 && txt.includes('because');

      const total = Number(ok1) + Number(ok2) + Number(ok3);
      if (total === 3) {
        setFeedback(feedback, true, 'Strong HOTS response. Clear reasoning and language output.');
      } else {
        setFeedback(feedback, false, 'Current score: ' + total + '/3. Improve your justification with evidence.');
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (q1) q1.value = '';
      if (q2) q2.value = '';
      if (text) text.value = '';
      setFeedback(feedback, true, 'HOTS activity reset.');
    });
  }

  if (tryBtn) {
    tryBtn.addEventListener('click', () => {
      setFeedback(feedback, true, 'Try again: answer each part, then justify with because.');
    });
  }
}

function initFinalChallenge() {
  const domain = document.getElementById('final-domain');
  const increasing = document.getElementById('final-increasing');
  const intercept = document.getElementById('final-intercept');
  const continuity = document.getElementById('final-continuity');
  const text = document.getElementById('final-text');
  const checkBtn = document.getElementById('final-check');
  const resetBtn = document.getElementById('final-reset');
  const hintBtn = document.getElementById('final-hint');
  const tryBtn = document.getElementById('final-try');
  const feedback = document.getElementById('final-feedback');

  createLinearChart(
    'final-chart',
    [
      {
        label: 'Bike distance',
        data: [
          { x: 0, y: 0 },
          { x: 1, y: 2 },
          { x: 2, y: 4 },
          { x: 3, y: 6 },
          { x: 4, y: 9 },
          { x: 5, y: 13 }
        ],
        showLine: true,
        borderColor: '#0f766e',
        backgroundColor: '#0f766e',
        pointRadius: 3
      }
    ],
    { xMin: 0, xMax: 5.5, yMin: -1, yMax: 14 },
    false
  );

  if (hintBtn) {
    hintBtn.addEventListener('click', () => {
      setFeedback(feedback, true, 'Hint: starts at origin, always increasing, no jump in the shown interval.');
    });
  }

  if (checkBtn) {
    checkBtn.addEventListener('click', () => {
      const ansDomain = normalizeText(domain ? domain.value : '');
      const ansInc = normalizeText(increasing ? increasing.value : '');
      const ansInt = normalizeText(intercept ? intercept.value : '');
      const ansCont = continuity ? continuity.value : '';
      const ansText = normalizeText(text ? text.value : '');

      let score = 0;
      if (ansDomain.includes('x') && (ansDomain.includes('>= 0') || ansDomain.includes('0'))) score += 1;
      if (ansInc.includes('all') || ansInc.includes('0') || ansInc.includes('shown')) score += 1;
      if (ansInt.includes('0')) score += 1;
      if (ansCont === 'continuous') score += 1;
      if (ansText.length >= 60 && ansText.includes('because')) score += 1;

      if (score >= 4) {
        setFeedback(feedback, true, 'Final challenge passed: ' + score + '/5. Great integrated CLIL performance.');
      } else {
        setFeedback(feedback, false, 'Score: ' + score + '/5. Add clearer evidence from the graph in your explanation.');
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (domain) domain.value = '';
      if (increasing) increasing.value = '';
      if (intercept) intercept.value = '';
      if (continuity) continuity.value = '';
      if (text) text.value = '';
      setFeedback(feedback, true, 'Final challenge reset.');
    });
  }

  if (tryBtn) {
    tryBtn.addEventListener('click', () => {
      setFeedback(feedback, true, 'Try again: describe trend, intercept and continuity, then justify.');
    });
  }
}

function initSelfAssessment() {
  const questions = [
    {
      q: 'A graph with two separate branches and a vertical asymptote is usually...',
      options: ['quadratic', 'inverse proportional', 'absolute value'],
      answer: 1
    },
    {
      q: 'If a function is increasing, then when x increases...',
      options: ['y decreases', 'y stays constant', 'y tends to increase'],
      answer: 2
    },
    {
      q: 'A phone plan with fixed fee plus price per minute is often...',
      options: ['linear', 'logarithmic', 'radical'],
      answer: 0
    },
    {
      q: 'A jump at x = 0 means the function is...',
      options: ['continuous', 'discontinuous', 'periodic'],
      answer: 1
    },
    {
      q: 'The expression 2^x represents a...',
      options: ['piecewise function', 'exponential function', 'inverse function'],
      answer: 1
    },
    {
      q: 'In CLIL math class, a strong answer should include...',
      options: ['only the final number', 'a short guess', 'evidence and language justification'],
      answer: 2
    }
  ];

  const wrap = document.getElementById('quiz-wrap');
  const checkBtn = document.getElementById('quiz-check');
  const resetBtn = document.getElementById('quiz-reset');
  const feedback = document.getElementById('quiz-feedback');

  if (!wrap) return;

  function renderQuiz() {
    wrap.innerHTML = '';

    questions.forEach((item, index) => {
      const card = document.createElement('article');
      card.className = 'quiz-card';

      const title = document.createElement('p');
      title.innerHTML = '<strong>Q' + (index + 1) + '.</strong> ' + item.q;
      card.appendChild(title);

      const list = document.createElement('div');
      list.className = 'choice-list';

      item.options.forEach((opt, optIndex) => {
        const row = document.createElement('label');
        row.className = 'choice-item';

        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'quiz-' + index;
        input.value = String(optIndex);

        const text = document.createElement('span');
        text.textContent = opt;

        row.appendChild(input);
        row.appendChild(text);
        list.appendChild(row);
      });

      card.appendChild(list);
      wrap.appendChild(card);
    });
  }

  if (checkBtn) {
    checkBtn.addEventListener('click', () => {
      let correct = 0;
      questions.forEach((question, index) => {
        const checked = wrap.querySelector('input[name="quiz-' + index + '"]:checked');
        if (checked && Number(checked.value) === question.answer) {
          correct += 1;
        }
      });

      if (correct >= 5) {
        setFeedback(feedback, true, 'Excellent exit ticket: ' + correct + '/6.');
      } else {
        setFeedback(feedback, false, 'Current result: ' + correct + '/6. Review and retry.');
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      renderQuiz();
      setFeedback(feedback, true, 'Quiz reset.');
    });
  }

  renderQuiz();
}

function boot() {
  if (typeof Chart === 'undefined') return false;

  Chart.register(emphasizedAxesPlugin);
  initVocabulary();
  initObserveAndDescribe();
  initSliderChart();
  initMatchActivity();
  initRealLife();
  initHotsSection();
  initFinalChallenge();
  initSelfAssessment();
  return true;
}

function initWithRetry(maxAttempts) {
  let attempts = 0;

  function tryStart() {
    attempts += 1;
    if (boot()) return;
    if (attempts < maxAttempts) {
      window.setTimeout(tryStart, 120);
    }
  }

  tryStart();
}

initWithRetry(30);
