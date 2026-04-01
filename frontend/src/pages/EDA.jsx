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
    <section className="clinical-page">
      <div className="page-header">
        <span className="page-header-accent" aria-hidden="true" />
        <h2>Exploratory Data Analysis</h2>
      </div>
      <ErrorBanner message={error} />

      {loading ? (
        <LoadingSpinner text="Calculating EDA statistics..." />
      ) : (
        <>
          <article className="clinical-card">
            <h3 className="section-heading">Population Statistical Overview</h3>
            <div className="table-wrap clinical-table-wrap">
              <table className="clinical-table">
                <thead>
                  <tr>
                    <th>FEATURE</th>
                    <th>MEAN</th>
                    <th>MEDIAN</th>
                    <th>STD DEV</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(data.basic_stats).map(([feature, stats], index) => (
                    <tr key={feature} className={index % 2 === 0 ? 'row-even' : 'row-odd'}>
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

          <div className="two-col-grid">
            <article className="clinical-card">
              <h3 className="card-heading">AVG CHARGES BY SMOKING STATUS</h3>
              <div className="chart-box">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={smokerData}>
                    <CartesianGrid stroke="#3a3a3a" strokeDasharray="3 3" />
                    <XAxis dataKey="group" stroke="#FFFFFF" />
                    <YAxis stroke="#FFFFFF" />
                    <Tooltip />
                    <Bar dataKey="avgCharges" fill="#7B0D1E" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="clinical-card">
              <h3 className="card-heading">AVG CHARGES BY REGION</h3>
              <div className="chart-box">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={regionData}>
                    <CartesianGrid stroke="#3a3a3a" strokeDasharray="3 3" />
                    <XAxis dataKey="region" stroke="#FFFFFF" />
                    <YAxis stroke="#FFFFFF" />
                    <Tooltip />
                    <Bar dataKey="avgCharges" fill="#7B0D1E" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>
          </div>

          <article className="clinical-card">
            <h3 className="card-heading">FEATURE CORRELATION MATRIX</h3>
            <div
              className="heatmap-grid"
              style={{ gridTemplateColumns: `repeat(${corrCols.length + 1}, minmax(60px, 1fr))` }}
            >
              <div className="corr-label" />
              {corrCols.map((col) => (
                <div key={`h-${col}`} className="corr-label">{col}</div>
              ))}

              {corrCols.map((row) => (
                <div key={row} className="corr-row-group">
                  <div className="corr-label">{row}</div>
                  {corrCols.map((col) => {
                    const val = data.correlation_matrix[row][col];
                    const alpha = Math.min(1, Math.abs(val));
                    const bg = `rgba(123, 13, 30, ${0.12 + alpha * 0.88})`;
                    return (
                      <div key={`${row}-${col}`} className="heatmap-cell" style={{ backgroundColor: bg }}>
                        {val.toFixed(2)}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            <p className="corr-legend">LOW CORRELATION -------- STRONG CORRELATION</p>
          </article>
        </>
      )}
    </section>
  );
}

export default EDA;
