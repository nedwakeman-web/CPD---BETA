// oracle-three-voice-prompt.js
// Cosmic Daily Planner: three-voice prompt fragment for the Oracle (and lower) tier.
//
// Use this in server.js wherever the Oracle reading prompt is built. Append the
// THREE_VOICE_INSTRUCTION block to the system prompt, and ask the model to return
// the THREE_VOICE_SCHEMA as its output format.
//
// Why this exists: the live UI (see cdp_voice_toggle_module.html) toggles voices
// in place, instantly, with no extra API calls. To support that, every section of
// every reading must arrive in the response with all three voices already written.

'use strict';

// =====================================================================
// 1. Voice definitions, in the language the model needs to write each voice well.
//    These are the operating definitions; do not paraphrase loosely.
// =====================================================================

const THREE_VOICE_INSTRUCTION = `

VOICE ARCHITECTURE: Every reading section must be written in three voices.
The user toggles between them with a single click. The data must be present
in your response so the toggle works without another model call.

The three voices are not three rewrites. They are three legitimate ways of
describing the same underlying reality. The reading data does not change
between voices; only the language used to describe it changes.

VOICE 1: TRADITION
The symbolic, archetypal voice.
- Speaks in the language of the four frameworks: Pythagorean numerology,
  Western archetypal astrology (Greene, Tarnas), Mayan/Dreamspell calendrics,
  lunar wisdom.
- Uses words like "the day carries," "the energy," "the portal," "the archetype,"
  "the ancestors," "the symbolic field."
- Cites named scholarly authorities for symbolic claims (e.g., Tarnas 2006 on
  archetypal pattern, Aldana 2022 on Maya calendrics).
- For a transit it would say: "Saturn's pressure asks you to build with care.
  The archetype here is the threshold guardian."

VOICE 2: SCIENCE
The neuroscience and chronobiology voice.
- Speaks in the language of mechanism: circadian cognition (Cajochen and Schmidt
  2024), default mode network (Raichle 2015), interoception (Barrett 2017),
  attachment (Bowlby), predictive processing (Clark 2016), constructed emotion.
- Uses words like "your salience network," "predictive frame," "interoceptive
  signal," "DMN consolidation window," "cortisol awakening response."
- Cites peer-reviewed sources where claims are causal.
- For the same transit it would say: "Holding a frame of careful effort during
  this period shapes the predictive models your brain applies. The framework
  becomes part of how the situation is processed (Clark 2016)."

VOICE 3: EVERYDAY
The plain-spoken voice. No jargon from either tradition or science.
- Written for someone who finds both other voices alienating.
- Direct, warm, practical. Words a smart friend would use.
- Names what today is good for, what to be careful about, what to do next.
- No mystical language, no clinical language. Just ordinary English.
- For the same transit it would say: "Today is a day to slow down on a
  decision you've been pushing forward. The pressure you're feeling is
  real and it's asking you to be more careful, not more frantic."

CRITICAL RULES:
- The three voices describe the SAME data. They never contradict each other.
- The Everyday voice is not a dumbed-down Tradition voice. It is its own register,
  warm and practical. Sonia's family member found neither Tradition nor Science
  resonant; the Everyday voice is for them.
- The Science voice cites neuroscience research; the Tradition voice cites
  philosophical and astrological authorities; the Everyday voice cites nothing.
- All three voices follow CDP's house rules: no em dashes, no en dashes, no
  exclamation marks, no second-person hectoring.
- Length parity: the three voices should be within roughly the same word count
  per section. Tradition should not be the longest, Everyday should not be the shortest.
`;

// =====================================================================
// 2. JSON output schema. The model must return this exact structure.
// =====================================================================

const THREE_VOICE_SCHEMA = {
  schema_description: "Return a single JSON object matching this structure. Each section has tradition, science, and everyday keys. The frontend renders all three; the user toggles between them.",
  example: {
    headline: {
      tradition: "A day of structure and quiet portal.",
      science: "An 8-day with 7-layer interaction; salience network favours focused work, DMN reflection in the evening.",
      everyday: "A good day to get something concrete done. Save the deeper thinking for the evening."
    },
    today_in_one_line: {
      tradition: "Build today, reflect tonight.",
      science: "Morning analytic window, evening consolidation window.",
      everyday: "Work in the morning. Think in the evening."
    },
    numerology: {
      tradition: "...",
      science: "...",
      everyday: "..."
    },
    moon: {
      tradition: "...",
      science: "...",
      everyday: "..."
    },
    dreamspell: {
      tradition: "...",
      science: "...",
      everyday: "..."
    },
    western_astrology: {
      tradition: "...",
      science: "...",
      everyday: "..."
    },
    convergence: {
      tradition: "Three frameworks agree: ...",
      science: "Three independent symbolic systems converging on the same recommendation acts as a Schelling point for attention (Schelling 1960; salience network research).",
      everyday: "Three different ways of looking at today are pointing in the same direction: ..."
    },
    priorities: [
      {
        title: "...",
        tradition: "...",
        science: "...",
        everyday: "..."
      }
    ],
    focus_on: {
      tradition: "...",
      science: "...",
      everyday: "..."
    },
    ease_off: {
      tradition: "...",
      science: "...",
      everyday: "..."
    },
    reflection_prompt: {
      tradition: "...",
      science: "...",
      everyday: "..."
    },
    pacing: {
      morning: { tradition: "...", science: "...", everyday: "..." },
      afternoon: { tradition: "...", science: "...", everyday: "..." },
      evening: { tradition: "...", science: "...", everyday: "..." }
    },
    shadow_work: {
      tradition: "...",
      science: "...",
      everyday: "..."
    }
  }
};

// =====================================================================
// 3. Frontend rendering helper. Call this from server.js when building
//    the HTML that goes into the reading container.
// =====================================================================

function renderSectionThreeVoice(sectionKey, voiceObj, opts = {}) {
  const escape = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  const tag = opts.tag || 'p';
  const cls = opts.cls ? ' ' + escape(opts.cls) : '';

  // Pattern A: short text, swap-in-place via data attributes.
  // Best for headlines, single sentences, small blocks.
  if (opts.mode === 'inline' || !opts.mode) {
    const initial = voiceObj.tradition || '';
    return '<' + tag + ' class="cdp-voiced' + cls +
      '" data-tradition="' + escape(voiceObj.tradition || '') +
      '" data-science="' + escape(voiceObj.science || '') +
      '" data-everyday="' + escape(voiceObj.everyday || '') + '">' +
      escape(initial) +
      '</' + tag + '>';
  }

  // Pattern B: longer text, three sibling blocks, CSS-toggled.
  // Best for paragraphs and multi-sentence sections.
  return [
    '<div class="cdp-voice-block cdp-voice-tradition' + cls + '">',
    '<' + tag + '>' + escape(voiceObj.tradition || '') + '</' + tag + '>',
    '</div>',
    '<div class="cdp-voice-block cdp-voice-science' + cls + '">',
    '<' + tag + '>' + escape(voiceObj.science || '') + '</' + tag + '>',
    '</div>',
    '<div class="cdp-voice-block cdp-voice-everyday' + cls + '">',
    '<' + tag + '>' + escape(voiceObj.everyday || '') + '</' + tag + '>',
    '</div>'
  ].join('');
}

// Validate that a parsed reading object has all three voices for every section.
// Returns { ok: bool, missing: [{ section, voices: [...] }] }
function validateThreeVoiceReading(reading) {
  const missing = [];
  const required = ['tradition', 'science', 'everyday'];

  function checkObj(obj, path) {
    if (!obj || typeof obj !== 'object') return;
    // If this object has any of the voice keys, all three must be present
    const hasAnyVoice = required.some(v => v in obj);
    if (hasAnyVoice) {
      const missingVoices = required.filter(v => !obj[v] || (typeof obj[v] === 'string' && obj[v].trim().length === 0));
      if (missingVoices.length > 0) {
        missing.push({ section: path, voices: missingVoices });
      }
      return;  // do not recurse into a leaf voice object
    }
    // Recurse
    for (const [k, v] of Object.entries(obj)) {
      if (Array.isArray(v)) {
        v.forEach((item, i) => checkObj(item, path + '.' + k + '[' + i + ']'));
      } else if (v && typeof v === 'object') {
        checkObj(v, path + '.' + k);
      }
    }
  }

  checkObj(reading, '$');
  return { ok: missing.length === 0, missing };
}

module.exports = {
  THREE_VOICE_INSTRUCTION,
  THREE_VOICE_SCHEMA,
  renderSectionThreeVoice,
  validateThreeVoiceReading
};
