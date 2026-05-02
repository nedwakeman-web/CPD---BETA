// oracle-three-voice-prompt.test.js
const { validateThreeVoiceReading, renderSectionThreeVoice } = require('./oracle-three-voice-prompt');

let pass = 0, fail = 0;
function test(name, fn) {
  try { fn(); console.log('  PASS  ' + name); pass++; }
  catch (e) { console.log('  FAIL  ' + name + ' :: ' + e.message); fail++; }
}
function assert(c, m) { if (!c) throw new Error(m || 'assert'); }

console.log('\nValidator:');

test('valid reading passes', () => {
  const r = {
    headline: { tradition: 'a', science: 'b', everyday: 'c' },
    moon: { tradition: 'a', science: 'b', everyday: 'c' }
  };
  const v = validateThreeVoiceReading(r);
  assert(v.ok, 'expected ok');
});

test('missing science is caught', () => {
  const r = { headline: { tradition: 'a', everyday: 'c' } };
  const v = validateThreeVoiceReading(r);
  assert(!v.ok, 'expected fail');
  assert(v.missing.length === 1);
  assert(v.missing[0].voices.includes('science'));
});

test('empty everyday string is caught', () => {
  const r = { headline: { tradition: 'a', science: 'b', everyday: '   ' } };
  const v = validateThreeVoiceReading(r);
  assert(!v.ok);
  assert(v.missing[0].voices.includes('everyday'));
});

test('nested priorities array validates each item', () => {
  const r = {
    priorities: [
      { title: 'p1', tradition: 'a', science: 'b', everyday: 'c' },
      { title: 'p2', tradition: 'a', science: 'b' }   // missing everyday
    ]
  };
  const v = validateThreeVoiceReading(r);
  assert(!v.ok);
  assert(v.missing.length === 1);
  assert(v.missing[0].section.includes('priorities[1]'));
});

test('nested pacing object validates each window', () => {
  const r = {
    pacing: {
      morning: { tradition: 'a', science: 'b', everyday: 'c' },
      afternoon: { tradition: 'a', science: 'b', everyday: 'c' },
      evening: { tradition: 'a', science: 'b' }   // missing everyday
    }
  };
  const v = validateThreeVoiceReading(r);
  assert(!v.ok);
  assert(v.missing.length === 1);
  assert(v.missing[0].section.includes('pacing.evening'));
});

console.log('\nRenderer:');

test('inline mode emits data attributes', () => {
  const html = renderSectionThreeVoice('headline', {
    tradition: 'A day of structure.',
    science: 'An 8-day, salience network forward.',
    everyday: 'Good day to get stuff done.'
  });
  assert(html.includes('cdp-voiced'));
  assert(html.includes('data-tradition="A day of structure."'));
  assert(html.includes('data-science='));
  assert(html.includes('data-everyday='));
  // Initial visible text is tradition
  assert(html.includes('>A day of structure.<'));
});

test('block mode emits three siblings', () => {
  const html = renderSectionThreeVoice('long', {
    tradition: 'Long tradition text.',
    science: 'Long science text.',
    everyday: 'Long everyday text.'
  }, { mode: 'block' });
  assert(html.includes('cdp-voice-block cdp-voice-tradition'));
  assert(html.includes('cdp-voice-block cdp-voice-science'));
  assert(html.includes('cdp-voice-block cdp-voice-everyday'));
  assert(html.includes('Long tradition text.'));
  assert(html.includes('Long science text.'));
  assert(html.includes('Long everyday text.'));
});

test('escapes HTML in voice text', () => {
  const html = renderSectionThreeVoice('h', {
    tradition: 'a <b>x</b> "c"',
    science: 'b',
    everyday: 'e'
  });
  assert(html.includes('&lt;b&gt;'));
  assert(html.includes('&quot;'));
  assert(!html.includes('<b>x</b>'));
});

console.log('\nResult:');
console.log('  ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail > 0 ? 1 : 0);
