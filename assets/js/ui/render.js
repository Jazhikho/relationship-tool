import { STATE, AXES, getCharName, getFlags, getRel } from "../core/state.js";
import { computeStableStateId, EVENT_TEMPLATES, getPatternStatus, getStableStates } from "../core/engine.js";

/**
 * Computes average numeric value for dashboard summaries.
 */
function avg(values) {
  if (values.length === 0) {
    return 0;
  }
  let total = 0;
  for (const value of values) {
    total += value;
  }
  return total / values.length;
}

/**
 * Converts byte count to human-readable size label.
 */
function formatBytes(rawBytes) {
  if (rawBytes < 1024) return `${rawBytes} B`;
  if (rawBytes < 1024 * 1024) return `${(rawBytes / 1024).toFixed(1)} KB`;
  return `${(rawBytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Re-renders all UI panels from current state.
 */
export function renderAll() {
  renderCharList();
  renderSelects();
  renderPerfCards();
  renderEventLog();
  renderDetailLog();
  renderEventTemplates();
  renderStableStates();
  renderBenchmarkResults();
  renderMatrix();
  renderInspector();
  renderStatus();
}

/**
 * Renders character list panel and count.
 */
export function renderCharList() {
  const el = document.getElementById("charList");
  document.getElementById("charCount").textContent = String(STATE.chars.length);
  if (STATE.chars.length > 50) {
    el.innerHTML = `<div style="padding:6px;font-size:10px;color:var(--dim)">${STATE.chars.length} chars loaded.</div>`;
    return;
  }
  el.innerHTML = STATE.chars.map((char) => `<div class="char-item"><span>${char.name}</span><span class="rm" data-remove-char="${char.id}">✕</span></div>`).join("");
}

/**
 * Renders and preserves relationship/inspector select values.
 */
export function renderSelects() {
  const options = STATE.chars.map((char) => `<option value="${char.id}">${char.name}</option>`).join("");
  const selectIds = ["relFrom", "relTo", "inspChar", "inspTarget"];

  for (const id of selectIds) {
    const select = document.getElementById(id);
    const previous = select.value;
    select.innerHTML = options;
    if (STATE.chars.some((char) => char.id === previous)) {
      select.value = previous;
    }
  }

  const inspChar = document.getElementById("inspChar");
  const inspTarget = document.getElementById("inspTarget");
  if (inspChar.value === inspTarget.value && STATE.chars.length > 1) {
    inspTarget.selectedIndex = 1;
  }
}

/**
 * Renders dashboard metric cards and benchmark summaries.
 */
export function renderPerfCards() {
  const cardEl = document.getElementById("perfCards");
  const relValues = Object.values(STATE.rels);
  const trustVals = relValues.map((rel) => rel.trust);
  const affectionVals = relValues.map((rel) => rel.affection);
  const respectVals = relValues.map((rel) => rel.respect);
  const familiarityVals = relValues.map((rel) => rel.familiarity);
  const events = STATE.perfLog.filter((entry) => entry.op === "event").map((entry) => entry.dt);
  const ticks = STATE.perfLog.filter((entry) => entry.op === "tick").map((entry) => entry.dt);
  const rawDbBytes = new TextEncoder().encode(JSON.stringify(STATE)).length;

  const lastBench = STATE.lastBenchmark;
  let benchmarkTick = "—";
  let benchmarkEvent = "—";
  if (lastBench && lastBench.length > 0) {
    benchmarkTick = `${avg(lastBench.map((row) => row.tickMs)).toFixed(2)}ms`;
    benchmarkEvent = `${avg(lastBench.map((row) => row.evtMs)).toFixed(3)}ms`;
  }

  const cards = [
    { value: STATE.chars.length, label: "Chars" },
    { value: relValues.length, label: "Pairs" },
    { value: Object.values(STATE.flags).reduce((sum, list) => sum + list.length, 0), label: "Flags" },
    { value: avg(events).toFixed(3), label: "Avg Event ms" },
    { value: avg(ticks).toFixed(2), label: "Avg Tick ms" },
    { value: avg(trustVals).toFixed(1), label: "Avg Trust" },
    { value: avg(affectionVals).toFixed(1), label: "Avg Affection" },
    { value: avg(respectVals).toFixed(1), label: "Avg Respect" },
    { value: avg(familiarityVals).toFixed(1), label: "Avg Familiarity" },
    { value: formatBytes(rawDbBytes), label: "DB Storage" },
    { value: benchmarkEvent, label: "Bench Event" },
    { value: benchmarkTick, label: "Bench Tick" }
  ];

  cardEl.innerHTML = cards.map((card) => `<article class="perf-card"><div class="val">${card.value}</div><div class="lbl">${card.label}</div></article>`).join("");
}

/**
 * Renders top-level recent event feed.
 */
export function renderEventLog() {
  const el = document.getElementById("eventLog");
  if (STATE.eventLogEntries.length === 0) {
    el.innerHTML = "<em>No events yet.</em>";
    return;
  }
  el.innerHTML = STATE.eventLogEntries.slice(0, 60).map((entry) => `<div class="log-entry"><span class="time">[${entry.ts}]</span> <strong>${entry.title}</strong> - ${entry.detail}</div>`).join("");
}

/**
 * Renders detailed operations log panel.
 */
export function renderDetailLog() {
  const el = document.getElementById("detailLog");
  if (STATE.detailLogEntries.length === 0) {
    el.innerHTML = "<em>Operations logged here.</em>";
    return;
  }
  el.innerHTML = STATE.detailLogEntries.slice(0, 150).map((entry) => `<div class="log-entry"><span class="time">[${entry.ts}]</span> ${entry.msg}</div>`).join("");
}

/**
 * Renders selectable event template cards.
 */
export function renderEventTemplates() {
  const el = document.getElementById("eventTemplates");
  if (!el) {
    return;
  }
  el.innerHTML = EVENT_TEMPLATES.map((tpl, index) => `<div class="event-tpl" data-template-index="${index}"><div class="name">${tpl.name}</div><div class="desc">${tpl.desc || "Template event"}</div></div>`).join("");
}

/**
 * Renders relationship matrix in selected mode.
 */
export function renderMatrix() {
  const matrixWrap = document.getElementById("matrixContainer");
  const axis = document.getElementById("matrixAxis").value;
  const show = document.getElementById("matrixShow").value;
  if (STATE.chars.length > 30) {
    matrixWrap.innerHTML = "<p style='font-size:11px;color:var(--dim)'>Matrix hidden for >30 chars.</p>";
    return;
  }
  if (STATE.chars.length === 0) {
    matrixWrap.innerHTML = "";
    return;
  }

  let html = "<table class='grid-table'><tr><th></th>";
  for (const char of STATE.chars) {
    html += `<th>${char.name.slice(0, 6)}</th>`;
  }
  html += "</tr>";

  for (const row of STATE.chars) {
    html += `<tr><th>${row.name.slice(0, 6)}</th>`;
    for (const col of STATE.chars) {
      if (row.id === col.id) {
        html += "<td>—</td>";
        continue;
      }
      const rel = getRel(row.id, col.id);
      if (show === "values") {
        html += `<td>${rel[axis].toFixed(0)}</td>`;
      } else if (show === "labels") {
        const st = getStableStates()[rel.emotionalLabel];
        html += `<td style="color:${st.color}">${st.label.slice(0, 7)}</td>`;
      } else {
        html += `<td><span class="rel-type rel-${rel.structuralTag}">${rel.structuralTag.slice(0, 5)}</span></td>`;
      }
    }
    html += "</tr>";
  }
  html += "</table>";
  matrixWrap.innerHTML = html;
}

/**
 * Renders two-character inspector with axes, flags, and patterns.
 */
export function renderInspector() {
  const charId = document.getElementById("inspChar").value;
  const targetId = document.getElementById("inspTarget").value;
  const el = document.getElementById("inspectorContent");
  if (!charId || !targetId || charId === targetId) {
    el.innerHTML = "<p>Select two different characters.</p>";
    return;
  }

  const rel = getRel(charId, targetId);
  const reverse = getRel(targetId, charId);
  const stable = getStableStates()[rel.emotionalLabel];
  const liveStateId = computeStableStateId(rel);
  const liveState = getStableStates()[liveStateId];
  const flags = getFlags(charId, targetId);
  const patternStatus = getPatternStatus(charId, targetId);

  let html = `<h3>${getCharName(charId)} -> ${getCharName(targetId)}
    <span class="rel-type rel-${rel.structuralTag}">${rel.structuralTag}</span></h3>`;
  html += `<div class="stable-state" style="background:${stable.color}22;color:${stable.color}">${stable.label}</div>`;
  html += `<p class="hint">${stable.desc}</p>`;
  if (liveStateId !== rel.emotionalLabel) {
    html += `<div class="stable-state" style="background:${liveState.color}22;color:${liveState.color}">-> ${liveState.label} (on next tick)</div>`;
  }
  html += `<p class="hint">Emotional label reflects emotional reality. Structural tag reflects relationship category.</p>`;

  const colors = { trust: "var(--accent)", affection: "var(--accent2)", respect: "var(--green)", familiarity: "var(--yellow)" };
  for (const axis of AXES) {
    const value = rel[axis];
    const pct = ((value + 100) / 200) * 100;
    html += `<label>${axis}: ${value.toFixed(1)}</label><div class="axis-bar"><div class="fill" style="width:${pct}%;background:${colors[axis]}"></div></div>`;
  }

  html += `<h3>Flags (${flags.length})</h3>`;
  html += flags.map((flag) => `<span class="flag-chip ${flag.sentiment}">${flag.tag} ttl:${Math.max(0, flag.decay - (STATE.tickCount - flag.tick))}</span>`).join("") || "<p>None</p>";
  html += "<h3>Pattern Status</h3>";
  const patternText = Object.entries(patternStatus).map(([tag, row]) => {
    if (row.applied) {
      return `${tag}: triggered`;
    }
    if (row.count >= row.threshold) {
      return `${tag}: ready`;
    }
    return `${tag}: ${row.count}/${row.threshold}`;
  });
  html += `<p>${patternText.join(" | ")}</p>`;
  html += `<h3>Reverse Snapshot</h3>`;
  html += `<p>${getCharName(targetId)} -> ${getCharName(charId)} | ${reverse.structuralTag} | ${reverse.emotionalLabel}</p>`;
  el.innerHTML = html;
}

/**
 * Renders stable-state definition cards.
 */
export function renderStableStates() {
  const el = document.getElementById("stableStatesList");
  if (!el) {
    return;
  }
  const states = getStableStates();
  const categories = {
    "Positive Core": ["devoted", "trustedFriend", "closeBond"],
    "Professional/Distant": ["professionalRegard", "reliableButCold", "respectedAcquaintance"],
    "Complicated Affection": ["devotedEnabler", "guiltyPleasure", "fondButWary", "complicatedAttachment"],
    "Damaged/Broken": ["brokenTrust", "disappointedInYou", "usedToBeClose"],
    "Antagonistic": ["respectedRival", "begrudgingRespect", "waryAcquaintance", "contempt", "coldHostility", "bitterEnmity", "loathing"],
    "Fear-based": ["fearfulDeference", "intimidated"],
    "Baseline": ["acquaintance", "stranger", "neutral"]
  };
  let html = "";
  for (const [category, ids] of Object.entries(categories)) {
    html += `<div style="margin-top:10px;margin-bottom:4px;font-size:11px;font-weight:600;color:var(--dim)">${category}</div>`;
    for (const id of ids) {
      const st = states[id];
      if (!st) {
        continue;
      }
      let description = "State description unavailable.";
      if (st.desc) {
        description = st.desc;
      }
      html += `<div style="margin-bottom:6px;padding:6px;background:var(--bg);border-radius:4px;border-left:3px solid ${st.color}">
        <div style="font-weight:600;color:${st.color};font-size:12px">${st.label}</div>
        <div style="font-size:10px;color:var(--text);margin-top:2px">${description}</div>
        <div style="font-size:9px;color:var(--dim);margin-top:3px">Drift -> T:${st.drift.trust} A:${st.drift.affection} R:${st.drift.respect} F:${st.drift.familiarity}</div>
      </div>`;
    }
  }
  el.innerHTML = html;
}

/**
 * Renders benchmark table in log tab.
 */
export function renderBenchmarkResults() {
  const container = document.getElementById("benchResults");
  if (!container) {
    return;
  }
  if (!STATE.lastBenchmark || STATE.lastBenchmark.length === 0) {
    container.innerHTML = "<em>Run benchmark to see results.</em>";
    return;
  }
  let html = "<table style='width:100%;border-collapse:collapse;font-size:11px'><tr><th style='text-align:left;padding:4px;border:1px solid var(--border)'>Chars</th><th style='padding:4px;border:1px solid var(--border)'>Pairs</th><th style='padding:4px;border:1px solid var(--border)'>Init ms</th><th style='padding:4px;border:1px solid var(--border)'>Evt avg ms</th><th style='padding:4px;border:1px solid var(--border)'>Tick avg ms</th></tr>";
  for (const row of STATE.lastBenchmark) {
    html += `<tr><td style='padding:4px;border:1px solid var(--border)'>${row.chars}</td><td style='padding:4px;border:1px solid var(--border);text-align:right'>${row.pairs}</td><td style='padding:4px;border:1px solid var(--border);text-align:right'>${row.initMs.toFixed(2)}</td><td style='padding:4px;border:1px solid var(--border);text-align:right'>${row.evtMs.toFixed(4)}</td><td style='padding:4px;border:1px solid var(--border);text-align:right'>${row.tickMs.toFixed(3)}</td></tr>`;
  }
  html += "</table>";
  container.innerHTML = html;
}

/**
 * Renders footer status counts.
 */
export function renderStatus() {
  const pairCount = Object.keys(STATE.rels).length;
  const flagCount = Object.values(STATE.flags).reduce((sum, flags) => sum + flags.length, 0);
  document.getElementById("statusLeft").textContent = `Events: ${STATE.eventCount} | Ticks: ${STATE.tickCount}`;
  document.getElementById("statusRight").textContent = `Pairs: ${pairCount} | Flags: ${flagCount}`;
}
