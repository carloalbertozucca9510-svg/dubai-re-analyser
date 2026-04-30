import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

function fmtAED(value) {
  if (value >= 1000000) return `AED ${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `AED ${(value / 1000).toFixed(0)}K`;
  return `AED ${value}`;
}

function buildMonthlyData(data) {
  const map = {};
  for (const t of data) {
    const ym = t.instance_date.slice(0, 7);
    if (!map[ym]) map[ym] = { total: 0, count: 0 };
    map[ym].total += t.actual_worth;
    map[ym].count += 1;
  }
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, { total, count }]) => ({
      month,
      avgPrice: Math.round(total / count),
    }));
}

function buildAreaData(data) {
  const map = {};
  for (const t of data) {
    const area = t.area_name_en;
    if (!map[area]) map[area] = { total: 0, count: 0 };
    map[area].total += t.meter_sale_price;
    map[area].count += 1;
  }
  return Object.entries(map)
    .map(([area, { total, count }]) => ({
      area: area.replace(' Dubai', '').replace(' Bay', ' Bay'),
      avgPricePerSqm: Math.round(total / count),
    }))
    .sort((a, b) => b.avgPricePerSqm - a.avgPricePerSqm);
}

const GOLD = '#C9A96E';
const GOLD2 = '#a07840';

export default function Charts({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="charts-grid">
        <div className="chart-card">
          <h3 className="chart-title">Average Price Over Time</h3>
          <p className="chart-empty">No data — adjust filters and run analysis.</p>
        </div>
        <div className="chart-card">
          <h3 className="chart-title">Average Price / sqm by Area</h3>
          <p className="chart-empty">No data — adjust filters and run analysis.</p>
        </div>
      </div>
    );
  }

  const monthlyData = buildMonthlyData(data);
  const areaData = buildAreaData(data);

  return (
    <div className="charts-grid">
      <div className="chart-card">
        <h3 className="chart-title">Average Price Over Time</h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={monthlyData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d333b" />
            <XAxis dataKey="month" tick={{ fill: '#8B949E', fontSize: 11 }} />
            <YAxis tickFormatter={fmtAED} tick={{ fill: '#8B949E', fontSize: 11 }} width={80} />
            <Tooltip
              formatter={(v) => [fmtAED(v), 'Avg Price']}
              contentStyle={{ background: '#161B22', border: '1px solid #30363d', color: '#fff' }}
            />
            <Line
              type="monotone"
              dataKey="avgPrice"
              stroke={GOLD}
              strokeWidth={2}
              dot={{ fill: GOLD, r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card">
        <h3 className="chart-title">Average Price / sqm by Area</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={areaData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d333b" />
            <XAxis dataKey="area" tick={{ fill: '#8B949E', fontSize: 11 }} />
            <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} tick={{ fill: '#8B949E', fontSize: 11 }} width={55} />
            <Tooltip
              formatter={(v) => [`AED ${v.toLocaleString()}`, 'Avg /sqm']}
              contentStyle={{ background: '#161B22', border: '1px solid #30363d', color: '#fff' }}
            />
            <Bar dataKey="avgPricePerSqm" fill={GOLD} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
