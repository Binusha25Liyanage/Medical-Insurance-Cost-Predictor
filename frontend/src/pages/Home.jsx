import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBanner from '../components/ErrorBanner';
import MetricCard from '../components/MetricCard';

const BEST_MODEL = {
  r2: 0.956,
  rmse: 2601
};

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
    <section>
      <h1 className="page-title">Insurance Cost Predictor</h1>
      <p className="page-subtitle">NIBM HNDSE25.1F/KU | Machine Learning CW1</p>

      <ErrorBanner message={error} />
      {loading ? (
        <LoadingSpinner text="Loading dashboard metrics..." />
      ) : (
        <div className="metric-grid">
          <MetricCard label="Total Records" value={overview?.total_rows ?? '-'} />
          <MetricCard label="Total Features" value={overview?.total_columns ?? '-'} />
          <MetricCard label="Best Model R²" value={BEST_MODEL.r2.toFixed(3)} />
          <MetricCard label="Best Model RMSE" value={`$${BEST_MODEL.rmse.toLocaleString()}`} />
        </div>
      )}

      <article className="panel">
        <h2>Project Overview</h2>
        <p>
          This dashboard presents a full machine learning workflow for predicting annual medical
          insurance costs using demographic and health-related attributes. It includes dataset
          exploration, model performance comparison, feature importance from Random Forest, and
          real-time prediction through a Flask API.
        </p>
      </article>

      <div className="quick-nav">
        <Link to="/eda" className="btn-primary">Go to EDA</Link>
        <Link to="/model-comparison" className="btn-primary">Model Comparison</Link>
        <Link to="/feature-importance" className="btn-primary">Feature Importance</Link>
        <Link to="/predict" className="btn-primary">Predict Cost</Link>
      </div>
    </section>
  );
}

export default Home;
