// Quiz interactivo: respuesta inmediata y resumen final.
const quizCards = Array.from(document.querySelectorAll('.quiz-card'));
const resultBox = document.getElementById('quiz-result');
const reviewBox = document.getElementById('review-box');

let answeredCount = 0;
let score = 0;

function updateGlobalResult() {
  if (!resultBox) return;

  if (answeredCount < quizCards.length) {
    resultBox.textContent = 'Progreso: ' + answeredCount + '/' + quizCards.length + ' preguntas respondidas.';
    return;
  }

  resultBox.textContent = 'Resultado final: ' + score + '/' + quizCards.length + ' aciertos.';

  if (!reviewBox) return;

  let recommendation = 'Muy buen trabajo. Keep practicing with mixed examples.';

  if (score <= 2) {
    recommendation = 'Repasa las formas de las graficas y el dominio de cada funcion. Step by step.';
  } else if (score <= 4) {
    recommendation = 'Buen avance. Revisa asintotas y diferencias entre exponencial y logaritmica.';
  }

  const extra = document.createElement('p');
  extra.textContent = 'Feedback: ' + recommendation;
  reviewBox.appendChild(extra);
}

quizCards.forEach((card) => {
  const correctAnswer = card.dataset.correct;
  const feedback = card.querySelector('.feedback');
  const buttons = Array.from(card.querySelectorAll('button[data-answer]'));

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      // Evita respuestas duplicadas en la misma pregunta.
      if (card.dataset.answered === 'true') return;

      card.dataset.answered = 'true';
      answeredCount += 1;

      const selected = button.dataset.answer;
      const isCorrect = selected === correctAnswer;

      buttons.forEach((btn) => {
        const answer = btn.dataset.answer;
        btn.disabled = true;

        if (answer === correctAnswer) {
          btn.classList.add('correct');
        }
      });

      if (feedback) {
        if (isCorrect) {
          score += 1;
          button.classList.add('correct');
          feedback.textContent = 'Correcto. Nice job!';
          feedback.classList.add('ok');
        } else {
          button.classList.add('wrong');
          feedback.textContent = 'No es correcto. Revisa la pista y la expresion.';
          feedback.classList.add('bad');
        }
      }

      updateGlobalResult();
    });
  });
});

updateGlobalResult();

// Rubrica AICLE interactiva: calcula media y perfil final.
const rubricSelects = Array.from(document.querySelectorAll('select[data-rubric]'));
const rubricOutput = document.getElementById('rubric-output');

function getAicleProfile(avg) {
  if (avg < 1.75) return 'Inicial';
  if (avg < 2.5) return 'En progreso';
  if (avg < 3.5) return 'Adecuado';
  return 'Avanzado';
}

function getAicleAdvice(profile) {
  if (profile === 'Inicial') {
    return 'Prioriza andamiaje de entrada: glosario visual, ejemplos guiados y sentence starters simples.';
  }

  if (profile === 'En progreso') {
    return 'Mantiene apoyo guiado y aumenta tareas de comparacion y justificacion corta en L2.';
  }

  if (profile === 'Adecuado') {
    return 'Introduce tareas HOTS: analizar, argumentar y conectar funciones con situaciones reales.';
  }

  return 'Potencia retos de transferencia: crear explicaciones propias y comparar contextos locales/globales.';
}

function updateRubricResult() {
  if (!rubricOutput) return;

  const values = rubricSelects
    .map((sel) => Number(sel.value))
    .filter((value) => Number.isFinite(value) && value >= 1 && value <= 4);

  if (values.length < 4) {
    rubricOutput.classList.remove('done');
    rubricOutput.textContent = 'Completa las cuatro dimensiones para calcular el perfil AICLE.';
    return;
  }

  const total = values.reduce((acc, current) => acc + current, 0);
  const average = total / values.length;
  const profile = getAicleProfile(average);
  const advice = getAicleAdvice(profile);

  rubricOutput.classList.add('done');
  rubricOutput.textContent =
    'Puntuacion media: ' + average.toFixed(2) + '/4. Perfil AICLE: ' + profile + '. Recomendacion: ' + advice;
}

rubricSelects.forEach((select) => {
  select.addEventListener('change', updateRubricResult);
});

updateRubricResult();

// Graficas reales de funciones con Chart.js.
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

function point(x, y) {
  return { x: x, y: y };
}

const emphasizedAxesPlugin = {
  id: 'emphasizedAxesPlugin',
  afterDraw(chart) {
    const xScale = chart.scales.x;
    const yScale = chart.scales.y;

    if (!xScale || !yScale) return;

    const hasZeroX = yScale.min <= 0 && yScale.max >= 0;
    const hasZeroY = xScale.min <= 0 && xScale.max >= 0;
    const axisColor = '#111827';
    const ctx = chart.ctx;

    ctx.save();

    if (hasZeroX) {
      const yZero = yScale.getPixelForValue(0);
      ctx.beginPath();
      ctx.moveTo(xScale.left, yZero);
      ctx.lineTo(xScale.right, yZero);
      ctx.lineWidth = 2.8;
      ctx.strokeStyle = axisColor;
      ctx.stroke();
    }

    if (hasZeroY) {
      const xZero = xScale.getPixelForValue(0);
      ctx.beginPath();
      ctx.moveTo(xZero, yScale.top);
      ctx.lineTo(xZero, yScale.bottom);
      ctx.lineWidth = 2.8;
      ctx.strokeStyle = axisColor;
      ctx.stroke();
    }

    ctx.restore();
  }
};

function createLinearChart(canvasId, datasets, xMin, xMax, yMin, yMax) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || typeof Chart === 'undefined') return;

  new Chart(canvas, {
    type: 'scatter',
    data: { datasets: datasets },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 2.4,
      animation: false,
      plugins: {
        emphasizedAxesPlugin: true,
        legend: { display: false },
        tooltip: { enabled: true }
      },
      scales: {
        x: {
          type: 'linear',
          min: xMin,
          max: xMax,
          ticks: { color: '#30343a' },
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
          min: yMin,
          max: yMax,
          ticks: { color: '#30343a' },
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

function renderFunctionCharts() {
  if (typeof Chart === 'undefined') return;

  Chart.register(emphasizedAxesPlugin);

  const piecewiseLeftX = createRange(-6, -0.2, 0.2);
  const piecewiseRightX = createRange(0, 6, 0.2);
  const piecewiseLeft = pointsFrom(piecewiseLeftX, (x) => x + 1);
  const piecewiseRight = pointsFrom(piecewiseRightX, (x) => x * x);

  createLinearChart(
    'chart-piecewise',
    [
      {
        data: piecewiseLeft,
        showLine: true,
        borderColor: '#b6242c',
        backgroundColor: '#b6242c'
      },
      {
        data: piecewiseRight,
        showLine: true,
        borderColor: '#b6242c',
        backgroundColor: '#b6242c'
      },
      {
        data: [point(0, 1)],
        showLine: false,
        pointRadius: 5,
        pointHoverRadius: 6,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#b6242c',
        pointBorderWidth: 2
      },
      {
        data: [point(0, 0)],
        showLine: false,
        pointRadius: 5,
        pointHoverRadius: 6,
        pointBackgroundColor: '#b6242c',
        pointBorderColor: '#b6242c',
        pointBorderWidth: 2
      }
    ],
    -6,
    6,
    -6,
    16
  );

  const absoluteX = createRange(-8, 8, 0.2);
  const absolutePoints = pointsFrom(absoluteX, (x) => Math.abs(x - 2) + 1);
  createLinearChart(
    'chart-absolute',
    [{
      data: absolutePoints,
      showLine: true,
      borderColor: '#b45309',
      backgroundColor: '#b45309'
    }],
    -8,
    8,
    -1,
    11
  );

  const radicalX = createRange(3, 14, 0.2);
  const radicalPoints = pointsFrom(radicalX, (x) => Math.sqrt(x - 3));
  createLinearChart(
    'chart-radical',
    [{
      data: radicalPoints,
      showLine: true,
      borderColor: '#0f766e',
      backgroundColor: '#0f766e'
    }],
    0,
    14,
    -1,
    4
  );

  const inverseLeftX = createRange(-8, 0.8, 0.12);
  const inverseRightX = createRange(1.2, 10, 0.12);
  const inverseLeft = pointsFrom(inverseLeftX, (x) => 2 / (x - 1));
  const inverseRight = pointsFrom(inverseRightX, (x) => 2 / (x - 1));
  createLinearChart(
    'chart-inverse',
    [
      {
        data: inverseLeft,
        showLine: true,
        borderColor: '#7c2d12',
        backgroundColor: '#7c2d12'
      },
      {
        data: inverseRight,
        showLine: true,
        borderColor: '#7c2d12',
        backgroundColor: '#7c2d12'
      }
    ],
    -8,
    10,
    -8,
    8
  );

  const exponentialX = createRange(-4, 4, 0.1);
  const exponentialPoints = pointsFrom(exponentialX, (x) => Math.pow(2, x));
  createLinearChart(
    'chart-exponential',
    [{
      data: exponentialPoints,
      showLine: true,
      borderColor: '#2563eb',
      backgroundColor: '#2563eb'
    }],
    -4,
    4,
    -1,
    18
  );

  const logarithmicX = createRange(0.1, 8, 0.05);
  const logarithmicPoints = pointsFrom(logarithmicX, (x) => Math.log2(x));
  createLinearChart(
    'chart-logarithmic',
    [{
      data: logarithmicPoints,
      showLine: true,
      borderColor: '#6d28d9',
      backgroundColor: '#6d28d9'
    }],
    0,
    8,
    -4,
    4
  );
}

function initChartsWithRetry(maxAttempts) {
  let attempts = 0;

  function tryInit() {
    attempts += 1;

    if (typeof Chart !== 'undefined') {
      renderFunctionCharts();
      return;
    }

    if (attempts < maxAttempts) {
      window.setTimeout(tryInit, 120);
    }
  }

  tryInit();
}

initChartsWithRetry(30);
