import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import api from '../api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBanner from '../components/ErrorBanner';

function FeatureImportance() {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchImportance = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get('/feature-importance');
        setFeatures(response.data.feature_importance || []);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load feature importance.');
      } finally {
        setLoading(false);
      }
    };

    fetchImportance();
  }, []);

  const top10 = useMemo(() => features.slice(0, 10).reverse(), [features]);

  return (
    <section>
      <h1 className="page-title">Feature Importance (Random Forest)</h1>
      <ErrorBanner message={error} />

      {loading ? (
        <LoadingSpinner text="Loading feature importance..." />
      ) : (
        <>
          <article className="panel">
            <div className="chart-box">
              <ResponsiveContainer width="100%" height={420}>
                <BarChart data={top10} layout="vertical">
                  <CartesianGrid stroke="#3A3A3A" />
                  <XAxis type="number" stroke="#F5F5F5" />
                  <YAxis dataKey="feature" type="category" width={180} stroke="#F5F5F5" />
                  <Tooltip />
                  <Bar dataKey="importance" fill="#7B0D1E" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="panel">
            <p>
              Smoker status is the most influential feature, followed by BMI and age.
            </p>
          </article>
        </>
      )}
    </section>
  );
}

export default FeatureImportance;
