/**
 * Ordered stable-state definitions and relationship simulation constants.
 */
export const STABLE_STATES = {
  devoted: { label: "Devoted", color: "#a06cff", desc: "Deep bond across all dimensions", match: (r) => r.trust > 50 && r.affection > 50 && r.respect > 40 && r.familiarity > 40, drift: { trust: 65, affection: 70, respect: 55, familiarity: 60 } },
  trustedFriend: { label: "Trusted Friend", color: "#6c8aff", desc: "Solid friendship with mutual regard", match: (r) => r.trust > 35 && r.affection > 25 && r.respect > 20 && r.familiarity > 25, drift: { trust: 45, affection: 40, respect: 35, familiarity: 45 } },
  closeBond: { label: "Close Bond", color: "#70b0ff", desc: "High familiarity and affection", match: (r) => r.familiarity > 40 && r.affection > 35 && r.trust > 10, drift: { trust: 25, affection: 45, respect: 20, familiarity: 55 } },
  respectedAcquaintance: { label: "Respected Acquaintance", color: "#4cce8a", desc: "Mutual respect without closeness", match: (r) => r.respect > 30 && Math.abs(r.affection) < 25 && r.familiarity < 30, drift: { trust: 15, affection: 5, respect: 40, familiarity: 15 } },
  professionalRegard: { label: "Professional Regard", color: "#50c090", desc: "High respect and trust, low attachment", match: (r) => r.respect > 35 && r.trust > 25 && r.affection < 20 && r.affection > -15, drift: { trust: 35, affection: 5, respect: 45, familiarity: 30 } },
  reliableButCold: { label: "Reliable but Cold", color: "#60a0a0", desc: "Trustworthy without warmth", match: (r) => r.trust > 30 && r.affection < 10 && r.affection > -25, drift: { trust: 40, affection: -5, respect: 25, familiarity: 25 } },
  fondButWary: { label: "Fond but Wary", color: "#ff90c0", desc: "Care present, trust damaged", match: (r) => r.affection > 25 && r.trust < -15 && r.familiarity > 30, drift: { trust: -25, affection: 35, respect: 0, familiarity: 45 } },
  guiltyPleasure: { label: "Guilty Pleasure", color: "#ffa0d0", desc: "Affection despite low respect", match: (r) => r.affection > 30 && r.respect < -10 && r.trust < 15, drift: { trust: 0, affection: 40, respect: -20, familiarity: 35 } },
  devotedEnabler: { label: "Devoted Enabler", color: "#d080c0", desc: "Affection and trust, poor boundaries", match: (r) => r.affection > 40 && r.trust > 30 && r.respect < 0, drift: { trust: 40, affection: 50, respect: -15, familiarity: 50 } },
  complicatedAttachment: { label: "Complicated Attachment", color: "#e080a0", desc: "Strong feelings, mixed trust/respect", match: (r) => r.affection > 35 && Math.abs(r.trust) < 25 && Math.abs(r.respect) < 25 && r.familiarity > 35, drift: { trust: 5, affection: 40, respect: 5, familiarity: 50 } },
  brokenTrust: { label: "Broken Trust", color: "#ff70a0", desc: "Care remains, trust does not", match: (r) => r.trust < -35 && r.affection > 15, drift: { trust: -45, affection: 20, respect: -10, familiarity: 40 } },
  disappointedInYou: { label: "Disappointed", color: "#c08060", desc: "Disillusioned over time", match: (r) => r.respect < -25 && r.familiarity > 30 && r.affection > -20 && r.affection < 25, drift: { trust: -15, affection: 0, respect: -35, familiarity: 40 } },
  usedToBeClose: { label: "Used to Be Close", color: "#a09080", desc: "History remains, warmth faded", match: (r) => r.familiarity > 45 && Math.abs(r.affection) < 20 && Math.abs(r.trust) < 20, drift: { trust: 0, affection: 0, respect: 5, familiarity: 40 } },
  respectedRival: { label: "Respected Rival", color: "#ffa050", desc: "Dislike with respect", match: (r) => r.respect > 25 && r.affection < -15 && r.familiarity > 20, drift: { trust: -10, affection: -25, respect: 35, familiarity: 35 } },
  begrudgingRespect: { label: "Begrudging Respect", color: "#d09040", desc: "Merit acknowledged reluctantly", match: (r) => r.respect > 20 && r.affection < -25, drift: { trust: -5, affection: -30, respect: 30, familiarity: 25 } },
  waryAcquaintance: { label: "Wary Acquaintance", color: "#ffd76c", desc: "Known enough to be cautious", match: (r) => r.trust < -10 && r.trust > -40 && r.familiarity > 15 && Math.abs(r.affection) < 25, drift: { trust: -20, affection: -5, respect: 10, familiarity: 25 } },
  contempt: { label: "Contempt", color: "#ff8060", desc: "Familiar enough for harsh judgement", match: (r) => r.respect < -30 && r.familiarity > 25 && r.affection < 0, drift: { trust: -25, affection: -20, respect: -40, familiarity: 35 } },
  coldHostility: { label: "Cold Hostility", color: "#ff9a5c", desc: "Active dislike with distance", match: (r) => r.trust < -30 && r.affection < -25 && r.respect > -25, drift: { trust: -40, affection: -35, respect: -5, familiarity: 25 } },
  bitterEnmity: { label: "Bitter Enmity", color: "#ff6c6c", desc: "Deep negative bond", match: (r) => r.trust < -45 && r.affection < -40 && r.respect < -30, drift: { trust: -55, affection: -50, respect: -40, familiarity: 50 } },
  loathing: { label: "Loathing", color: "#dd5050", desc: "Visceral disgust", match: (r) => r.affection < -50 && r.respect < -40, drift: { trust: -50, affection: -60, respect: -50, familiarity: 40 } },
  fearfulDeference: { label: "Fearful Deference", color: "#9090c0", desc: "Respect from fear", match: (r) => r.respect > 20 && r.trust < -30 && r.affection < -10, drift: { trust: -40, affection: -15, respect: 30, familiarity: 20 } },
  intimidated: { label: "Intimidated", color: "#8080b0", desc: "Familiar enough to fear", match: (r) => r.familiarity > 25 && r.trust < -35 && r.affection < 5 && r.respect < 5, drift: { trust: -45, affection: -10, respect: 0, familiarity: 30 } },
  acquaintance: { label: "Acquaintance", color: "#9ec3e8", desc: "Some engagement and familiarity", match: (r) => r.familiarity >= 16 && Math.abs(r.trust) < 28 && Math.abs(r.affection) < 28, drift: { trust: 4, affection: 2, respect: 5, familiarity: 24 } },
  stranger: { label: "Stranger", color: "#707070", desc: "No real relationship yet", match: (r) => r.familiarity < 15 && Math.abs(r.trust) < 15 && Math.abs(r.affection) < 15, drift: { trust: 0, affection: 0, respect: 0, familiarity: 0 } },
  neutral: { label: "Neutral", color: "#888", desc: "No strong directional emotional pull", match: (_r) => true, drift: { trust: 0, affection: 0, respect: 0, familiarity: 5 } }
};

export const STABLE_STATE_ORDER = ["devoted", "trustedFriend", "closeBond", "professionalRegard", "reliableButCold", "respectedAcquaintance", "devotedEnabler", "guiltyPleasure", "fondButWary", "complicatedAttachment", "brokenTrust", "disappointedInYou", "usedToBeClose", "respectedRival", "begrudgingRespect", "fearfulDeference", "intimidated", "contempt", "loathing", "bitterEnmity", "coldHostility", "waryAcquaintance", "acquaintance", "stranger", "neutral"];
export const STRUCTURAL_RANK = { stranger: 0, acquaintance: 1, ally: 2, friend: 3, rival: 3, enemy: 4, family: 5 };
export const ECHO_MULT = { family: 0.6, friend: 0.4, ally: 0.3, rival: 0.15, enemy: 0.1, acquaintance: 0.1, stranger: 0.05 };
export const STATE_TO_TYPE = {
  devoted: "friend",
  trustedFriend: "friend",
  closeBond: "friend",
  professionalRegard: "ally",
  reliableButCold: "ally",
  respectedAcquaintance: "ally",
  devotedEnabler: "friend",
  guiltyPleasure: "friend",
  fondButWary: "friend",
  complicatedAttachment: "friend",
  brokenTrust: "rival",
  disappointedInYou: "rival",
  usedToBeClose: "stranger",
  respectedRival: "rival",
  begrudgingRespect: "rival",
  fearfulDeference: "enemy",
  intimidated: "enemy",
  contempt: "enemy",
  loathing: "enemy",
  bitterEnmity: "enemy",
  coldHostility: "enemy",
  waryAcquaintance: "stranger",
  acquaintance: "acquaintance",
  stranger: "stranger",
  neutral: "stranger"
};

export const PATTERNS = {
  betrayal: { threshold: 2, axisDelta: { trust: -25, respect: -15 }, message: "Betrayal pattern triggered" },
  kindness: { threshold: 3, axisDelta: { affection: 15, trust: 8 }, message: "Kindness pattern triggered" },
  boundary_violated: { threshold: 2, axisDelta: { respect: -30, trust: -10 }, message: "Boundary pattern triggered" },
  defended: { threshold: 2, axisDelta: { respect: 20, trust: 12 }, message: "Defended pattern triggered" }
};

export const EVENT_TEMPLATES = [
  { name: "Shared Secret", desc: "Confide private information.", build: (s, t) => ({ name: "Shared Secret", source: s, effects: [{ target: t, deltas: { trust: 10, affection: 6 } }], flags: [{ perceiver: t, about: s, tag: "trusted_me", sentiment: "positive", decay: 20 }] }) },
  { name: "Betrayal", desc: "Devastating trust collapse event.", build: (s, t) => ({ name: "Betrayal", source: s, effects: [{ target: t, deltas: { trust: -30, respect: -15, affection: -10 } }], flags: [{ perceiver: t, about: s, tag: "betrayal", sentiment: "negative", decay: 25 }] }) },
  { name: "Boundary Violation", desc: "Cross a boundary. Respect crashes.", build: (s, t) => ({ name: "Boundary Violation", source: s, effects: [{ target: t, deltas: { respect: -25, trust: -8, affection: -5 } }], flags: [{ perceiver: t, about: s, tag: "boundary_violated", sentiment: "negative", decay: 20 }] }) },
  { name: "Act of Kindness", desc: "Kind action boosts warmth.", build: (s, t) => ({ name: "Act of Kindness", source: s, effects: [{ target: t, deltas: { affection: 12, trust: 4 } }], flags: [{ perceiver: t, about: s, tag: "kindness", sentiment: "positive", decay: 12 }] }) },
  { name: "Casual Encounter", desc: "Spend time together.", build: (s, t) => ({ name: "Casual Encounter", source: s, effects: [{ target: t, deltas: { familiarity: 8 } }], flags: [{ perceiver: t, about: s, tag: "encounter", sentiment: "neutral", decay: 10 }] }) },
  { name: "Defended Honor", desc: "Public defense raises respect and trust.", build: (s, t) => ({ name: "Defended Honor", source: s, effects: [{ target: t, deltas: { respect: 18, trust: 12, affection: 8 } }], flags: [{ perceiver: t, about: s, tag: "defended", sentiment: "positive", decay: 20 }] }) },
  { name: "Saved Life", desc: "Massive positive impact.", build: (s, t) => ({ name: "Saved Life", source: s, effects: [{ target: t, deltas: { trust: 30, affection: 25, respect: 20 } }], flags: [{ perceiver: t, about: s, tag: "life_debt", sentiment: "positive", decay: 50 }] }) },
  { name: "Lie Discovered", desc: "Trust and respect drop from dishonesty.", build: (s, t) => ({ name: "Lie Discovered", source: s, effects: [{ target: t, deltas: { trust: -20, respect: -15, affection: -5 } }], flags: [{ perceiver: t, about: s, tag: "betrayal", sentiment: "negative", decay: 20 }] }) },
  { name: "Public Humiliation", desc: "Public humiliation harms all emotional axes.", build: (s, t) => ({ name: "Public Humiliation", source: s, effects: [{ target: t, deltas: { trust: -20, affection: -25, respect: -20 } }], flags: [{ perceiver: t, about: s, tag: "humiliated_me", sentiment: "negative", decay: 30 }] }) },
  { name: "Ignored in Need", desc: "Neglect during need causes damage.", build: (s, t) => ({ name: "Ignored in Need", source: s, effects: [{ target: t, deltas: { trust: -15, affection: -10, respect: -5 } }], flags: [{ perceiver: t, about: s, tag: "abandoned", sentiment: "negative", decay: 15 }] }) },
  { name: "Gift Given", desc: "Meaningful gift raises affection.", build: (s, t) => ({ name: "Gift Given", source: s, effects: [{ target: t, deltas: { affection: 15, trust: 3 } }], flags: [{ perceiver: t, about: s, tag: "kindness", sentiment: "positive", decay: 12 }] }) },
  { name: "Deep Conversation", desc: "Meaningful talk builds familiarity.", build: (s, t) => ({ name: "Deep Conversation", source: s, effects: [{ target: t, deltas: { familiarity: 10, trust: 4, affection: 5 } }], flags: [{ perceiver: t, about: s, tag: "engaged", sentiment: "positive", decay: 12 }] }) }
];

export const NATURE_PROFILES = {
  stranger: { trust: 45, affection: 10, respect: 40, familiarity: 5, closeness: 5, commitment: 0, visibility: 5 },
  acquaintance: { trust: 50, affection: 20, respect: 45, familiarity: 25, closeness: 20, commitment: 10, visibility: 20 },
  friend: { trust: 62, affection: 58, respect: 55, familiarity: 55, closeness: 58, commitment: 35, visibility: 40 },
  close_friend: { trust: 76, affection: 72, respect: 62, familiarity: 78, closeness: 76, commitment: 55, visibility: 55 },
  best_friend: { trust: 86, affection: 84, respect: 70, familiarity: 90, closeness: 90, commitment: 70, visibility: 65 },
  family: { trust: 65, affection: 65, respect: 55, familiarity: 80, closeness: 72, commitment: 78, visibility: 70 },
  parent_child: { trust: 72, affection: 78, respect: 62, familiarity: 85, closeness: 82, commitment: 90, visibility: 72 },
  siblings: { trust: 67, affection: 62, respect: 50, familiarity: 86, closeness: 75, commitment: 76, visibility: 72 },
  romantic: { trust: 78, affection: 86, respect: 60, familiarity: 72, closeness: 88, commitment: 85, visibility: 75 },
  ex_romantic: { trust: 35, affection: 28, respect: 42, familiarity: 80, closeness: 45, commitment: 18, visibility: 68 },
  mentor_student: { trust: 68, affection: 35, respect: 80, familiarity: 50, closeness: 48, commitment: 60, visibility: 35 },
  coworker: { trust: 52, affection: 25, respect: 55, familiarity: 40, closeness: 28, commitment: 25, visibility: 45 },
  rival: { trust: 35, affection: 15, respect: 65, familiarity: 58, closeness: 35, commitment: 38, visibility: 55 },
  enemy: { trust: 8, affection: 0, respect: 22, familiarity: 45, closeness: 20, commitment: 40, visibility: 65 },
  ally: { trust: 62, affection: 34, respect: 66, familiarity: 48, closeness: 45, commitment: 52, visibility: 42 }
};

export const ECO_EVENT_TEMPLATES = [
  {
    name: "Shared Triumph",
    description: "A success together strengthens direct and social ties.",
    data: {
      type: "shared_triumph",
      direct: { trust: 10, affection: 8, respect: 9, familiarity: 3, closeness: 6 },
      reciprocal: { trust: 6, affection: 5, respect: 5, closeness: 3 },
      addFlags: ["shared_victory"],
      removeFlags: [],
      echo: { enabled: true, baseScale: 0.30, mode: "reputation_positive" },
      visibilityImpact: 8,
      scarDelta: 0,
      repairMomentum: 4
    }
  },
  {
    name: "Betrayal Exposed",
    description: "Trust breaks and fallout propagates across social neighbors.",
    data: {
      type: "betrayal_exposed",
      direct: { trust: -28, affection: -16, respect: -20, closeness: -18 },
      reciprocal: { trust: -8, respect: -6 },
      addFlags: ["betrayed", "trust_broken"],
      removeFlags: [],
      echo: { enabled: true, baseScale: 0.45, mode: "reputation_negative" },
      visibilityImpact: 18,
      scarDelta: 16,
      repairMomentum: -12
    }
  },
  {
    name: "Honest Apology",
    description: "Repair-oriented move that can transition to cautious repair.",
    data: {
      type: "honest_apology",
      direct: { trust: 10, affection: 4, respect: 8, closeness: 3 },
      reciprocal: { respect: 4 },
      addFlags: ["apology_offered"],
      removeFlags: ["stonewalling"],
      echo: { enabled: true, baseScale: 0.18, mode: "repair_signal" },
      visibilityImpact: 6,
      scarDelta: -2,
      repairMomentum: 16
    }
  }
];
