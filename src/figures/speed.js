// Speed badge: how much faster or slower than real life a step is played.
export function speedLabel(realSeconds, playedMs) {
  if (!realSeconds) return '';
  const r = realSeconds / (playedMs / 1000);
  if (r > 1.25) return `×${r >= 10 ? Math.round(r) : r.toFixed(1).replace(/\.0$/, '')}`;
  if (r < 0.8) return `×1/${Math.round(1 / r)}`;
  return '';
}
