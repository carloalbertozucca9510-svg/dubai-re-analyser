import { useState, useMemo } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { pricePerUnit, areaInUnit, unitLabel, fmtPrice, buildHistogram } from '../utils/units.js';
import {
  ComposedChart,
  Bar,
} from 'recharts';

const GOLD = '#C9A96E';
const TOOLTIP_STYLE = { background: '#161B22', border: '1px solid #30363d', color: '#fff', fontSize: 12 };

function fmtAED(v) {
  if (v >= 1000000) return `AED ${(v / 1000000).toFixed(2)}M`;
  if (v >= 1000) return `AED ${(v / 1000).toFixed(0)}K`;
  return `AED ${v}`;
}

function ScatterTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div style={{ ...TOOLTIP_STYLE, padding: '10px 14px', borderRadius: 6 }}>
      <p style={{ color: GOLD, fontWeight: 600, marginBottom: 4 }}>{d.date}</p>
      <p>Price: <strong>AED {fmtPrice(d.price)}</strong></p>
      <p>Area: <strong>{fmtPrice(d.displayArea)} {d.unit}</strong></p>
      <p>Price/{d.unit}: <strong>AED {fmtPrice(d.pricePerUnit)}</strong></p>
      <p>Bedrooms: <strong>{d.rooms}</strong></p>
    </div>
  );
}

const SORT_KEYS = { date: 'instance_date', bedrooms: 'rooms_en', area: 'procedure_area', price: 'actual_worth', ppu: 'meter_sale_price', yld: '_yield' };

export default function BuildingDeepDive({ data, useSqft }) {
  const [open, setOpen] = useState(true);
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [sortKey, setSortKey] = useState('date');
  const [sortDir, setSortDir] = useState('desc');

  const unit = unitLabel(useSqft);

  const buildings = useMemo(() => {
    const names = [...new Set(data.map((t) => t.building_name_en))].sort();
    return names;
  }, [data]);

  const buildingData = useMemo(() => {
    if (!selectedBuilding) return [];
    return data.filter((t) => t.building_name_en === selectedBuilding);
  }, [data, selectedBuilding]);

  const kpis = useMemo(() => {
    if (!buildingData.length) return null;
    const count = buildingData.length;
    const avgPrice = buildingData.reduce((s, t) => s + t.actual_worth, 0) / count;
    const avgPpu = buildingData.reduce((s, t) => s + pricePerUnit(t.meter_sale_price, useSqft), 0) / count;
    const avgYield = buildingData.reduce((s, t) => s + (t.rent_value / t.actual_worth) * 100, 0) / count;
    return { count, avgPrice, avgPpu, avgYield };
  }, [buildingData, useSqft]);

  const histData = useMemo(() => {
    const vals = buildingData.map((t) => pricePerUnit(t.meter_sale_price, useSqft));
    return buildHistogram(vals, useSqft);
  }, [buildingData, useSqft]);

  const scatterData = useMemo(() => {
    return buildingData.map((t) => ({
      displayArea: Math.round(areaInUnit(t.procedure_area, useSqft)),
      price: t.actual_worth,
      pricePerUnit: Math.round(pricePerUnit(t.meter_sale_price, useSqft)),
      date: t.instance_date,
      rooms: t.rooms_en,
      unit,
    }));
  }, [buildingData, useSqft, unit]);

  const sortedRows = useMemo(() => {
    const rows = buildingData.map((t) => ({
      ...t,
      _yield: (t.rent_value / t.actual_worth) * 100,
    }));
    const key = SORT_KEYS[sortKey] || 'instance_date';
    return [...rows].sort((a, b) => {
      const av = a[key];
      const bv = b[key];
      if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      return sortDir === 'asc' ? av - bv : bv - av;
    });
  }, [buildingData, sortKey, sortDir]);

  function toggleSort(key) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('desc'); }
  }

  function SortHeader({ label, k }) {
    const active = sortKey === k;
    return (
      <th
        className={`sortable-th${active ? ' sort-active' : ''}`}
        onClick={() => toggleSort(k)}
      >
        {label} {active ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
      </th>
    );
  }

  return (
    <div className="dive-section">
      <div className="section-header" onClick={() => setOpen((o) => !o)} style={{ cursor: 'pointer' }}>
        <h2 className="section-title" style={{ marginBottom: 0 }}>Building Deep Dive</h2>
        <span className="collapse-icon">{open ? '▲' : '▼'}</span>
      </div>

      {open && (
        <div className="dive-body">
          <div className="filter-section" style={{ maxWidth: 360 }}>
            <label className="filter-label">Select Building</label>
            <select
              className="filter-select"
              value={selectedBuilding}
              onChange={(e) => setSelectedBuilding(e.target.value)}
            >
              <option value="">— Select a building —</option>
              {buildings.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {selectedBuilding && kpis && (
            <>
              <div className="kpi-grid" style={{ marginTop: 16 }}>
                <div className="kpi-card">
                  <p className="kpi-title">Transactions</p>
                  <p className="kpi-value">{kpis.count}</p>
                </div>
                <div className="kpi-card">
                  <p className="kpi-title">Avg Price</p>
                  <p className="kpi-value">AED {fmtPrice(kpis.avgPrice)}</p>
                </div>
                <div className="kpi-card">
                  <p className="kpi-title">{`Avg Price / ${unit}`}</p>
                  <p className="kpi-value">AED {fmtPrice(kpis.avgPpu)}</p>
                </div>
                <div className="kpi-card">
                  <p className="kpi-title">Avg Gross Yield</p>
                  <p className="kpi-value">{kpis.avgYield.toFixed(2)}%</p>
                </div>
              </div>

              <div className="charts-grid" style={{ marginTop: 16 }}>
                <div className="chart-card">
                  <h3 className="chart-title">{`Price per ${unit} — Distribution`}</h3>
                  <ResponsiveContainer width="100%" height={240}>
                    <ComposedChart data={histData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2d333b" />
                      <XAxis dataKey="label" tick={{ fill: '#8B949E', fontSize: 10 }} />
                      <YAxis tick={{ fill: '#8B949E', fontSize: 11 }} allowDecimals={false} />
                      <Tooltip formatter={(v) => [v, 'Transactions']} contentStyle={TOOLTIP_STYLE} />
                      <Bar dataKey="count" fill={GOLD} radius={[4, 4, 0, 0]} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                <div className="chart-card">
                  <h3 className="chart-title">{`Area (${unit}) vs Total Price`}</h3>
                  <ResponsiveContainer width="100%" height={240}>
                    <ScatterChart margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2d333b" />
                      <XAxis
                        dataKey="displayArea"
                        name={unit}
                        type="number"
                        tick={{ fill: '#8B949E', fontSize: 11 }}
                        label={{ value: unit, position: 'insideBottom', offset: -2, fill: '#8B949E', fontSize: 11 }}
                      />
                      <YAxis
                        dataKey="price"
                        name="Price"
                        type="number"
                        tickFormatter={fmtAED}
                        tick={{ fill: '#8B949E', fontSize: 11 }}
                        width={80}
                      />
                      <Tooltip content={<ScatterTooltip />} />
                      <Scatter data={scatterData} fill={GOLD} opacity={0.85} />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="chart-card" style={{ marginTop: 16 }}>
                <h3 className="chart-title">Transactions</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table className="txn-table">
                    <thead>
                      <tr>
                        <SortHeader label="Date" k="date" />
                        <SortHeader label="Bedrooms" k="bedrooms" />
                        <SortHeader label={`Area (${unit})`} k="area" />
                        <SortHeader label="Price (AED)" k="price" />
                        <SortHeader label={`/${unit}`} k="ppu" />
                        <SortHeader label="Yield" k="yld" />
                      </tr>
                    </thead>
                    <tbody>
                      {sortedRows.map((t, i) => (
                        <tr key={t.transaction_id} className={i % 2 === 0 ? 'row-even' : 'row-odd'}>
                          <td>{t.instance_date}</td>
                          <td>{t.rooms_en}</td>
                          <td>{fmtPrice(areaInUnit(t.procedure_area, useSqft))}</td>
                          <td>AED {fmtPrice(t.actual_worth)}</td>
                          <td>AED {fmtPrice(pricePerUnit(t.meter_sale_price, useSqft))}</td>
                          <td>{((t.rent_value / t.actual_worth) * 100).toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {selectedBuilding && !kpis && (
            <p className="chart-empty" style={{ padding: '24px 0' }}>No transactions found for this building in the current filter.</p>
          )}
        </div>
      )}
    </div>
  );
}
