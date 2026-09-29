const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(open));
  navLinks.classList.toggle('open', open);
});
navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  menuToggle.setAttribute('aria-expanded', 'false');
  navLinks.classList.remove('open');
}));

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navLinks.classList.contains('open')) {
    menuToggle.setAttribute('aria-expanded', 'false');
    navLinks.classList.remove('open');
    menuToggle.focus();
  }
});

const signed = (value, digits = 2) => {
  const factor = 10 ** digits;
  const rounded = Math.round((Math.abs(value) + Number.EPSILON) * factor) / factor;
  return `${value < 0 ? '−' : '+'}${rounded.toFixed(digits)}`;
};
let researchData;
let currentModel;
const slider = document.getElementById('loss-step');

function renderResults(modelId) {
  currentModel = researchData.models.find(model => model.id === modelId);
  document.querySelectorAll('[data-model]').forEach(button => {
    const selected = button.dataset.model === modelId;
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  document.getElementById('benchmark-charts').innerHTML = currentModel.qa.map(benchmark => `
    <div class="benchmark-card">
      <div class="benchmark-header"><h4>${benchmark.label}</h4><span class="gain-badge ${benchmark.deltaF1Points < 0 ? 'neutral' : ''}" aria-label="${signed(benchmark.deltaF1Points)} F1 points">${signed(benchmark.deltaF1Points)}</span></div>
      <div class="bar-pair" role="img" aria-label="${benchmark.label}: random initialization ${benchmark.random.meanF1.toFixed(2)}, STACK ${benchmark.stack.meanF1.toFixed(2)} F1">
        <div class="bar-track"><div class="bar" style="width:${benchmark.random.meanF1 / 60 * 100}%">${benchmark.random.meanF1.toFixed(2)}</div></div>
        <div class="bar-track"><div class="bar stack-bar" style="width:${benchmark.stack.meanF1 / 60 * 100}%">${benchmark.stack.meanF1.toFixed(2)}</div></div>
      </div><div class="bar-axis" aria-hidden="true"><span>0</span><span>20</span><span>40</span><span>60 F1</span></div>
    </div>`).join('');
  document.getElementById('result-note').textContent = modelId === '135M'
    ? 'At 135M, STACK improves all three benchmarks, with a +3.89 F1-point gain on MuSiQue.'
    : 'At 360M, MuSiQue improves by +2.05 F1 points. The 2WikiMultiHopQA result is essentially unchanged (−0.10).';
  document.getElementById('loss-description').textContent = modelId === '135M'
    ? 'At 135M, the validation-loss curves converge to essentially the same value, despite the downstream QA gains.'
    : 'At 360M, STACK finishes with slightly worse validation loss, while MuSiQue and HotpotQA F1 still improve.';
  const loss = currentModel.languageModeling;
  document.getElementById('loss-endpoints').innerHTML = `<div><span>Random init. · final logged loss</span><strong>${loss.random.meanLoss.toFixed(4)}</strong></div><div><span>STACK · final logged loss</span><strong>${loss.stack.meanLoss.toFixed(4)}</strong></div>`;
  document.getElementById('table-caption').textContent = `${currentModel.label} · mean F1 ± population standard deviation`;
  document.getElementById('results-table').innerHTML = currentModel.qa.map(b => `<tr><th scope="row">${b.label}</th><td>${b.random.meanF1.toFixed(2)} ± ${b.random.stdF1.toFixed(2)}</td><td>${b.stack.meanF1.toFixed(2)} ± ${b.stack.stdF1.toFixed(2)}</td><td>${signed(b.deltaF1Points)}</td></tr>`).join('');
  document.getElementById('seed-note').textContent = modelId === '135M'
    ? '135M: 3 pretraining seeds × 3 fine-tuning seeds, for 9 runs per condition and benchmark. Standard deviations describe run variability, not confidence intervals.'
    : '360M: 1 pretraining seed × 3 fine-tuning seeds, for 3 runs per condition and benchmark. Variability therefore covers fine-tuning seeds only, not independent pretraining runs.';
  slider.max = String(loss.curve.length - 1);
  slider.value = slider.max;
  renderLossChart();
}

function renderLossChart() {
  if (!currentModel) return;
  const curve = currentModel.languageModeling.curve;
  const last = curve.at(-1);
  const selected = curve[Number(slider.value)];
  const xMax = currentModel.id === '135M' ? 2.7 : 7.2;
  const x = value => 38 + value / xMax * 452;
  const y = value => 177 - (value - 2.5) / 3.5 * 159;
  const line = col => curve.map((point, index) => `${index ? 'L' : 'M'}${x(point[0]).toFixed(2)},${y(point[col]).toFixed(2)}`).join(' ');
  const yTicks = [3, 4, 5, 6];
  const xTicks = currentModel.id === '135M' ? [0, 1, 2, 2.7] : [0, 2, 4, 6, 7.2];
  document.getElementById('loss-chart').innerHTML = `<svg viewBox="0 0 510 221" role="img" aria-label="${currentModel.label} validation loss over FineWeb-Edu tokens. Final logged random initialization ${last[1].toFixed(4)}, STACK ${last[2].toFixed(4)}.">
    ${yTicks.map(tick => `<line class="chart-grid" x1="38" y1="${y(tick)}" x2="490" y2="${y(tick)}"/><text class="chart-label" x="23" y="${y(tick) + 4}" text-anchor="end">${tick}</text>`).join('')}
    ${xTicks.map(tick => `<text class="chart-label" x="${x(tick)}" y="197" text-anchor="middle">${tick}</text>`).join('')}
    <path class="curve-random" d="${line(1)}"/><path class="curve-stack" d="${line(2)}"/>
    <line class="checkpoint-line" x1="${x(selected[0])}" y1="14" x2="${x(selected[0])}" y2="179"/>
    <circle cx="${x(selected[0])}" cy="${y(selected[1])}" r="4" fill="#adc0b9" stroke="white" stroke-width="1.5"/>
    <circle cx="${x(selected[0])}" cy="${y(selected[2])}" r="3.5" fill="#116b65" stroke="white" stroke-width="1"/>
    <text class="chart-label" x="264" y="218" text-anchor="middle">FineWeb-Edu tokens (billions)</text>
  </svg>`;
  document.getElementById('loss-step-label').textContent = `${selected[0].toFixed(2)}B language tokens`;
  slider.setAttribute('aria-valuetext', `${selected[0].toFixed(2)} billion language tokens; random loss ${selected[1].toFixed(4)}; STACK loss ${selected[2].toFixed(4)}`);
  document.getElementById('checkpoint-values').innerHTML = `<span>Random init. <strong>${selected[1].toFixed(4)}</strong></span><span>STACK <strong>${selected[2].toFixed(4)}</strong></span>`;
}

document.querySelectorAll('[data-model]').forEach(button => button.addEventListener('click', () => {
  if (researchData) renderResults(button.dataset.model);
}));
slider.addEventListener('input', renderLossChart);

const timingCopy = {
  0: ['Before language', 'A dedicated STACK phase before any language tokens gives the strongest average improvement.'],
  25: ['After 25% of language', 'An early insertion still improves mean QA F1, but does not reproduce the benefit of starting with STACK.'],
  50: ['Halfway through language', 'A midpoint insertion produces a smaller gain than the dedicated initial phase.'],
  75: ['After 75% of language', 'Late exposure retains a modest average benefit in this tested schedule.'],
  100: ['After all language', 'The mean QA benefit disappears when STACK is introduced only after language pretraining.']
};

function renderTiming(selectedPercent = 0) {
  document.getElementById('timing-chart').innerHTML = researchData.timing.points.map(point => {
    const height = Math.abs(point.meanDeltaF1Points) * 53;
    const negative = point.meanDeltaF1Points < 0;
    return `<button class="timing-column ${negative ? 'negative' : ''} ${selectedPercent === point.insertionPercent ? 'selected' : ''}" data-timing="${point.insertionPercent}" aria-pressed="${selectedPercent === point.insertionPercent}" aria-label="STACK inserted at ${point.insertionPercent} percent, ${signed(point.meanDeltaF1Points)} mean F1 points"><span class="timing-value" style="top:${negative ? 147 : 148 - height}px">${signed(point.meanDeltaF1Points, 1)}</span><span class="timing-bar" style="height:${height}px;top:${negative ? 174 : 174 - height}px"></span><span class="timing-percent">${point.insertionPercent}%</span></button>`;
  }).join('');
  document.querySelectorAll('[data-timing]').forEach(button => button.addEventListener('click', () => {
    const position = Number(button.dataset.timing);
    updateTiming(position);
  }));
  updateTiming(selectedPercent);
}

function updateTiming(percent) {
  const point = researchData.timing.points.find(item => item.insertionPercent === percent);
  document.querySelectorAll('[data-timing]').forEach(button => {
    const selected = Number(button.dataset.timing) === percent;
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  document.getElementById('timing-label').textContent = timingCopy[percent][0];
  document.getElementById('timing-value').innerHTML = `${signed(point.meanDeltaF1Points)}<span> F1 points</span>`;
  document.getElementById('timing-description').textContent = timingCopy[percent][1];
  const schedule = document.getElementById('training-schedule');
  schedule.innerHTML = `${percent ? `<span class="schedule-language" style="flex:${percent}" aria-hidden="true"></span>` : ''}<span class="schedule-stack" aria-hidden="true"></span>${percent < 100 ? `<span class="schedule-language" style="flex:${100 - percent}" aria-hidden="true"></span>` : ''}`;
  schedule.setAttribute('aria-label', `STACK inserted at ${percent}% through language pretraining. Diagram not to token scale.`);
}

fetch('assets/results.json').then(response => {
  if (!response.ok) throw new Error('Unable to load chart data');
  return response.json();
}).then(data => {
  researchData = data;
  renderResults('135M');
  renderTiming();
}).catch(() => {
  document.getElementById('benchmark-charts').innerHTML = '<p class="small-label">Interactive data could not be loaded. Read Figure 2 in the paper, or download the chart data below.</p>';
  document.getElementById('result-note').textContent = 'At 135M, MuSiQue F1 increases from 38.10 to 41.99 with STACK warm-up.';
  document.getElementById('timing-chart').innerHTML = '<p class="small-label">Mean F1 gains by insertion point: 0% +2.42; 25% +0.74; 50% +1.23; 75% +1.02; 100% −0.47.</p>';
  slider.disabled = true;
});

let memoryMode = 'stack';
let memoryStep = 0;
function renderMemory() {
  const state = [];
  let removed;
  for (let step = 1; step <= memoryStep; step++) {
    if (step === 1) state.push('A');
    if (step === 2) state.push('B');
    if (step === 3) removed = memoryMode === 'stack' ? state.pop() : state.shift();
    if (step === 4) state.push('C');
  }
  document.querySelectorAll('[data-memory]').forEach(button => {
    const selected = button.dataset.memory === memoryMode;
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  document.querySelectorAll('[data-step]').forEach(button => {
    button.classList.toggle('done', Number(button.dataset.step) <= memoryStep);
    button.classList.toggle('current', Number(button.dataset.step) === memoryStep);
    button.setAttribute('aria-pressed', String(Number(button.dataset.step) === memoryStep));
  });
  document.getElementById('memory-title').textContent = memoryMode === 'stack' ? 'Last in, first out.' : 'First in, first out.';
  document.getElementById('memory-description').textContent = memoryMode === 'stack'
    ? 'A pop removes the most recently added token. The remaining contents depend on the whole sequence.'
    : 'A pop removes the earliest added token. The operations look similar, but the underlying computation changes.';
  const visual = document.getElementById('memory-visual');
  visual.className = `memory-visual ${memoryMode}`;
  const displayed = memoryMode === 'stack' ? [...state].reverse() : state;
  visual.innerHTML = displayed.length ? displayed.map((token, index) => `<div class="memory-token">${token}${index === 0 ? `<small>${memoryMode === 'stack' ? 'TOP' : 'FRONT'}</small>` : ''}</div>`).join('') : '<span class="empty-memory">Empty memory</span>';
  const messages = ['Start with an empty memory.', 'Push A into memory.', 'Push B into memory.', `Pop removes ${removed || (memoryMode === 'stack' ? 'B' : 'A')}. ${memoryMode === 'stack' ? 'A' : 'B'} remains.`, `Push C. Memory now contains ${memoryMode === 'stack' ? 'A at the bottom and C at the top.' : 'B at the front, followed by C.'}`];
  document.getElementById('memory-status').textContent = messages[memoryStep];
  document.getElementById('step-counter').textContent = `${memoryStep} / 4 operations`;
  document.getElementById('next-operation').disabled = memoryStep === 4;
  document.getElementById('next-operation').textContent = memoryStep === 4 ? 'Sequence complete' : 'Next operation';
  document.getElementById('reset-demo').disabled = memoryStep === 0;
}
document.querySelectorAll('[data-memory]').forEach(button => button.addEventListener('click', () => { memoryMode = button.dataset.memory; renderMemory(); }));
document.querySelectorAll('[data-step]').forEach(button => button.addEventListener('click', () => { memoryStep = Number(button.dataset.step); renderMemory(); }));
document.getElementById('next-operation').addEventListener('click', () => { memoryStep = Math.min(memoryStep + 1, 4); renderMemory(); });
document.getElementById('reset-demo').addEventListener('click', () => { memoryStep = 0; renderMemory(); });
renderMemory();

document.getElementById('copy-citation').addEventListener('click', async () => {
  const text = document.getElementById('bibtex').textContent;
  const status = document.getElementById('copy-status');
  try {
    await navigator.clipboard.writeText(text);
    status.textContent = 'BibTeX copied to clipboard.';
    document.getElementById('copy-citation').textContent = 'Copied';
  } catch {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(document.getElementById('bibtex'));
    selection.removeAllRanges();
    selection.addRange(range);
    status.textContent = 'Citation selected. Press Ctrl+C or ⌘C to copy.';
  }
});

const figureDialog = document.getElementById('figure-dialog');
let figureTrigger;
document.querySelectorAll('[data-figure]').forEach(button => button.addEventListener('click', () => {
  figureTrigger = button;
  document.getElementById('figure-dialog-title').textContent = button.dataset.title;
  const image = document.getElementById('expanded-figure');
  image.src = button.dataset.figure;
  image.alt = button.closest('figure').querySelector('img').alt;
  document.getElementById('original-figure').href = button.dataset.figure;
  figureDialog.showModal();
}));
document.getElementById('close-figure').addEventListener('click', () => figureDialog.close());
figureDialog.addEventListener('click', event => {
  if (event.target === figureDialog) {
    const box = figureDialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) figureDialog.close();
  }
});
figureDialog.addEventListener('close', () => figureTrigger?.focus());

const observer = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      navLinks.querySelectorAll('a[href^="#"]').forEach(link => {
        const active = link.getAttribute('href') === `#${entry.target.id}`;
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }
  }
}, {rootMargin: '-15% 0px -65% 0px', threshold: 0});
document.querySelectorAll('section[id]').forEach(section => observer.observe(section));
