import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import api from '../api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBanner from '../components/ErrorBanner';

function EDA() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEda = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get('/eda');
        setData(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load EDA statistics.');
      } finally {
        setLoading(false);
      }
    };

    fetchEda();
  }, []);

  const smokerData = useMemo(() => {
    if (!data?.smoker_vs_non_smoker_avg_charges) return [];
    return Object.entries(data.smoker_vs_non_smoker_avg_charges).map(([group, value]) => ({
      group,
      avgCharges: Number(value.toFixed(2))
    }));
  }, [data]);

  const regionData = useMemo(() => {
    if (!data?.charges_by_region) return [];
    return Object.entries(data.charges_by_region).map(([region, value]) => ({
      region,
      avgCharges: Number(value.toFixed(2))
    }));
  }, [data]);

  const corrCols = data?.correlation_matrix ? Object.keys(data.correlation_matrix) : [];

  return (
    <section>
      <h1 className="page-title">Exploratory Data Analysis</h1>
      <ErrorBanner message={error} />

      {loading ? (
        <LoadingSpinner text="Calculating EDA statistics..." />
      ) : (
        <>
          <article className="panel">
            <h2>Summary Statistics</h2>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Feature</th>
                    <th>Mean</th>
                    <th>Median</th>
                    <th>Std Dev</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(data.basic_stats).map(([feature, stats]) => (
                    <tr key={feature}>
                      <td>{feature}</td>
                      <td>{stats.mean.toFixed(2)}</td>
                      <td>{stats.median.toFixed(2)}</td>
                      <td>{stats.std.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <div className="chart-grid">
            <article className="panel">
              <h2>Average Charges - Smoker vs Non-Smoker</h2>
              <div className="chart-box">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={smokerData}>
                    <CartesianGrid stroke="#3A3A3A" />
                    <XAxis dataKey="group" stroke="#F5F5F5" />
                    <YAxis stroke="#F5F5F5" />
                    <Tooltip />
                    <Bar dataKey="avgCharges" fill="#7B0D1E" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="panel">
              <h2>Average Charges by Region</h2>
              <div className="chart-box">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={regionData}>
                    <CartesianGrid stroke="#3A3A3A" />
                    <XAxis dataKey="region" stroke="#F5F5F5" />
                    <YAxis stroke="#F5F5F5" />
                    <Tooltip />
                    <Bar dataKey="avgCharges" fill="#7B0D1E" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>
          </div>

          <article className="panel">
            <h2>Correlation Heatmap</h2>
            <div className="heatmap-grid" style={{ gridTemplateColumns: `repeat(${corrCols.length + 1}, minmax(60px, 1fr))` }}>
              <div className="heatmap-header" />
              {corrCols.map((col) => (
                <div key={`h-${col}`} className="heatmap-header">{col}</div>
              ))}

              {corrCols.map((row) => (
                <>
                  <div key={`r-${row}`} className="heatmap-header">{row}</div>
                  {corrCols.map((col) => {
                    const val = data.correlation_matrix[row][col];
                    const alpha = Math.min(1, Math.abs(val));
                    const bg = `rgba(123, 13, 30, ${0.2 + alpha * 0.8})`;
                    return (
                      <div key={`${row}-${col}`} className="heatmap-cell" style={{ backgroundColor: bg }}>
                        {val.toFixed(2)}
                      </div>
                    );
                  })}
                </>
              ))}
            </div>
          </article>
        </>
      )}
    </section>
  );
}

export default EDA;
