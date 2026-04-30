import { useState, useEffect } from 'react';
import './App.css';
import FilterPanel from './components/FilterPanel';
import KPICards from './components/KPICards';
import Charts from './components/Charts';
import Recommendations from './components/Recommendations';
import { fetchTransactions } from './api/dataDubai';

const DEFAULT_FILTERS = {
  area: 'All',
  propertyType: 'All',
  bedrooms: 'All',
  minPrice: '',
  maxPrice: '',
  dateFrom: '',
  dateTo: '',
  regType: 'All',
  transGroup: 'All',
};

export default function App() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  async function runAnalysis(currentFilters) {
    setLoading(true);
    try {
      const result = await fetchTransactions(currentFilters);
      setData(result);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    runAnalysis(DEFAULT_FILTERS);
  }, []);

  return (
    <div className="app-layout">
      <FilterPanel
        filters={filters}
        onChange={setFilters}
        onRun={() => runAnalysis(filters)}
        loading={loading}
      />

      <main className="main-content">
        <header className="main-header">
          <div>
            <h1 className="main-title">Dubai Real Estate Analyser</h1>
            <p className="main-subtitle">Transaction intelligence powered by DLD open data</p>
          </div>
          {loading && <div className="loading-badge">Fetching data…</div>}
        </header>

        <KPICards data={data} />
        <Charts data={data} />
        <Recommendations data={data} />
      </main>
    </div>
  );
}
