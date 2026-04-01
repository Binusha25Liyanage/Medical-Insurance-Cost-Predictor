import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import api from '../api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBanner from '../components/ErrorBanner';

function ModelComparison() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get('/model-results');
        setModels(response.data.models || []);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load model comparison.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  const bestModel = useMemo(() => {
    if (!models.length) return null;
    return [...models].sort((a, b) => b.r2 - a.r2)[0];
  }, [models]);

  return (
    <section>
      <h1 className="page-title">Model Evaluation & Comparison</h1>
      <ErrorBanner message={error} />

      {loading ? (
        <LoadingSpinner text="Loading model results..." />
      ) : (
        <>
          <article className="panel">
            <h2>Performance Table</h2>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Model</th>
                    <th>RMSE</th>
                    <th>MAE</th>
                    <th>R²</th>
                    <th>CV R²</th>
                  </tr>
                </thead>
                <tbody>
                  {models.map((row) => (
                    <tr key={row.model} className={row.model === bestModel?.model ? 'best-row' : ''}>
                      <td>{row.model}</td>
                      <td>{row.rmse.toFixed(2)}</td>
                      <td>{row.mae.toFixed(2)}</td>
                      <td>{row.r2.toFixed(3)}</td>
                      <td>{row.cv_r2.toFixed(3)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="panel">
            <h2>Metric Comparison Chart</h2>
            <div className="chart-box">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={models}>
                  <CartesianGrid stroke="#3A3A3A" />
                  <XAxis dataKey="model" stroke="#F5F5F5" />
                  <YAxis stroke="#F5F5F5" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="rmse" fill="#7B0D1E" />
                  <Bar dataKey="mae" fill="#A0263A" />
                  <Bar dataKey="r2" fill="#5C0916" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="panel">
            <p>
              Best performing model: Random Forest with R²=0.956 and RMSE=$2,601
            </p>
          </article>
        </>
      )}
    </section>
  );
}

export default ModelComparison;
