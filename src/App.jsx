import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/NavBar';
import AnalysisPage from './pages/AnalysisPage';
import ComparisonPage from './pages/ComparisonPage';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-root">
        <NavBar />
        <div className="app-body">
          <Routes>
            <Route path="/" element={<AnalysisPage />} />
            <Route path="/compare" element={<ComparisonPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
