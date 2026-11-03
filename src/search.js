// Small offline search: scores each guide by where the words appear.
const norm = (s) => String(s || '').toLowerCase().replace(/\[\[|\]\]/g, '');

export function searchGuides(guides, query) {
  const words = norm(query).split(/[^a-z0-9.\-+#]+/).filter((w) => w.length > 1);
  if (!words.length) return [];
  const scored = guides.map((g) => {
    const title = norm(g.title), tags = norm(g.tags.join(' ')), summary = norm(g.summary);
    const body = norm(g.steps.map((s) => `${s.t} ${s.b} ${s.cmd || ''}`).join(' ') + ' ' + (g.warn || ''));
    let score = 0, hits = 0;
    for (const w of words) {
      let hit = false;
      if (title.includes(w)) { score += 6; hit = true; }
      if (tags.includes(w)) { score += 5; hit = true; }
      if (summary.includes(w)) { score += 3; hit = true; }
      if (body.includes(w)) { score += 1; hit = true; }
      if (hit) hits++;
    }
    // Every word must appear somewhere, unless the query is long.
    const need = words.length <= 2 ? words.length : Math.ceil(words.length * 0.6);
    return { g, score: hits >= need ? score : 0 };
  });
  return scored.filter((x) => x.score > 0).sort((a, b) => b.score - a.score).map((x) => x.g);
}
