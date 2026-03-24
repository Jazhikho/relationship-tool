export const AXES = ["trust", "affection", "respect", "familiarity"];
export const EXTENDED_AXES = ["trust", "affection", "respect", "familiarity", "closeness", "commitment", "visibility"];

export const STATE = {
  chars: [],
  rels: {},
  flags: {},
  tickCount: 0,
  eventCount: 0,
  perfLog: [],
  eventLogEntries: [],
  detailLogEntries: [],
  charIdCounter: 0,
  lastBenchmark: null
};

/**
 * Returns key used by directional relationship stores.
 */
export function relKey(a, b) {
  return `${a}->${b}`;
}

/**
 * Clamps numeric values to simulation axis bounds.
 */
export function clamp(value, min = -100, max = 100) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Gets or creates a directional relationship record.
 */
export function getRel(a, b) {
  const key = relKey(a, b);
  if (!STATE.rels[key]) {
    STATE.rels[key] = {
      trust: 0,
      affection: 0,
      respect: 0,
      familiarity: 0,
      closeness: 0,
      commitment: 0,
      visibility: 0,
      scars: 0,
      repairMomentum: 0,
      emotionalLabel: "stranger",
      structuralTag: "stranger",
      isStructuralLocked: false,
      patternApplied: {},
      history: [],
      eventLedger: {}
    };
  }
  return STATE.rels[key];
}

/**
 * Gets or creates directional memory flags.
 */
export function getFlags(a, b) {
  const key = relKey(a, b);
  if (!STATE.flags[key]) {
    STATE.flags[key] = [];
  }
  return STATE.flags[key];
}

/**
 * Resolves character id to display name.
 */
export function getCharName(id) {
  const match = STATE.chars.find((char) => char.id === id);
  if (match) {
    return match.name;
  }
  return id;
}

/**
 * Resets simulation state and counters.
 */
export function resetState() {
  STATE.chars = [];
  STATE.rels = {};
  STATE.flags = {};
  STATE.tickCount = 0;
  STATE.eventCount = 0;
  STATE.perfLog = [];
  STATE.eventLogEntries = [];
  STATE.detailLogEntries = [];
  STATE.charIdCounter = 0;
  STATE.lastBenchmark = null;
}
