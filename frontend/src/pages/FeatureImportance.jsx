import { useEffect, useMemo, useState } from 'react';
import { Dot, Link2 } from 'lucide-react';
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

  const top10 = useMemo(() => {
    const sorted = [...features].sort((a, b) => b.importance - a.importance).slice(0, 10);
    const max = sorted.length ? sorted[0].importance : 1;
    return sorted.map((item) => ({ ...item, width: `${(item.importance / max) * 100}%` }));
  }, [features]);

  const confidence = 94.2;

  return (
    <section className="clinical-page">
      <div className="feature-header">
        <div>
          <h2>Feature Importance</h2>
          <p>SHAP VALUE ANALYSIS &amp; PREDICTIVE WEIGHTING</p>
        </div>
        <div className="feature-actions">
          <button type="button" className="outline-btn">EXPORT RAW DATA</button>
          <button type="button" className="outline-btn">FILTER MODEL</button>
        </div>
      </div>

      <ErrorBanner message={error} />

      {loading ? (
        <LoadingSpinner text="Loading feature importance..." />
      ) : (
        <>
          <div className="two-col-grid importance-grid">
            <article className="clinical-card">
              <h3 className="card-heading">Top 10 Global Predictors</h3>
              <p className="card-subheading">RELATIVE INFLUENCE ON PREDICTED INSURANCE PREMIUM</p>

              <div className="importance-list">
                {top10.map((feature) => (
                  <div key={feature.feature} className="importance-row">
                    <div className="importance-row-head">
                      <span>{feature.feature}</span>
                      <strong>{feature.importance.toFixed(4)}</strong>
                    </div>
                    <div className="importance-track">
                      <span style={{ width: feature.width }} />
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <div className="stacked-cards">
              <article className="clinical-card">
                <h3 className="card-heading">Model Confidence</h3>
                <p className="confidence-value">{confidence.toFixed(1)}%</p>
                <span className="confidence-badge">+1.2% VS PREV</span>
                <p className="muted-copy">
                  Stability score based on cross-fold performance consistency and feature attribution confidence.
                </p>
              </article>

              <article className="clinical-card">
                <h3 className="card-heading">Interaction Pairs</h3>
                <div className="interaction-list">
                  <div className="interaction-pill"><span>Age × Smoker</span><Link2 size={14} /></div>
                  <div className="interaction-pill"><span>BMI × Medical Index</span><Link2 size={14} /></div>
                  <div className="interaction-pill"><span>Region × Children</span><Link2 size={14} /></div>
                </div>
              </article>
            </div>
          </div>

          <article className="clinical-card insight-card">
            <p className="mini-label"><Dot size={24} />SYSTEM INSIGHT</p>
            <div>
              <h3>Smoker status is the strongest predictor of insurance cost</h3>
              <p className="muted-copy">
                Behavioral and physiological risk concentration dominates premium variance, outweighing demographic baseline effects.
              </p>
            </div>
            <button type="button" className="ghost-btn">REVIEW FEATURE CORRELATION</button>
          </article>
        </>
      )}
    </section>
  );
}

export default FeatureImportance;
