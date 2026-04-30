import { fmtPrice, pricePerUnit, unitLabel } from '../utils/units.js';

function KPICard({ title, value, subtitle }) {
  return (
    <div className="kpi-card">
      <p className="kpi-title">{title}</p>
      <p className="kpi-value">{value}</p>
      {subtitle && <p className="kpi-subtitle">{subtitle}</p>}
    </div>
  );
}

export default function KPICards({ data, useSqft }) {
  const unit = unitLabel(useSqft);

  if (!data || data.length === 0) {
    return (
      <div className="kpi-grid">
        {['Total Transactions', 'Average Price', `Avg Price / ${unit}`, 'Avg Gross Yield'].map((t) => (
          <KPICard key={t} title={t} value="—" />
        ))}
      </div>
    );
  }

  const count = data.length;
  const avgPrice = data.reduce((s, t) => s + t.actual_worth, 0) / count;
  const avgPricePerUnit =
    data.reduce((s, t) => s + pricePerUnit(t.meter_sale_price, useSqft), 0) / count;
  const avgYield =
    data.reduce((s, t) => s + (t.rent_value / t.actual_worth) * 100, 0) / count;

  return (
    <div className="kpi-grid">
      <KPICard
        title="Total Transactions"
        value={count.toLocaleString()}
        subtitle="transactions in view"
      />
      <KPICard
        title="Average Price"
        value={`AED ${fmtPrice(avgPrice)}`}
        subtitle="per transaction"
      />
      <KPICard
        title={`Avg Price / ${unit}`}
        value={`AED ${fmtPrice(avgPricePerUnit)}`}
        subtitle={`per square ${useSqft ? 'foot' : 'metre'}`}
      />
      <KPICard
        title="Avg Gross Yield"
        value={`${avgYield.toFixed(2)}%`}
        subtitle="annual rental yield"
      />
    </div>
  );
}
