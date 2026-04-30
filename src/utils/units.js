export const SQM_TO_SQFT = 10.764;

export function pricePerUnit(pricePerSqm, useSqft) {
  return useSqft ? pricePerSqm / SQM_TO_SQFT : pricePerSqm;
}

export function areaInUnit(areaSqm, useSqft) {
  return useSqft ? areaSqm * SQM_TO_SQFT : areaSqm;
}

export function unitLabel(useSqft) {
  return useSqft ? 'sqft' : 'sqm';
}

export function fmtPrice(n) {
  return n.toLocaleString('en-AE', { maximumFractionDigits: 0 });
}

export function percentile(arr, p) {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

// Histogram bins for sqft; sqm bins derived by * SQM_TO_SQFT
export const SQFT_BINS = [750, 1000, 1250, 1500, 2000, 2500, 3000, 3500];

export function buildHistogram(values, useSqft) {
  const factor = useSqft ? 1 : SQM_TO_SQFT;
  const boundaries = SQFT_BINS.map((b) => b * (useSqft ? 1 : factor));

  const labels = [
    `<${fmtK(boundaries[0])}`,
    ...boundaries.slice(0, -1).map((b, i) => `${fmtK(b)}-${fmtK(boundaries[i + 1])}`),
    `>${fmtK(boundaries[boundaries.length - 1])}`,
  ];

  const counts = new Array(labels.length).fill(0);
  for (const v of values) {
    let placed = false;
    for (let i = 0; i < boundaries.length; i++) {
      if (v < boundaries[i]) {
        counts[i] = (counts[i] || 0) + 1;
        placed = true;
        break;
      }
    }
    if (!placed) counts[counts.length - 1] += 1;
  }

  return labels.map((label, i) => ({ label, count: counts[i] }));
}

function fmtK(n) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(Math.round(n));
}
