function fmt(n) {
  return n.toLocaleString('en-AE', { maximumFractionDigits: 0 });
}

function KPICard({ title, value, subtitle }) {
  return (
    <div className="kpi-card">
      <p className="kpi-title">{title}</p>
      <p className="kpi-value">{value}</p>
      {subtitle && <p className="kpi-subtitle">{subtitle}</p>}
    </div>
  );
}

export default function KPICards({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="kpi-grid">
        {['Total Transactions', 'Average Price', 'Avg Price / sqm', 'Avg Gross Yield'].map((t) => (
          <KPICard key={t} title={t} value="—" />
        ))}
      </div>
    );
  }

  const count = data.length;
  const avgPrice = data.reduce((s, t) => s + t.actual_worth, 0) / count;
  const avgPricePerSqm = data.reduce((s, t) => s + t.meter_sale_price, 0) / count;
  const avgYield =
    (data.reduce((s, t) => s + (t.rent_value / t.actual_worth) * 100, 0) / count);

  return (
    <div className="kpi-grid">
      <KPICard title="Total Transactions" value={count.toLocaleString()} subtitle="transactions in view" />
      <KPICard title="Average Price" value={`AED ${fmt(avgPrice)}`} subtitle="per transaction" />
      <KPICard title="Avg Price / sqm" value={`AED ${fmt(avgPricePerSqm)}`} subtitle="per square metre" />
      <KPICard title="Avg Gross Yield" value={`${avgYield.toFixed(2)}%`} subtitle="annual rental yield" />
    </div>
  );
}
