/** Scale-independent finger extension, evaluated after MediaPipe inference. */
export function classifyHand(points) {
  if (
    !Array.isArray(points) ||
    points.length !== 21 ||
    points.some((p) => !p || !Number.isFinite(p.x + p.y + p.z))
  )
    return "unknown";
  const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
  if (distance(points[0], points[9]) < 0.015) return "unknown";
  const count = [8, 12, 16, 20].filter(
    (t) =>
      distance(points[t], points[0]) >
      distance(points[t - 2], points[0]) * 1.22,
  ).length;
  return count === 4 ? "open" : count === 0 ? "closed" : "unknown";
}

// Palm bones stay stable when fingers bend; finger tips would confuse fist and depth.
export function measurePalmScale(points, aspect = 1) {
  if (!Array.isArray(points) || points.length !== 21 || !Number.isFinite(aspect) || aspect <= 0) return null;
  const indices = [0, 5, 9, 17];
  if (indices.some(i => !points[i] || !Number.isFinite(points[i].x) || !Number.isFinite(points[i].y))) return null;
  const distance = (a, b) => Math.hypot((points[a].x - points[b].x) * aspect, points[a].y - points[b].y);
  const size = (distance(0, 9) + distance(5, 17)) / 2;
  return size > .015 ? size : null;
}

export function palmExpansion(size, baseline) {
  if (!(size > 0) || !(baseline > 0) || !Number.isFinite(size + baseline)) return null;
  const t = Math.max(0, Math.min(1, (size / baseline - .65) / 1.05));
  return t * t * (3 - 2 * t);
}

/** Continuous finger aperture, independent of distance from the camera. */
export function handOpenness(points) {
  if (classifyHand(points) === 'unknown' && (!Array.isArray(points) || points.length !== 21 || points.some(p=>!p||!Number.isFinite(p.x+p.y+p.z)))) return null;
  const distance=(a,b)=>Math.hypot(points[a].x-points[b].x,points[a].y-points[b].y,points[a].z-points[b].z);
  if(distance(0,9)<.015)return null;
  const extensions=[8,12,16,20].map(t=>{
    const denominator=distance(t-2,0);
    if(denominator<.01)return 0;
    return Math.max(0,Math.min(1,(distance(t,0)/denominator-.85)/.8));
  });
  return extensions.reduce((a,b)=>a+b,0)/4;
}
