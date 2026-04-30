import { useState, useEffect } from 'react';
import FilterPanel from '../components/FilterPanel';
import KPICards from '../components/KPICards';
import Charts from '../components/Charts';
import Recommendations from '../components/Recommendations';
import PriceDistribution from '../components/PriceDistribution';
import BuildingDeepDive from '../components/BuildingDeepDive';
import { fetchTransactions } from '../api/dataDubai';

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

export default function AnalysisPage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [useSqft, setUseSqft] = useState(true);

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
        useSqft={useSqft}
        onToggleUnit={() => setUseSqft((v) => !v)}
      />

      <main className="main-content">
        <header className="main-header">
          <div>
            <h1 className="main-title">Dubai Real Estate Analyser</h1>
            <p className="main-subtitle">Transaction intelligence powered by DLD open data</p>
          </div>
          {loading && <div className="loading-badge">Fetching data…</div>}
        </header>

        <KPICards data={data} useSqft={useSqft} />
        <Charts data={data} useSqft={useSqft} />
        <PriceDistribution data={data} useSqft={useSqft} />
        <BuildingDeepDive data={data} useSqft={useSqft} />
        <Recommendations data={data} useSqft={useSqft} />
      </main>
    </div>
  );
}
