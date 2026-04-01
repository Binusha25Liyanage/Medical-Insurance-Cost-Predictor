import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowRightLeft, Binary, BrainCircuit, Database, FlaskConical, Microscope } from 'lucide-react';
import api from '../api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBanner from '../components/ErrorBanner';
import MetricCard from '../components/MetricCard';

const BEST_MODEL = {
  r2: 0.8805,
  rmse: 4306
};

const formatLkr = (value) =>
  new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    maximumFractionDigits: 0
  }).format(Number(value) || 0);

function Home() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOverview = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get('/dataset/overview');
        setOverview(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load dataset overview.');
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  return (
    <section className="clinical-page">
      <h1 className="hero-title">Insurance Cost Predictor</h1>
      <p className="hero-kicker">NIBM HNDSE25.1F/KU | Machine Learning CW1</p>
      <p className="hero-description">
        Intelligent actuarial analytics pipeline for population-scale medical premium forecasting,
        model governance, and prediction explainability.
      </p>

      <ErrorBanner message={error} />
      {loading ? (
        <LoadingSpinner text="Loading dashboard metrics..." />
      ) : (
        <div className="dashboard-metric-grid">
          <MetricCard
            label="TOTAL RECORDS"
            value={overview?.total_rows ?? '-'}
            icon={<Database size={14} />}
            subtitle="SYNTHETIC DATASET"
          />
          <MetricCard
            label="TOTAL FEATURES"
            value={overview?.total_columns ?? '-'}
            icon={<Binary size={14} />}
            subtitle="ENGINEERED ATTRIBUTES"
          />
          <MetricCard
            label="BEST MODEL R²"
            value={BEST_MODEL.r2.toFixed(4)}
            icon={<BrainCircuit size={14} />}
            subtitle="GENERALIZATION INDEX"
          />
          <MetricCard
            label="BEST RMSE"
            value={formatLkr(BEST_MODEL.rmse)}
            icon={<Microscope size={14} />}
            subtitle="VALIDATION ERROR"
          />
        </div>
      )}

      <article className="workflow-panel">
        <span className="outline-badge">SYSTEM INTELLIGENCE</span>
        <div className="workflow-content">
          <div>
            <h2>Comprehensive Analytical Workflow</h2>
            <p>
              Move from statistical profiling to model benchmarking, interpretability diagnostics,
              and live premium simulation through a unified clinical decision interface.
            </p>
          </div>
          <div className="bar-decor" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
        </div>
      </article>

      <div className="dashboard-nav-grid">
        <Link to="/eda" className="dashboard-nav-card">
          <FlaskConical size={18} />
          <span>EDA</span>
        </Link>
        <Link to="/model-comparison" className="dashboard-nav-card">
          <ArrowRightLeft size={18} />
          <span>Comparison</span>
        </Link>
        <Link to="/feature-importance" className="dashboard-nav-card">
          <BrainCircuit size={18} />
          <span>Importance</span>
        </Link>
        <Link to="/predict" className="dashboard-nav-card">
          <Microscope size={18} />
          <span>Predict</span>
        </Link>
      </div>
    </section>
  );
}

export default Home;
