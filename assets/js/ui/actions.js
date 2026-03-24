import { STATE, getRel, resetState } from "../core/state.js";
import { addChar, batchAddChars, benchmark, EVENT_TEMPLATES, pushEvent, randomEvents, removeChar, setStructuralTag, tick } from "../core/engine.js";
import { renderAll, renderInspector, renderMatrix } from "./render.js";

/**
 * Activates one top-level tab and hides others.
 */
function activeTab(tabId) {
  document.querySelectorAll(".tab").forEach((tab) => tab.classList.remove("active"));
  document.querySelectorAll(".tab-content").forEach((tab) => tab.classList.remove("active"));
  document.querySelector(`.tab[data-tab="${tabId}"]`).classList.add("active");
  document.getElementById(`tab-${tabId}`).classList.add("active");
}

/**
 * Adds a character from input field.
 */
function addCharacterFromInput() {
  const input = document.getElementById("newCharName");
  const name = input.value.trim();
  if (!name) {
    return;
  }
  addChar(name);
  input.value = "";
  renderAll();
}

/**
 * Batch-adds characters using configured count.
 */
function batchAddCharacters() {
  const amount = Number.parseInt(document.getElementById("batchCount").value, 10) || 10;
  batchAddChars(amount);
  renderAll();
}

/**
 * Sets structural tag for selected relationship direction.
 */
function setSelectedStructuralTag() {
  const source = document.getElementById("relFrom").value;
  const target = document.getElementById("relTo").value;
  const tag = document.getElementById("relType").value;
  if (!source || !target || source === target) {
    return;
  }
  setStructuralTag(source, target, tag);
  renderAll();
}

/**
 * Fires one random template event.
 */
function runTemplateEventAtRandom() {
  if (STATE.chars.length < 2) {
    return;
  }
  const template = EVENT_TEMPLATES[Math.floor(Math.random() * EVENT_TEMPLATES.length)];
  const source = STATE.chars[Math.floor(Math.random() * STATE.chars.length)];
  let target = source;
  while (target.id === source.id) {
    target = STATE.chars[Math.floor(Math.random() * STATE.chars.length)];
  }
  pushEvent(template.build(source.id, target.id));
}

/**
 * Opens benchmark controls modal.
 */
function runBenchmarkAndLog() {
  openBenchmarkModal();
}

/**
 * Exports simulation state as JSON file.
 */
function exportState() {
  const blob = new Blob([JSON.stringify(STATE, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "relationship_state_v2.json";
  a.click();
}

/**
 * Opens modal overlay with provided content.
 */
function openModal(html) {
  const overlay = document.getElementById("overlay");
  const modal = document.getElementById("modalContent");
  modal.innerHTML = html;
  overlay.classList.add("show");
}

/**
 * Closes currently open modal overlay.
 */
function closeModal() {
  document.getElementById("overlay").classList.remove("show");
}

/**
 * Shows benchmark modal and executes configured benchmark run.
 */
function openBenchmarkModal() {
  openModal(`
    <h2 style="margin-bottom:10px">Benchmark</h2>
    <label>Character counts (comma separated)</label>
    <input id="benchCounts" value="10,25,50,100">
    <label style="margin-top:6px">Events per test</label>
    <input id="benchEvents" value="40" type="number">
    <label style="margin-top:6px">Ticks per test</label>
    <input id="benchTicks" value="4" type="number">
    <div style="display:flex;gap:6px;margin-top:10px">
      <button id="benchRunBtn" class="green">Run</button>
      <button id="benchCancelBtn" class="secondary">Cancel</button>
    </div>
  `);
  document.getElementById("benchRunBtn").addEventListener("click", () => {
    const countsRaw = document.getElementById("benchCounts").value;
    const counts = countsRaw.split(",").map((value) => Number.parseInt(value.trim(), 10)).filter((value) => Number.isFinite(value) && value > 0);
    const eventsPerTest = Number.parseInt(document.getElementById("benchEvents").value, 10) || 40;
    const ticksPerTest = Number.parseInt(document.getElementById("benchTicks").value, 10) || 4;
    benchmark({ counts, eventsPerTest, ticksPerTest });
    closeModal();
    activeTab("log");
    renderAll();
  });
  document.getElementById("benchCancelBtn").addEventListener("click", closeModal);
}

/**
 * Shows event-template modal for source/target selection.
 */
function openTemplateModal(index) {
  if (STATE.chars.length < 2) {
    return;
  }
  const template = EVENT_TEMPLATES[index];
  const options = STATE.chars.map((c) => `<option value="${c.id}">${c.name}</option>`).join("");
  let templateDescription = "";
  if (template.desc) {
    templateDescription = template.desc;
  }
  openModal(`
    <h2 style="margin-bottom:4px">${template.name}</h2>
    <p class="hint" style="margin-bottom:8px">${templateDescription}</p>
    <div class="row"><div><label>Source</label><select id="tplSource">${options}</select></div><div><label>Target</label><select id="tplTarget">${options}</select></div></div>
    <div style="display:flex;gap:6px;margin-top:10px">
      <button id="tplPushBtn" class="green">Push Event</button>
      <button id="tplCancelBtn" class="secondary">Cancel</button>
    </div>
  `);
  const targetSelect = document.getElementById("tplTarget");
  if (STATE.chars.length > 1) {
    targetSelect.selectedIndex = 1;
  }
  document.getElementById("tplPushBtn").addEventListener("click", () => {
    const source = document.getElementById("tplSource").value;
    const target = document.getElementById("tplTarget").value;
    if (source === target) {
      return;
    }
    pushEvent(template.build(source, target));
    closeModal();
    renderAll();
  });
  document.getElementById("tplCancelBtn").addEventListener("click", closeModal);
}

/**
 * Shows custom event modal with axis and flag controls.
 */
function openCustomEventModal() {
  if (STATE.chars.length < 2) {
    return;
  }
  const options = STATE.chars.map((c) => `<option value="${c.id}">${c.name}</option>`).join("");
  openModal(`
    <h2 style="margin-bottom:8px">Custom Event</h2>
    <label>Event Name</label><input id="ceN" value="Custom Event">
    <div class="row" style="margin-top:4px"><div><label>Source</label><select id="ceS">${options}</select></div><div><label>Target</label><select id="ceT">${options}</select></div></div>
    <div class="row" style="margin-top:4px"><div><label>Trust Δ</label><input id="ceD_trust" type="number" value="0"></div><div><label>Affection Δ</label><input id="ceD_affection" type="number" value="0"></div></div>
    <div class="row" style="margin-top:4px"><div><label>Respect Δ</label><input id="ceD_respect" type="number" value="0"></div><div><label>Familiarity Δ</label><input id="ceD_familiarity" type="number" value="0"></div></div>
    <label style="margin-top:4px">Flag tag</label><input id="ceFlag" placeholder="e.g. betrayal, kindness">
    <label style="margin-top:4px">Flag sentiment</label><select id="ceFlagSent"><option>neutral</option><option>positive</option><option>negative</option></select>
    <div style="display:flex;gap:6px;margin-top:10px"><button id="cePushBtn" class="green">Push</button><button id="ceCancelBtn" class="secondary">Cancel</button></div>
  `);
  const targetSelect = document.getElementById("ceT");
  if (STATE.chars.length > 1) {
    targetSelect.selectedIndex = 1;
  }
  document.getElementById("cePushBtn").addEventListener("click", () => {
    const source = document.getElementById("ceS").value;
    const target = document.getElementById("ceT").value;
    if (source === target) {
      return;
    }
    const deltas = {};
    for (const axis of ["trust", "affection", "respect", "familiarity"]) {
      const raw = Number.parseFloat(document.getElementById(`ceD_${axis}`).value) || 0;
      if (raw !== 0) {
        deltas[axis] = raw;
      }
    }
    const event = {
      name: document.getElementById("ceN").value || "Custom Event",
      source,
      effects: [{ target, deltas }],
      flags: []
    };
    const tag = document.getElementById("ceFlag").value.trim();
    if (tag) {
      event.flags.push({ perceiver: target, about: source, tag, sentiment: document.getElementById("ceFlagSent").value });
    }
    pushEvent(event);
    closeModal();
    renderAll();
  });
  document.getElementById("ceCancelBtn").addEventListener("click", closeModal);
}

/**
 * Binds all UI event handlers once at startup.
 */
function attachGlobalEvents() {
  document.getElementById("addCharBtn").addEventListener("click", addCharacterFromInput);
  document.getElementById("batchAddBtn").addEventListener("click", batchAddCharacters);
  document.getElementById("setRelTypeBtn").addEventListener("click", setSelectedStructuralTag);
  document.getElementById("tickBtn").addEventListener("click", () => { tick(); renderAll(); });
  document.getElementById("events10Btn").addEventListener("click", () => { randomEvents(10); renderAll(); });
  document.getElementById("events50Btn").addEventListener("click", () => { randomEvents(50); renderAll(); });
  document.getElementById("resetBtn").addEventListener("click", () => { resetState(); renderAll(); });
  document.getElementById("runBenchmarkBtn").addEventListener("click", runBenchmarkAndLog);
  document.getElementById("exportBtn").addEventListener("click", exportState);
  document.getElementById("customEventBtn").addEventListener("click", openCustomEventModal);
  document.getElementById("overlay").addEventListener("click", (event) => {
    if (event.target && event.target.id === "overlay") {
      closeModal();
    }
  });

  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      activeTab(tab.dataset.tab);
      if (tab.dataset.tab === "matrix") {
        renderMatrix();
      }
      if (tab.dataset.tab === "inspector") {
        renderInspector();
      }
    });
  });

  document.getElementById("matrixAxis").addEventListener("change", renderMatrix);
  document.getElementById("matrixShow").addEventListener("change", renderMatrix);
  document.getElementById("inspChar").addEventListener("change", renderInspector);
  document.getElementById("inspTarget").addEventListener("change", renderInspector);

  document.getElementById("charList").addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }
    const id = target.dataset.removeChar;
    if (!id) {
      return;
    }
    removeChar(id);
    renderAll();
  });
  document.getElementById("eventTemplates").addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }
    const card = target.closest("[data-template-index]");
    if (!card) {
      return;
    }
    const index = Number.parseInt(card.dataset.templateIndex, 10);
    if (Number.isNaN(index)) {
      return;
    }
    openTemplateModal(index);
  });
}

/**
 * Initializes input handlers and starter simulation scenario.
 */
export function initActions() {
  attachGlobalEvents();
  renderAll();
}

/**
 * Ensures a directional relationship exists.
 */
export function ensureRelationshipExists(a, b) {
  return getRel(a, b);
}
