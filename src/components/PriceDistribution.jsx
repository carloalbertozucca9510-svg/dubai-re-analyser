import {
  ComposedChart,
  Bar,
  ReferenceLine,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { pricePerUnit, unitLabel, fmtPrice, percentile, buildHistogram } from '../utils/units.js';

const GOLD = '#C9A96E';
const TOOLTIP_STYLE = { background: '#161B22', border: '1px solid #30363d', color: '#fff' };

function computePercentiles(values) {
  return {
    min: values.length ? Math.min(...values) : 0,
    p25: percentile(values, 25),
    median: percentile(values, 50),
    p75: percentile(values, 75),
    p90: percentile(values, 90),
    max: values.length ? Math.max(...values) : 0,
  };
}

function findBinLabel(value, histData) {
  // Find which bin label best represents this percentile value (for ReferenceLine x)
  // histData is [{label, count}], we pick the rightmost bin where the value could fall
  // We use index-based mapping: approximate by position in sorted bins
  if (!histData.length) return null;
  const binCount = histData.length;
  // Use the bin at proportional position
  return histData[Math.min(Math.floor((value / (histData.length + 1)) * binCount), binCount - 1)]?.label;
}

function PercentileLabel({ viewBox, value }) {
  const { x, y } = viewBox;
  return (
    <text x={x + 4} y={y - 6} fill="#fff" fontSize={10} fontWeight={600}>
      {value}
    </text>
  );
}

function Histogram({ title, values, useSqft }) {
  if (!values || values.length === 0) {
    return (
      <div className="chart-card">
        <h3 className="chart-title">{title}</h3>
        <p className="chart-empty">No data.</p>
      </div>
    );
  }

  const histData = buildHistogram(values, useSqft);
  const pcts = computePercentiles(values);

  // Map percentile value to a bin label for ReferenceLine
  function toBinLabel(val) {
    const bins = histData;
    // Find the bin containing this value by iterating
    // bins labels are like "<750", "750-1000", etc.
    // Simpler: find bin index by proportion
    const sorted = [...values].sort((a, b) => a - b);
    const rank = sorted.findIndex((v) => v >= val);
    const ratio = rank < 0 ? 1 : rank / sorted.length;
    const idx = Math.min(Math.floor(ratio * bins.length), bins.length - 1);
    return bins[idx]?.label;
  }

  const p25Label = toBinLabel(pcts.p25);
  const medLabel = toBinLabel(pcts.median);
  const p75Label = toBinLabel(pcts.p75);
  const p90Label = toBinLabel(pcts.p90);

  const unit = unitLabel(useSqft);

  return (
    <div className="chart-card">
      <h3 className="chart-title">{title}</h3>
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={histData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2d333b" />
          <XAxis dataKey="label" tick={{ fill: '#8B949E', fontSize: 10 }} />
          <YAxis tick={{ fill: '#8B949E', fontSize: 11 }} allowDecimals={false} />
          <Tooltip
            formatter={(v) => [v, 'Transactions']}
            contentStyle={TOOLTIP_STYLE}
          />
          <Bar dataKey="count" fill={GOLD} radius={[4, 4, 0, 0]} />
          {p25Label && (
            <ReferenceLine x={p25Label} stroke="#fff" strokeDasharray="4 2" label={<PercentileLabel value="P25" />} />
          )}
          {medLabel && medLabel !== p25Label && (
            <ReferenceLine x={medLabel} stroke="#fff" strokeDasharray="4 2" label={<PercentileLabel value="P50" />} />
          )}
          {p75Label && p75Label !== medLabel && (
            <ReferenceLine x={p75Label} stroke="#fff" strokeDasharray="4 2" label={<PercentileLabel value="P75" />} />
          )}
          {p90Label && p90Label !== p75Label && (
            <ReferenceLine x={p90Label} stroke="#aaa" strokeDasharray="4 2" label={<PercentileLabel value="P90" />} />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

function PercentilesTable({ label, values, useSqft, isPrice }) {
  const pcts = computePercentiles(values);
  const unit = unitLabel(useSqft);
  const rows = [
    { name: 'Min', value: pcts.min },
    { name: 'P25', value: pcts.p25 },
    { name: 'Median', value: pcts.median },
    { name: 'P75', value: pcts.p75 },
    { name: 'P90', value: pcts.p90 },
    { name: 'Max', value: pcts.max },
  ];

  return (
    <div>
      <p className="dist-table-label">{label}</p>
      <table className="dist-table">
        <thead>
          <tr>
            <th>Percentile</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name}>
              <td>{r.name}</td>
              <td>AED {fmtPrice(r.value)}{isPrice ? '' : `/${unit}`}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PriceDistribution({ data, useSqft }) {
  if (!data || data.length === 0) {
    return (
      <div className="dist-section">
        <h2 className="section-title">Price Distribution</h2>
        <div className="chart-card">
          <p className="chart-empty">No data — run an analysis first.</p>
        </div>
      </div>
    );
  }

  const unit = unitLabel(useSqft);
  const salePricePerUnit = data.map((t) => pricePerUnit(t.meter_sale_price, useSqft));
  const totalPrices = data.map((t) => t.actual_worth);

  const rentValues = data.map((t) => t.rent_value).filter((v) => v > 0);
  const rentPerUnit = data
    .filter((t) => t.meter_rent_price > 0)
    .map((t) => pricePerUnit(t.meter_rent_price, useSqft));

  const hasRent = rentValues.length > 0;

  return (
    <div className="dist-section">
      <h2 className="section-title">Price Distribution</h2>

      <div className="charts-grid">
        <Histogram
          title={`Price per ${unit} — Distribution`}
          values={salePricePerUnit}
          useSqft={useSqft}
        />
        <div className="chart-card">
          <h3 className="chart-title">Percentile Summary</h3>
          <div className="dist-tables">
            <PercentilesTable
              label={`Price per ${unit}`}
              values={salePricePerUnit}
              useSqft={useSqft}
              isPrice={false}
            />
            <PercentilesTable
              label="Total Price"
              values={totalPrices}
              useSqft={useSqft}
              isPrice={true}
            />
          </div>
        </div>
      </div>

      {hasRent && (
        <>
          <h2 className="section-title" style={{ marginTop: 8 }}>Rent Distribution</h2>
          <div className="charts-grid">
            <Histogram
              title={`Rent per ${unit} — Distribution`}
              values={rentPerUnit}
              useSqft={useSqft}
            />
            <div className="chart-card">
              <h3 className="chart-title">Rent Percentile Summary</h3>
              <div className="dist-tables">
                <PercentilesTable
                  label={`Rent per ${unit}`}
                  values={rentPerUnit}
                  useSqft={useSqft}
                  isPrice={false}
                />
                <PercentilesTable
                  label="Annual Rent"
                  values={rentValues}
                  useSqft={useSqft}
                  isPrice={true}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
