const STORAGE_KEY = 'fast-bowling-acwr-tracker-v1';
const form = document.querySelector('#tracker-form');
const monthInput = document.querySelector('#month');
const weeksContainer = document.querySelector('#weeks');
const template = document.querySelector('#week-template');
const summaryBody = document.querySelector('#summary-body');
const saveStatus = document.querySelector('#save-status');
const today = new Date();
let saveTimer;

document.querySelector('#year').textContent = today.getFullYear();
const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
monthInput.value = saved.month || `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

function safeNumber(value) { const n = Number.parseFloat(String(value).trim()); return Number.isFinite(n) ? n : 0; }
function ballsFor(row) { return Math.max(0, safeNumber(row.querySelector('[data-field="netOvers"]').value) * 6 + safeNumber(row.querySelector('[data-field="netBalls"]').value) + safeNumber(row.querySelector('[data-field="matchOvers"]').value) * 6 + safeNumber(row.querySelector('[data-field="matchBalls"]').value)); }
function getMonthStart() { const [year, month] = monthInput.value.split('-').map(Number); return new Date(year || today.getFullYear(), (month || today.getMonth() + 1) - 1, 1); }
function dateValue(date) { return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`; }
function displayDate(value, fallback) { const isoDate = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || ''); return isoDate ? `${isoDate[3]}/${isoDate[2]}/${isoDate[1]}` : value || dateValue(fallback); }
function readableDate(date) { return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }); }

function buildWeeks(refreshDates = false) {
  const existing = [...document.querySelectorAll('.workload-table tbody')].flatMap(body => [...body.rows].map(row => Object.fromEntries([...row.querySelectorAll('[data-field]')].map(input => [input.dataset.field, input.value]))));
  weeksContainer.innerHTML = '';
  const start = getMonthStart();
  const daysInMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();

  for (let week = 0; week < 4; week++) {
    const node = template.content.cloneNode(true);
    const card = node.querySelector('.week-card');
    const firstDayIndex = week * 7;
    const daysThisWeek = week === 3 ? daysInMonth - firstDayIndex : 7;
    const rangeStart = new Date(start); rangeStart.setDate(start.getDate() + firstDayIndex);
    const rangeEnd = new Date(rangeStart); rangeEnd.setDate(rangeStart.getDate() + daysThisWeek - 1);
    card.querySelector('.week-number').textContent = `W${week + 1}`;
    card.querySelector('h3').textContent = `Week ${week + 1}`;
    card.querySelector('.week-range').textContent = `${readableDate(rangeStart)} – ${readableDate(rangeEnd)}`;
    const body = card.querySelector('tbody');

    for (let day = 0; day < daysThisWeek; day++) {
      const idx = firstDayIndex + day;
      const date = new Date(start); date.setDate(start.getDate() + idx);
      const data = existing[idx] || saved.days?.[idx] || {};
      const row = document.createElement('tr');
      row.innerHTML = `<td>Day ${idx + 1}</td><td><input class="date-input" data-field="date" type="text" inputmode="numeric" pattern="\\d{2}/\\d{2}/\\d{4}" placeholder="DD/MM/YYYY" value="${refreshDates ? dateValue(date) : displayDate(data.date, date)}" aria-label="Day ${idx + 1} date" /></td><td><input class="load-input" data-field="netOvers" value="${data.netOvers || ''}" inputmode="decimal" aria-label="Day ${idx + 1} nets overs" /></td><td><input class="load-input" data-field="netBalls" value="${data.netBalls || ''}" inputmode="decimal" aria-label="Day ${idx + 1} nets balls" /></td><td><input class="load-input" data-field="matchOvers" value="${data.matchOvers || ''}" inputmode="decimal" aria-label="Day ${idx + 1} match overs" /></td><td><input class="load-input" data-field="matchBalls" value="${data.matchBalls || ''}" inputmode="decimal" aria-label="Day ${idx + 1} match balls" /></td><td class="total-day">0</td><td><select class="feel-select" data-field="feel" aria-label="Day ${idx + 1} feeling"><option value="">—</option>${['Normal', 'Moderate', 'Mod+', 'Sore', 'Rest/Gym'].map(option => `<option ${data.feel === option ? 'selected' : ''}>${option}</option>`).join('')}</select></td>`;
      body.append(row);
    }
    weeksContainer.append(node);
  }
  update();
}

function weeklyTotals() { return [...document.querySelectorAll('.week-card')].map(card => [...card.querySelectorAll('tbody tr')].reduce((sum, row) => sum + ballsFor(row), 0)); }
function updateSummary(totals) { summaryBody.innerHTML = totals.map((total, index) => `<tr><td>Week ${index + 1}</td><td>${total}</td><td>—</td><td>—</td><td><span class="risk-pill pending">Needs history</span></td></tr>`).join(''); }
function updateChart(totals) { const max = Math.max(...totals, 1); document.querySelector('#chart-total').textContent = `${totals.reduce((a, b) => a + b, 0)} balls logged`; document.querySelector('#trend-chart').innerHTML = totals.map((total, index) => `<div class="bar-group"><div class="bar-track"><div class="bar" style="height:${Math.max(total ? 6 : 0, total / max * 100)}%"></div></div><b>${total}</b><span>Week ${index + 1}</span></div>`).join(''); }
function save() { const days = [...document.querySelectorAll('.workload-table tbody tr')].map(row => Object.fromEntries([...row.querySelectorAll('[data-field]')].map(input => [input.dataset.field, input.value]))); const fields = Object.fromEntries([...new FormData(form).entries()].filter(([key]) => !['netOvers', 'netBalls', 'matchOvers', 'matchBalls', 'date', 'feel'].includes(key))); fields.honest = form.elements.honest.checked; localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...fields, month: monthInput.value, days })); saveStatus.textContent = 'Saved locally'; }
function scheduleSave() { saveStatus.textContent = 'Saving…'; clearTimeout(saveTimer); saveTimer = setTimeout(save, 250); }
function update() { document.querySelectorAll('.workload-table tbody tr').forEach(row => row.querySelector('.total-day').textContent = ballsFor(row) || '—'); const totals = weeklyTotals(); document.querySelectorAll('.week-total').forEach((cell, index) => cell.textContent = totals[index]); updateSummary(totals); updateChart(totals); scheduleSave(); }
function populateStaticFields() { Object.entries(saved).forEach(([key, value]) => { const field = form.elements[key]; if (!field || key === 'month') return; if (field.type === 'checkbox') field.checked = Boolean(value); else field.value = value; }); }

form.addEventListener('input', update);
form.addEventListener('change', event => { if (event.target === monthInput) buildWeeks(true); else update(); });
document.querySelector('#print-sheet').addEventListener('click', () => window.print());
populateStaticFields();
buildWeeks();
