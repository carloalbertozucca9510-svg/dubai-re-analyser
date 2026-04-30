import { useState, useMemo } from 'react';
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
import { mockTransactions } from '../data/mockData.js';
import { pricePerUnit, unitLabel, fmtPrice, buildHistogram } from '../utils/units.js';

const BUILDING_COLORS = ['#C9A96E', '#58A6FF', '#3FB950'];
const BEDROOMS_OPTIONS = ['All', 'Studio', '1 B/R', '2 B/R', '3 B/R', '4 B/R', '5 B/R+'];
const TOOLTIP_STYLE = { background: '#161B22', border: '1px solid #30363d', color: '#fff', fontSize: 12 };

const ALL_BUILDINGS = [...new Set(mockTransactions.map((t) => t.building_name_en))].sort();

function fmtAED(v) {
  if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `${(v / 1000).toFixed(0)}K`;
  return String(v);
}

function getBuildingStats(txns, useSqft) {
  if (!txns.length) return null;
  const count = txns.length;
  const avgPrice = txns.reduce((s, t) => s + t.actual_worth, 0) / count;
  const avgPpu = txns.reduce((s, t) => s + pricePerUnit(t.meter_sale_price, useSqft), 0) / count;
  const avgRent = txns.reduce((s, t) => s + t.rent_value, 0) / count;
  const avgYield = txns.reduce((s, t) => s + (t.rent_value / t.actual_worth) * 100, 0) / count;
  const sorted = [...txns].sort((a, b) => pricePerUnit(a.meter_sale_price, useSqft) - pricePerUnit(b.meter_sale_price, useSqft));
  const mid = Math.floor(sorted.length / 2);
  const medPpu = sorted.length % 2 === 0
    ? (pricePerUnit(sorted[mid - 1].meter_sale_price, useSqft) + pricePerUnit(sorted[mid].meter_sale_price, useSqft)) / 2
    : pricePerUnit(sorted[mid].meter_sale_price, useSqft);
  return { count, avgPrice, avgPpu, avgRent, avgYield, medPpu };
}

function BuildingSelect({ label, value, onChange }) {
  const [query, setQuery] = useState('');
  const filtered = query
    ? ALL_BUILDINGS.filter((b) => b.toLowerCase().includes(query.toLowerCase()))
    : ALL_BUILDINGS;
  return (
    <div className="comp-building-selector">
      <p className="filter-label">{label}</p>
      <input
        className="filter-input"
        placeholder="Search building…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <select
        className="filter-select"
        value={value}
        onChange={(e) => { onChange(e.target.value); setQuery(''); }}
      >
        <option value="">— Select —</option>
        {filtered.map((b) => (
          <option key={b} value={b}>{b}</option>
        ))}
      </select>
    </div>
  );
}

export default function ComparisonPage() {
  const [b1, setB1] = useState('');
  const [b2, setB2] = useState('');
  const [b3, setB3] = useState('');
  const [bedroom, setBedroom] = useState('All');
  const [compared, setCompared] = useState(null);
  const [useSqft] = useState(true);

  const unit = unitLabel(useSqft);

  function buildFilter(name) {
    if (!name) return [];
    let txns = mockTransactions.filter((t) => t.building_name_en === name);
    if (bedroom !== 'All') txns = txns.filter((t) => t.rooms_en === bedroom);
    return txns;
  }

  function runComparison() {
    const buildings = [b1, b2, b3].filter(Boolean);
    if (buildings.length < 2) return;
    const result = buildings.map((name) => ({
      name,
      txns: buildFilter(name),
      color: BUILDING_COLORS[buildings.indexOf(name)],
    }));
    setCompared(result);
  }

  // ── KPI comparison table ──────────────────────────────────────────────────
  const kpiRows = useMemo(() => {
    if (!compared) return [];
    const stats = compared.map((b) => getBuildingStats(b.txns, useSqft));
    const rows = [
      { label: 'Avg Price (AED)', key: 'avgPrice', fmt: (v) => `AED ${fmtPrice(v)}`, better: 'min' },
      { label: `Avg Price / ${unit}`, key: 'avgPpu', fmt: (v) => `AED ${fmtPrice(v)}`, better: 'min' },
      { label: 'Avg Annual Rent', key: 'avgRent', fmt: (v) => `AED ${fmtPrice(v)}`, better: 'max' },
      { label: 'Avg Gross Yield', key: 'avgYield', fmt: (v) => `${v.toFixed(2)}%`, better: 'max' },
      { label: 'Total Transactions', key: 'count', fmt: (v) => String(v), better: 'max' },
      { label: `Median Price / ${unit}`, key: 'medPpu', fmt: (v) => `AED ${fmtPrice(v)}`, better: 'min' },
    ];
    return rows.map((row) => {
      const values = stats.map((s) => (s ? s[row.key] : null));
      const valid = values.filter((v) => v !== null);
      const best = row.better === 'max' ? Math.max(...valid) : Math.min(...valid);
      return { ...row, values, best };
    });
  }, [compared, useSqft, unit]);

  // ── Price dist overlay ────────────────────────────────────────────────────
  const distOverlayData = useMemo(() => {
    if (!compared) return [];
    const hists = compared.map((b) => {
      const vals = b.txns.map((t) => pricePerUnit(t.meter_sale_price, useSqft));
      return buildHistogram(vals, useSqft);
    });
    const labels = hists[0]?.map((h) => h.label) ?? [];
    return labels.map((label, i) => {
      const point = { label };
      compared.forEach((b, bi) => {
        point[b.name] = hists[bi]?.[i]?.count ?? 0;
      });
      return point;
    });
  }, [compared, useSqft]);

  // ── Price trend ───────────────────────────────────────────────────────────
  const trendData = useMemo(() => {
    if (!compared) return [];
    const monthMap = {};
    compared.forEach((b) => {
      b.txns.forEach((t) => {
        const ym = t.instance_date.slice(0, 7);
        if (!monthMap[ym]) monthMap[ym] = {};
        if (!monthMap[ym][b.name]) monthMap[ym][b.name] = { total: 0, count: 0 };
        monthMap[ym][b.name].total += pricePerUnit(t.meter_sale_price, useSqft);
        monthMap[ym][b.name].count += 1;
      });
    });
    return Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, byBuilding]) => {
        const pt = { month };
        compared.forEach((b) => {
          const d = byBuilding[b.name];
          pt[b.name] = d ? Math.round(d.total / d.count) : null;
        });
        return pt;
      });
  }, [compared, useSqft]);

  // ── Volume chart ──────────────────────────────────────────────────────────
  const volumeData = useMemo(() => {
    if (!compared) return [];
    const monthMap = {};
    compared.forEach((b) => {
      b.txns.forEach((t) => {
        const ym = t.instance_date.slice(0, 7);
        if (!monthMap[ym]) monthMap[ym] = {};
        monthMap[ym][b.name] = (monthMap[ym][b.name] || 0) + 1;
      });
    });
    return Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, byBuilding]) => {
        const pt = { month };
        compared.forEach((b) => { pt[b.name] = byBuilding[b.name] || 0; });
        return pt;
      });
  }, [compared]);

  // ── Bedroom breakdown ─────────────────────────────────────────────────────
  const bedroomData = useMemo(() => {
    if (!compared) return [];
    const types = ['Studio', '1 B/R', '2 B/R', '3 B/R', '4 B/R', '5 B/R+'];
    return types.map((br) => {
      const pt = { br };
      compared.forEach((b) => {
        const filtered = b.txns.filter((t) => t.rooms_en === br);
        pt[b.name] = filtered.length
          ? Math.round(filtered.reduce((s, t) => s + pricePerUnit(t.meter_sale_price, useSqft), 0) / filtered.length)
          : null;
      });
      return pt;
    }).filter((pt) => compared.some((b) => pt[b.name] !== null));
  }, [compared, useSqft]);

  const selectedCount = [b1, b2, b3].filter(Boolean).length;

  return (
    <div className="comp-page">
      <div className="main-content" style={{ overflow: 'auto' }}>
        <header className="main-header">
          <div>
            <h1 className="main-title">Compare Buildings</h1>
            <p className="main-subtitle">Side-by-side analysis across up to 3 buildings</p>
          </div>
        </header>

        {/* Selectors */}
        <div className="chart-card">
          <div className="comp-selectors">
            <BuildingSelect label="Building 1" value={b1} onChange={setB1} />
            <BuildingSelect label="Building 2" value={b2} onChange={setB2} />
            <BuildingSelect label="Building 3" value={b3} onChange={setB3} />
          </div>
          <div className="comp-controls">
            <div style={{ minWidth: 160 }}>
              <p className="filter-label">Bedrooms</p>
              <select
                className="filter-select"
                value={bedroom}
                onChange={(e) => setBedroom(e.target.value)}
              >
                {BEDROOMS_OPTIONS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <button
              className="run-btn"
              style={{ alignSelf: 'flex-end', minWidth: 140 }}
              onClick={runComparison}
              disabled={selectedCount < 2}
            >
              Compare
            </button>
          </div>
          {selectedCount < 2 && (
            <p className="filter-label" style={{ marginTop: 10 }}>
              Select at least 2 buildings to compare.
            </p>
          )}
        </div>

        {compared && (
          <>
            {/* KPI table */}
            <div className="chart-card">
              <h3 className="chart-title">Summary Comparison</h3>
              <div style={{ overflowX: 'auto' }}>
                <table className="comp-table">
                  <thead>
                    <tr>
                      <th>Metric</th>
                      {compared.map((b, i) => (
                        <th key={b.name} style={{ color: b.color }}>{b.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {kpiRows.map((row) => (
                      <tr key={row.label}>
                        <td className="comp-row-label">{row.label}</td>
                        {row.values.map((v, i) => (
                          <td
                            key={i}
                            className={v !== null && v === row.best ? 'comp-best' : ''}
                          >
                            {v !== null ? row.fmt(v) : '—'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Price dist overlay */}
            <div className="charts-grid">
              <div className="chart-card">
                <h3 className="chart-title">{`Price per ${unit} — Distribution`}</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={distOverlayData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2d333b" />
                    <XAxis dataKey="label" tick={{ fill: '#8B949E', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#8B949E', fontSize: 11 }} allowDecimals={false} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    {compared.map((b) => (
                      <Bar key={b.name} dataKey={b.name} fill={b.color} radius={[3, 3, 0, 0]} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-card">
                <h3 className="chart-title">{`Avg Price / ${unit} Over Time`}</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={trendData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2d333b" />
                    <XAxis dataKey="month" tick={{ fill: '#8B949E', fontSize: 10 }} />
                    <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fill: '#8B949E', fontSize: 11 }} width={55} />
                    <Tooltip
                      formatter={(v) => (v ? [`AED ${fmtPrice(v)}`, ''] : ['—', ''])}
                      contentStyle={TOOLTIP_STYLE}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    {compared.map((b) => (
                      <Line
                        key={b.name}
                        type="monotone"
                        dataKey={b.name}
                        stroke={b.color}
                        strokeWidth={2}
                        dot={{ fill: b.color, r: 3 }}
                        connectNulls
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Volume + Bedroom breakdown */}
            <div className="charts-grid">
              <div className="chart-card">
                <h3 className="chart-title">Transaction Volume by Month</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={volumeData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2d333b" />
                    <XAxis dataKey="month" tick={{ fill: '#8B949E', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#8B949E', fontSize: 11 }} allowDecimals={false} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    {compared.map((b) => (
                      <Bar key={b.name} dataKey={b.name} fill={b.color} radius={[3, 3, 0, 0]} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-card">
                <h3 className="chart-title">{`Avg Price / ${unit} by Bedroom Type`}</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={bedroomData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2d333b" />
                    <XAxis dataKey="br" tick={{ fill: '#8B949E', fontSize: 11 }} />
                    <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fill: '#8B949E', fontSize: 11 }} width={55} />
                    <Tooltip
                      formatter={(v) => (v !== null ? [`AED ${fmtPrice(v)}`, ''] : ['—', ''])}
                      contentStyle={TOOLTIP_STYLE}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    {compared.map((b) => (
                      <Bar key={b.name} dataKey={b.name} fill={b.color} radius={[3, 3, 0, 0]} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
