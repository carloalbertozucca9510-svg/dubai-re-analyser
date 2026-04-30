const AREAS = ['All Areas', 'Downtown Dubai', 'Dubai Marina', 'JVC', 'Business Bay', 'Palm Jumeirah'];
const PROPERTY_TYPES = ['All', 'Apartment', 'Villa'];
const BEDROOMS = ['All', 'Studio', '1 B/R', '2 B/R', '3 B/R', '4 B/R', '5 B/R+'];
const REG_TYPES = ['All', 'Off-Plan', 'Ready'];
const TRANS_GROUPS = ['All', 'Sales', 'Mortgage'];

export default function FilterPanel({ filters, onChange, onRun, loading }) {
  function set(key, value) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-logo">DXB</span>
        <h2 className="sidebar-title">RE Analyser</h2>
      </div>

      <div className="filter-section">
        <label className="filter-label">Area</label>
        <select
          className="filter-select"
          value={filters.area || 'All Areas'}
          onChange={(e) => set('area', e.target.value === 'All Areas' ? 'All' : e.target.value)}
        >
          {AREAS.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-section">
        <label className="filter-label">Property Type</label>
        <select
          className="filter-select"
          value={filters.propertyType || 'All'}
          onChange={(e) => set('propertyType', e.target.value)}
        >
          {PROPERTY_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-section">
        <label className="filter-label">Bedrooms</label>
        <select
          className="filter-select"
          value={filters.bedrooms || 'All'}
          onChange={(e) => set('bedrooms', e.target.value)}
        >
          {BEDROOMS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-section">
        <label className="filter-label">Market Type</label>
        <select
          className="filter-select"
          value={filters.regType || 'All'}
          onChange={(e) => set('regType', e.target.value)}
        >
          {REG_TYPES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-section">
        <label className="filter-label">Transaction Type</label>
        <select
          className="filter-select"
          value={filters.transGroup || 'All'}
          onChange={(e) => set('transGroup', e.target.value)}
        >
          {TRANS_GROUPS.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-section">
        <label className="filter-label">Min Price (AED)</label>
        <input
          className="filter-input"
          type="number"
          placeholder="e.g. 500000"
          value={filters.minPrice || ''}
          onChange={(e) => set('minPrice', e.target.value)}
        />
      </div>

      <div className="filter-section">
        <label className="filter-label">Max Price (AED)</label>
        <input
          className="filter-input"
          type="number"
          placeholder="e.g. 5000000"
          value={filters.maxPrice || ''}
          onChange={(e) => set('maxPrice', e.target.value)}
        />
      </div>

      <div className="filter-section">
        <label className="filter-label">Date From</label>
        <input
          className="filter-input"
          type="date"
          value={filters.dateFrom || ''}
          onChange={(e) => set('dateFrom', e.target.value)}
        />
      </div>

      <div className="filter-section">
        <label className="filter-label">Date To</label>
        <input
          className="filter-input"
          type="date"
          value={filters.dateTo || ''}
          onChange={(e) => set('dateTo', e.target.value)}
        />
      </div>

      <button className="run-btn" onClick={onRun} disabled={loading}>
        {loading ? 'Analysing…' : 'Run Analysis'}
      </button>
    </aside>
  );
}
