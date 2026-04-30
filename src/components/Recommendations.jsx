import { pricePerUnit, unitLabel } from '../utils/units.js';

function getMonthlyTrend(data) {
  const map = {};
  for (const t of data) {
    const ym = t.instance_date.slice(0, 7);
    if (!map[ym]) map[ym] = { total: 0, count: 0 };
    map[ym].total += t.actual_worth;
    map[ym].count += 1;
  }
  const months = Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, { total, count }]) => total / count);
  if (months.length < 2) return 0;
  return months[months.length - 1] - months[0];
}

function getAreaStats(data, useSqft) {
  const map = {};
  for (const t of data) {
    const area = t.area_name_en;
    if (!map[area]) map[area] = { yieldTotal: 0, count: 0, pricePerUnitTotal: 0 };
    map[area].yieldTotal += (t.rent_value / t.actual_worth) * 100;
    map[area].pricePerUnitTotal += pricePerUnit(t.meter_sale_price, useSqft);
    map[area].count += 1;
  }
  return Object.entries(map).map(([area, { yieldTotal, count, pricePerUnitTotal }]) => ({
    area,
    avgYield: yieldTotal / count,
    avgPricePerUnit: pricePerUnitTotal / count,
    count,
  }));
}

export default function Recommendations({ data, useSqft }) {
  const unit = unitLabel(useSqft);

  if (!data || data.length === 0) {
    return (
      <div className="rec-card">
        <h3 className="rec-title">Investment Recommendations</h3>
        <p className="rec-empty">Run an analysis to generate recommendations.</p>
      </div>
    );
  }

  const bullets = [];
  const count = data.length;
  const avgYield = data.reduce((s, t) => s + (t.rent_value / t.actual_worth) * 100, 0) / count;
  const trend = getMonthlyTrend(data);
  const areaStats = getAreaStats(data, useSqft).sort((a, b) => b.avgYield - a.avgYield);
  const bestValueAreas = [...areaStats].sort((a, b) => a.avgPricePerUnit - b.avgPricePerUnit).slice(0, 2);

  if (avgYield > 7) {
    bullets.push(
      `Strong rental yield of ${avgYield.toFixed(1)}% detected${areaStats[0] ? ` — led by ${areaStats[0].area} at ${areaStats[0].avgYield.toFixed(1)}%` : ''}. Exceeds the typical Dubai threshold of 7%.`
    );
  } else if (avgYield > 5) {
    bullets.push(
      `Moderate rental yield of ${avgYield.toFixed(1)}% — in line with Dubai market averages. Look at JVC or Business Bay for higher-yield opportunities.`
    );
  } else {
    bullets.push(
      `Below-average yield of ${avgYield.toFixed(1)}%. Consider adjusting area or property-type filters to find higher-yield assets.`
    );
  }

  if (trend > 0) {
    bullets.push(
      `Prices are trending upward (+AED ${Math.round(trend).toLocaleString()} over the selected period) — entering sooner may reduce acquisition cost.`
    );
  } else if (trend < 0) {
    bullets.push(
      `Prices show a downward trend over the selected period — a buyer's market may present negotiation opportunities.`
    );
  }

  if (count >= 30) {
    bullets.push(`High transaction volume (${count} deals) signals strong market liquidity and investor confidence.`);
  } else if (count < 10) {
    bullets.push(`Low sample size (${count} transactions). Widen the filters for more statistically reliable insights.`);
  }

  if (bestValueAreas.length > 0) {
    const names = bestValueAreas
      .map((a) => `${a.area} (AED ${Math.round(a.avgPricePerUnit).toLocaleString()}/${unit})`)
      .join(' and ');
    bullets.push(`Best value by price-per-${unit}: ${names} — strong entry points for capital appreciation.`);
  }

  if (areaStats[0] && areaStats[0].avgYield > 7) {
    bullets.push(
      `Top yield area: ${areaStats[0].area} at ${areaStats[0].avgYield.toFixed(1)}% gross yield — ideal for buy-to-let investors.`
    );
  }

  return (
    <div className="rec-card">
      <h3 className="rec-title">Investment Recommendations</h3>
      <ul className="rec-list">
        {bullets.map((b, i) => (
          <li key={i} className="rec-item">
            <span className="rec-bullet">▶</span>
            {b}
          </li>
        ))}
      </ul>
      <p className="rec-disclaimer">
        Analysis based on {count} transaction{count !== 1 ? 's' : ''}. Data is indicative only — conduct due diligence before investing.
      </p>
    </div>
  );
}
