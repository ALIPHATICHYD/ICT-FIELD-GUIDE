import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GUIDES, CATEGORIES, TICKET_TYPES, byId } from '../src/data/guides.js';
import { TOOLS, TOOL_GROUPS } from '../src/data/tools.js';
import { _strings, LANGS } from '../src/i18n.js';
import { searchGuides } from '../src/search.js';

test('every guide is complete and links resolve', () => {
  const ids = new Set();
  const cats = new Set(CATEGORIES.map((c) => c.id));
  const types = new Set(TICKET_TYPES.map((t) => t.id));
  for (const g of GUIDES) {
    assert.ok(!ids.has(g.id), `duplicate id ${g.id}`); ids.add(g.id);
    assert.match(g.id, /^[a-z0-9-]+$/);
    assert.ok(cats.has(g.cat), `${g.id}: unknown category ${g.cat}`);
    assert.ok(g.title && g.summary && g.steps.length >= 2, `${g.id}: missing text`);
    g.tickets.forEach((t) => assert.ok(types.has(t), `${g.id}: unknown ticket type ${t}`));
    g.related.forEach((r) => assert.ok(byId[r], `${g.id}: related guide ${r} missing`));
    if (g.figure) assert.ok(['printer', 'ups'].includes(g.figure));
    for (const s of g.steps) {
      assert.ok(s.t && s.b, `${g.id}: step without text`);
      if (s.cmd) assert.ok(['cmd', 'ps', 'sh', 'info'].includes(s.shell), `${g.id}: command without shell type`);
      const all = `${s.t} ${s.b} ${s.cmd || ''}`;
      assert.equal((all.match(/\[\[/g) || []).length, (all.match(/\]\]/g) || []).length, `${g.id}: unbalanced [[ ]]`);
    }
  }
});

test('every category and ticket type has at least one guide', () => {
  CATEGORIES.forEach((c) => assert.ok(GUIDES.some((g) => g.cat === c.id), c.id));
  TICKET_TYPES.forEach((t) => assert.ok(GUIDES.some((g) => g.tickets.includes(t.id)), t.id));
});

test('tools point at real groups and guides', () => {
  const groups = new Set(TOOL_GROUPS.map((g) => g.id));
  TOOLS.forEach((x) => { assert.ok(groups.has(x.g), x.name); if (x.guide) assert.ok(byId[x.guide], x.name); });
});

test('all four languages define every interface string', () => {
  const keys = Object.keys(_strings.en);
  assert.deepEqual(LANGS.map((l) => l.id), ['en', 'ha', 'yo', 'ig']);
  for (const l of LANGS) for (const k of keys) assert.ok(k in _strings[l.id], `${l.id} missing ${k}`);
});

test('search finds the obvious guide first', () => {
  assert.equal(searchGuides(GUIDES, 'printer offline')[0].id, 'printer-offline');
  assert.equal(searchGuides(GUIDES, 'ORA-12154')[0].id, 'oracle-tns');
  assert.equal(searchGuides(GUIDES, 'ups beeping')[0].id, 'ups-beeping');
  assert.equal(searchGuides(GUIDES, 'outlook sync')[0].id, 'outlook-sync');
  assert.equal(searchGuides(GUIDES, 'install iphone')[0].id, 'install-field-guide');
  assert.deepEqual(searchGuides(GUIDES, ''), []);
});
