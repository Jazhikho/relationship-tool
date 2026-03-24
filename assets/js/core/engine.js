import { AXES, STATE, clamp, getFlags, getRel, getCharName } from "./state.js";
import { ECHO_MULT, EVENT_TEMPLATES, PATTERNS, STABLE_STATE_ORDER, STABLE_STATES, STATE_TO_TYPE, STRUCTURAL_RANK } from "./config.js";
export { EVENT_TEMPLATES };

/**
 * Computes the dominant emotional state for a directional relationship.
 */
function computeEmotionalLabel(rel) {
  for (const label of STABLE_STATE_ORDER) {
    if (STABLE_STATES[label].match(rel)) {
      return label;
    }
  }
  return "neutral";
}

/**
 * Public stable-state computation helper for live UI previews.
 */
export function computeStableStateId(rel) {
  return computeEmotionalLabel(rel);
}

/**
 * Scores pair engagement from both directions and memory depth.
 */
function getEngagementScore(a, b) {
  const forward = getRel(a, b);
  const reverse = getRel(b, a);
  const emotionalMagnitude =
    Math.abs(forward.trust) + Math.abs(forward.affection) + Math.abs(forward.respect) +
    Math.abs(reverse.trust) + Math.abs(reverse.affection) + Math.abs(reverse.respect);
  const familiarityMass = Math.max(0, forward.familiarity) + Math.max(0, reverse.familiarity);
  const memoryMass = (getFlags(a, b).length + getFlags(b, a).length) * 6;
  return emotionalMagnitude + familiarityMass + memoryMass;
}

/**
 * Infers structural tag from emotional axes and engagement.
 */
function inferStructuralTag(a, b) {
  const rel = getRel(a, b);
  if (rel.structuralTag === "family") {
    return "family";
  }

  const engagement = getEngagementScore(a, b);
  const familiarity = rel.familiarity;
  const friendSignal = rel.trust + rel.affection + rel.respect;
  const allySignal = rel.trust + rel.respect;

  if (rel.trust < -30 && rel.affection < -22 && familiarity > 18) {
    return "enemy";
  }
  if (rel.affection < -15 && rel.respect > 12 && familiarity > 20) {
    return "rival";
  }
  if (friendSignal > 68 && familiarity > 26) {
    return "friend";
  }
  if (allySignal > 50 && familiarity > 22) {
    return "ally";
  }
  if (familiarity > 12 || engagement > 34) {
    return "acquaintance";
  }
  return "stranger";
}

/**
 * Applies structural inference while respecting locked structural tags.
 */
function applyStructuralReality(a, b) {
  const rel = getRel(a, b);
  if (rel.isStructuralLocked) {
    return;
  }
  const stateImplied = STATE_TO_TYPE[rel.emotionalLabel];
  if (stateImplied && stateImplied !== "family") {
    rel.structuralTag = stateImplied;
  }
  const inferredFromEngagement = inferStructuralTag(a, b);
  if (STRUCTURAL_RANK[inferredFromEngagement] >= STRUCTURAL_RANK[rel.structuralTag] || inferredFromEngagement === "stranger") {
    rel.structuralTag = inferredFromEngagement;
  }
}

/**
 * Enforces symmetric integrity for structural family ties.
 */
function enforceFamilySymmetry(a, b) {
  const relAB = getRel(a, b);
  const relBA = getRel(b, a);
  const isFamilyEitherDirection = relAB.structuralTag === "family" || relBA.structuralTag === "family";
  if (!isFamilyEitherDirection) {
    return;
  }
  relAB.structuralTag = "family";
  relBA.structuralTag = "family";
  relAB.isStructuralLocked = true;
  relBA.isStructuralLocked = true;
}

/**
 * Evaluates pattern thresholds for one directed relationship.
 */
function checkPatterns(a, b) {
  const rel = getRel(a, b);
  if (!rel.patternApplied) {
    rel.patternApplied = {};
  }
  const flags = getFlags(a, b);
  const counts = {};
  for (const flag of flags) {
    counts[flag.tag] = (counts[flag.tag] || 0) + 1;
  }
  const messages = [];
  for (const [tag, pattern] of Object.entries(PATTERNS)) {
    if ((counts[tag] || 0) >= pattern.threshold) {
      const result = applyPattern(tag, rel, pattern);
      if (result) {
        messages.push(result);
      }
    }
  }
  return messages;
}

/**
 * Applies a one-shot pattern effect if not already applied.
 */
function applyPattern(tag, rel, pattern) {
  if (!rel.patternApplied) {
    rel.patternApplied = {};
  }
  if (rel.patternApplied[tag]) {
    return null;
  }
  for (const axis of AXES) {
    if (Object.prototype.hasOwnProperty.call(pattern.axisDelta, axis)) {
      rel[axis] = clamp(rel[axis] + pattern.axisDelta[axis]);
    }
  }
  rel.patternApplied[tag] = true;
  return pattern.message;
}

/**
 * Moves relationship axes toward the selected state attractor.
 */
function driftTowardStableState(rel) {
  const state = STABLE_STATES[rel.emotionalLabel];
  const driftRate = 0.05;
  for (const axis of AXES) {
    const target = state.drift[axis];
    const current = rel[axis];
    if (Math.abs(target - current) > 0.5) {
      rel[axis] = current + (target - current) * driftRate;
    }
  }
}

/**
 * Records operation timings for dashboard metrics.
 */
function logPerf(op, dt) {
  STATE.perfLog.push({ op, dt, tick: STATE.tickCount, chars: STATE.chars.length, pairs: Object.keys(STATE.rels).length });
}

/**
 * Appends a high-level entry to the event log.
 */
function logEvent(title, detail) {
  STATE.eventLogEntries.unshift({ title, detail, ts: new Date().toLocaleTimeString() });
  if (STATE.eventLogEntries.length > 120) {
    STATE.eventLogEntries.length = 120;
  }
}

/**
 * Appends detail-level log messages with timestamps.
 */
function logDetail(message) {
  STATE.detailLogEntries.unshift({ msg: message, ts: new Date().toLocaleTimeString() });
  if (STATE.detailLogEntries.length > 240) {
    STATE.detailLogEntries.length = 240;
  }
}

/**
 * Adds a character and initializes directional relationships.
 */
export function addChar(name) {
  const id = `c${STATE.charIdCounter}`;
  STATE.charIdCounter += 1;
  STATE.chars.push({ id, name });
  for (const char of STATE.chars) {
    if (char.id !== id) {
      getRel(id, char.id);
      getRel(char.id, id);
      getRel(id, char.id).patternApplied = {};
      getRel(char.id, id).patternApplied = {};
    }
  }
}

/**
 * Removes a character and all related directional records.
 */
export function removeChar(id) {
  STATE.chars = STATE.chars.filter((char) => char.id !== id);
  for (const key of Object.keys(STATE.rels)) {
    if (key.includes(id)) {
      delete STATE.rels[key];
    }
  }
  for (const key of Object.keys(STATE.flags)) {
    if (key.includes(id)) {
      delete STATE.flags[key];
    }
  }
}

/**
 * Sets a structural tag for a directional relationship.
 */
export function setStructuralTag(a, b, tag) {
  const relAB = getRel(a, b);
  const relBA = getRel(b, a);

  relAB.structuralTag = tag;
  relBA.structuralTag = tag;

  if (tag === "family") {
    relAB.isStructuralLocked = true;
    relBA.isStructuralLocked = true;
  } else {
    relAB.isStructuralLocked = false;
    relBA.isStructuralLocked = false;
  }

  if (!relAB.patternApplied) {
    relAB.patternApplied = {};
  }
  if (!relBA.patternApplied) {
    relBA.patternApplied = {};
  }

  relAB.emotionalLabel = computeEmotionalLabel(relAB);
  relBA.emotionalLabel = computeEmotionalLabel(relBA);
}

/**
 * Applies axis deltas to a directed relationship with clamping.
 */
function modRel(a, b, deltas) {
  const rel = getRel(a, b);
  for (const axis of AXES) {
    if (Object.prototype.hasOwnProperty.call(deltas, axis)) {
      rel[axis] = clamp(rel[axis] + deltas[axis]);
    }
  }
}

/**
 * Appends a source-attributed flag to perceiver->about memory.
 */
function addFlag(perceiver, about, tag, sentiment, decay = 10) {
  getFlags(perceiver, about).push({ tag, sentiment, tick: STATE.tickCount, decay });
}

/**
 * Propagates social echo from an event into third-party opinions.
 */
function propagateEcho(source, target, deltas) {
  for (const observer of STATE.chars) {
    if (observer.id === source || observer.id === target) {
      continue;
    }
    const observerToTarget = getRel(observer.id, target);
    const closeness = (observerToTarget.affection + observerToTarget.trust + observerToTarget.familiarity) / 300;
    if (Math.abs(closeness) < 0.1) {
      continue;
    }
    const strength = closeness * (ECHO_MULT[observerToTarget.structuralTag] || 0.05);
    if (Math.abs(strength) < 0.02) {
      continue;
    }
    const echo = {};
    for (const axis of AXES) {
      if (Object.prototype.hasOwnProperty.call(deltas, axis)) {
        echo[axis] = deltas[axis] * strength;
      }
    }
    modRel(observer.id, source, echo);
  }
}

/**
 * Applies a fully-formed event object to the simulation state.
 */
export function pushEvent(evt) {
  const start = performance.now();
  STATE.eventCount += 1;

  if (evt.effects) {
    for (const effect of evt.effects) {
      if (!effect.target || !effect.deltas) {
        continue;
      }
      modRel(evt.source, effect.target, effect.deltas);
      modRel(evt.source, effect.target, { familiarity: 2 });
      modRel(effect.target, evt.source, { familiarity: 2 });
      propagateEcho(evt.source, effect.target, effect.deltas);
    }
  }

  if (evt.flags) {
    for (const flag of evt.flags) {
      addFlag(flag.perceiver, flag.about, flag.tag, flag.sentiment, flag.decay || 10);
    }
  }

  for (const key of Object.keys(STATE.rels)) {
    const [a, b] = key.split("->");
    enforceFamilySymmetry(a, b);
    const rel = STATE.rels[key];
    const patternMessages = checkPatterns(a, b);
    for (const message of patternMessages) {
      logDetail(`[${getCharName(a)}->${getCharName(b)}] ${message}`);
    }
    rel.emotionalLabel = computeEmotionalLabel(rel);
    applyStructuralReality(a, b);
  }

  const dt = performance.now() - start;
  logEvent(evt.name, `${getCharName(evt.source)} | ${dt.toFixed(3)}ms`);
  logPerf("event", dt);
}

/**
 * Advances one simulation tick: flag decay, pattern checks, drift, transitions.
 */
export function tick() {
  const start = performance.now();
  STATE.tickCount += 1;

  for (const key of Object.keys(STATE.flags)) {
    STATE.flags[key] = STATE.flags[key].filter((flag) => (STATE.tickCount - flag.tick) < flag.decay);
  }

  for (const key of Object.keys(STATE.rels)) {
    const [a, b] = key.split("->");
    enforceFamilySymmetry(a, b);
    const rel = STATE.rels[key];
    const beforeState = rel.emotionalLabel;
    const beforeType = rel.structuralTag;
    const patternMessages = checkPatterns(a, b);
    for (const message of patternMessages) {
      logDetail(`[${getCharName(a)}->${getCharName(b)}] ${message}`);
    }
    rel.emotionalLabel = computeEmotionalLabel(rel);
    driftTowardStableState(rel);
    applyStructuralReality(a, b);
    if (beforeState !== rel.emotionalLabel) {
      logDetail(`[${getCharName(a)}->${getCharName(b)}] Emotional: ${beforeState} -> ${rel.emotionalLabel}`);
      rel.patternApplied = {};
    }
    if (beforeType !== rel.structuralTag) {
      logDetail(`[${getCharName(a)}->${getCharName(b)}] Structural: ${beforeType} -> ${rel.structuralTag}`);
    }
  }

  const dt = performance.now() - start;
  logEvent(`Tick #${STATE.tickCount}`, `${dt.toFixed(2)}ms`);
  logDetail(`Processed ${Object.keys(STATE.rels).length} directional relationships`);
  logPerf("tick", dt);
}

/**
 * Fires N random events across available characters.
 */
export function randomEvents(count) {
  if (STATE.chars.length < 2) {
    return;
  }
  for (let i = 0; i < count; i += 1) {
    const template = EVENT_TEMPLATES[Math.floor(Math.random() * EVENT_TEMPLATES.length)];
    const source = STATE.chars[Math.floor(Math.random() * STATE.chars.length)];
    let target = source;
    while (target.id === source.id) {
      target = STATE.chars[Math.floor(Math.random() * STATE.chars.length)];
    }
    pushEvent(template.build(source.id, target.id));
  }
}

/**
 * Batch-adds characters with family clusters and weighted structural seeding.
 */
export function batchAddChars(count) {
  const names = ["Aelric", "Brenna", "Cael", "Danya", "Eris", "Fael", "Gwen", "Hale", "Iris", "Jace", "Kael", "Lira", "Maren", "Nyx", "Orin", "Piper", "Quinn", "Rhea", "Sable", "Thane", "Uma", "Vex", "Wren", "Xara", "Yael", "Zara"];
  const newIds = [];
  const existingIds = STATE.chars.map((c) => c.id);

  for (let index = 0; index < count; index += 1) {
    let name = names[index % names.length];
    if (index >= names.length) {
      name += `_${Math.ceil((index + 1) / names.length)}`;
    }
    const id = `c${STATE.charIdCounter}`;
    STATE.charIdCounter += 1;
    STATE.chars.push({ id, name });
    newIds.push(id);
    for (const c of STATE.chars) {
      if (c.id !== id) {
        getRel(id, c.id);
        getRel(c.id, id);
      }
    }
  }

  const weightedTypes = [
    { type: "stranger", weight: 40 },
    { type: "friend", weight: 25 },
    { type: "ally", weight: 15 },
    { type: "rival", weight: 12 },
    { type: "enemy", weight: 8 }
  ];
  const totalWeight = weightedTypes.reduce((sum, row) => sum + row.weight, 0);
  function pickType() {
    let bucket = Math.random() * totalWeight;
    for (const row of weightedTypes) {
      bucket -= row.weight;
      if (bucket <= 0) {
        return row.type;
      }
    }
    return "stranger";
  }

  const familyGroups = [];
  const usedIds = new Set();
  const familyGroupCount = Math.max(1, Math.floor(count / 4));
  for (let f = 0; f < familyGroupCount; f += 1) {
    const groupSize = 2 + Math.floor(Math.random() * 3);
    const group = [];
    for (let g = 0; g < groupSize && usedIds.size < newIds.length; g += 1) {
      let candidate = null;
      let guard = 0;
      while (guard < 50) {
        const pick = newIds[Math.floor(Math.random() * newIds.length)];
        if (!usedIds.has(pick)) {
          candidate = pick;
          break;
        }
        guard += 1;
      }
      if (candidate) {
        usedIds.add(candidate);
        group.push(candidate);
      }
    }
    if (group.length >= 2) {
      familyGroups.push(group);
    }
  }

  function applyDelta(rel, deltas) {
    for (const axis of AXES) {
      if (Object.prototype.hasOwnProperty.call(deltas, axis)) {
        rel[axis] = clamp(rel[axis] + deltas[axis]);
      }
    }
  }

  for (const group of familyGroups) {
    for (let i = 0; i < group.length; i += 1) {
      for (let j = i + 1; j < group.length; j += 1) {
        const a = group[i];
        const b = group[j];
        const rAB = getRel(a, b);
        const rBA = getRel(b, a);
        rAB.structuralTag = "family";
        rBA.structuralTag = "family";
        rAB.isStructuralLocked = true;
        rBA.isStructuralLocked = true;
        applyDelta(rAB, { affection: 20 + Math.random() * 30, familiarity: 40 + Math.random() * 30, trust: 10 + Math.random() * 20 });
        applyDelta(rBA, { affection: 20 + Math.random() * 30, familiarity: 40 + Math.random() * 30, trust: 10 + Math.random() * 20 });
      }
    }
  }

  for (let i = 0; i < newIds.length; i += 1) {
    for (let j = i + 1; j < newIds.length; j += 1) {
      const a = newIds[i];
      const b = newIds[j];
      const rAB = getRel(a, b);
      const rBA = getRel(b, a);
      if (rAB.structuralTag !== "family") {
        const t = pickType();
        rAB.structuralTag = t;
        rBA.structuralTag = t;
        if (t === "friend") {
          applyDelta(rAB, { affection: 15 + Math.random() * 20, trust: 10 + Math.random() * 15, familiarity: 20 + Math.random() * 20 });
          applyDelta(rBA, { affection: 15 + Math.random() * 20, trust: 10 + Math.random() * 15, familiarity: 20 + Math.random() * 20 });
        } else if (t === "ally") {
          applyDelta(rAB, { trust: 15 + Math.random() * 15, respect: 10 + Math.random() * 15, familiarity: 15 + Math.random() * 15 });
          applyDelta(rBA, { trust: 15 + Math.random() * 15, respect: 10 + Math.random() * 15, familiarity: 15 + Math.random() * 15 });
        } else if (t === "rival") {
          applyDelta(rAB, { affection: -10 - Math.random() * 15, respect: 5 + Math.random() * 20, familiarity: 20 + Math.random() * 20 });
          applyDelta(rBA, { affection: -10 - Math.random() * 15, respect: 5 + Math.random() * 20, familiarity: 20 + Math.random() * 20 });
        } else if (t === "enemy") {
          applyDelta(rAB, { trust: -20 - Math.random() * 20, affection: -20 - Math.random() * 20, familiarity: 15 + Math.random() * 25 });
          applyDelta(rBA, { trust: -20 - Math.random() * 20, affection: -20 - Math.random() * 20, familiarity: 15 + Math.random() * 25 });
        }
      }
    }
  }

  for (const newId of newIds) {
    for (const oldId of existingIds) {
      const t = pickType();
      getRel(newId, oldId).structuralTag = t;
      getRel(oldId, newId).structuralTag = t;
    }
  }

  for (const key of Object.keys(STATE.rels)) {
    const [a, b] = key.split("->");
    enforceFamilySymmetry(a, b);
    const rel = STATE.rels[key];
    rel.emotionalLabel = computeEmotionalLabel(rel);
    applyStructuralReality(a, b);
  }
}

/**
 * Runs benchmark scenarios and stores summary rows on state.
 */
export function benchmark(config = {}) {
  const snapshot = JSON.parse(JSON.stringify(STATE));
  let counts = [10, 25, 50, 100];
  if (Array.isArray(config.counts) && config.counts.length > 0) {
    counts = config.counts;
  }
  let eventIterations = 40;
  if (Number.isFinite(config.eventsPerTest)) {
    eventIterations = config.eventsPerTest;
  }
  let tickIterations = 4;
  if (Number.isFinite(config.ticksPerTest)) {
    tickIterations = config.ticksPerTest;
  }
  const results = [];

  for (const count of counts) {
    STATE.chars = [];
    STATE.rels = {};
    STATE.flags = {};
    STATE.tickCount = 0;
    STATE.eventCount = 0;
    STATE.charIdCounter = 0;

    const initStart = performance.now();
    for (let index = 0; index < count; index += 1) {
      addChar(`NPC_${index}`);
    }
    const initMs = performance.now() - initStart;

    const evtStart = performance.now();
    randomEvents(eventIterations);
    const evtMs = (performance.now() - evtStart) / eventIterations;

    const tickStart = performance.now();
    for (let i = 0; i < tickIterations; i += 1) {
      tick();
    }
    const tickMs = (performance.now() - tickStart) / tickIterations;

    results.push({ chars: count, pairs: count * (count - 1), initMs, evtMs, tickMs });
  }

  STATE.chars = snapshot.chars;
  STATE.rels = snapshot.rels;
  STATE.flags = snapshot.flags;
  STATE.tickCount = snapshot.tickCount;
  STATE.eventCount = snapshot.eventCount;
  STATE.perfLog = snapshot.perfLog;
  STATE.eventLogEntries = snapshot.eventLogEntries;
  STATE.detailLogEntries = snapshot.detailLogEntries;
  STATE.charIdCounter = snapshot.charIdCounter;
  STATE.lastBenchmark = results;

  return results;
}

/**
 * Returns immutable stable-state definition map.
 */
export function getStableStates() {
  return STABLE_STATES;
}

/**
 * Returns per-pattern threshold/progress state for one directed relationship.
 */
export function getPatternStatus(a, b) {
  const rel = getRel(a, b);
  const flags = getFlags(a, b);
  const counts = {};
  for (const flag of flags) {
    counts[flag.tag] = (counts[flag.tag] || 0) + 1;
  }
  const status = {};
  for (const [tag, pattern] of Object.entries(PATTERNS)) {
    const count = counts[tag] || 0;
    status[tag] = {
      count,
      threshold: pattern.threshold,
      applied: Boolean(rel.patternApplied && rel.patternApplied[tag])
    };
  }
  return status;
}
