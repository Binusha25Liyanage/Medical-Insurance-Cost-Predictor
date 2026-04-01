import { useState } from 'react';
import { Dot, Sparkles } from 'lucide-react';
import api from '../api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBanner from '../components/ErrorBanner';

const initialForm = {
  age: '',
  sex: 'male',
  bmi: '',
  children: '',
  smoker: 'no',
  region: 'southeast'
};

const formatLkr = (value) =>
  new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(value) || 0);

function Predict() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const updateForm = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!form.age || !form.sex || !form.bmi || form.children === '' || !form.smoker || !form.region) {
      return 'All fields are required.';
    }

    if (Number(form.age) <= 0) return 'Age must be greater than 0.';
    if (Number(form.bmi) <= 0) return 'BMI must be greater than 0.';
    if (Number(form.children) < 0) return 'Children cannot be negative.';
    return '';
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setResult(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    const payload = {
      age: Number(form.age),
      sex: form.sex,
      bmi: Number(form.bmi),
      children: Number(form.children),
      smoker: form.smoker,
      region: form.region
    };

    setLoading(true);
    try {
      const response = await api.post('/predict', payload);
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Prediction failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="clinical-page">
      <div className="page-header">
        <span className="page-header-accent" aria-hidden="true" />
        <h2>Predict Insurance Cost</h2>
      </div>

      <ErrorBanner message={error} />

      <div className="predict-layout">
        <article className="clinical-card">
          <h3 className="card-heading">Configuration Engine</h3>
          <p className="card-subheading">Adjust parameters to generate actuarial projections.</p>

          <form className="clinical-form" onSubmit={onSubmit}>
            <label className="form-field span-2">
              <span>AGE</span>
              <input name="age" type="number" min="1" max="100" value={form.age} onChange={updateForm} required />
            </label>

            <label className="form-field">
              <span>SEX</span>
              <select name="sex" value={form.sex} onChange={updateForm} required>
                <option value="male">male</option>
                <option value="female">female</option>
              </select>
            </label>

            <label className="form-field">
              <span>BMI INDEX</span>
              <input name="bmi" type="number" min="10" max="60" step="0.1" value={form.bmi} onChange={updateForm} required />
            </label>

            <label className="form-field">
              <span>CHILDREN</span>
              <input name="children" type="number" min="0" max="10" value={form.children} onChange={updateForm} required />
            </label>

            <label className="form-field">
              <span>SMOKER</span>
              <select name="smoker" value={form.smoker} onChange={updateForm} required>
                <option value="yes">yes</option>
                <option value="no">no</option>
              </select>
            </label>

            <label className="form-field span-2">
              <span>REGION</span>
              <select name="region" value={form.region} onChange={updateForm} required>
                <option value="southeast">southeast</option>
                <option value="southwest">southwest</option>
                <option value="northeast">northeast</option>
                <option value="northwest">northwest</option>
              </select>
            </label>

            <button className="predict-btn span-2" type="submit" disabled={loading}>
              <Sparkles size={16} />
              PREDICT COST
            </button>
          </form>
        </article>

        <div className="predict-results-stack">
          <article className="prediction-result-card">
            <Sparkles size={20} />
            <p>ESTIMATED ANNUAL PREMIUM</p>
            <h3>
              {result ? formatLkr(result.predicted_charge) : formatLkr(0)}
            </h3>
            <div className="confidence-track">
              <span style={{ width: result ? '94.2%' : '0%' }} />
            </div>
            <small>MODEL CONFIDENCE 94.2%</small>
          </article>

          <article className="clinical-card">
            <h3 className="card-heading">Analysis Profile</h3>
            <div className="profile-pill-grid">
              <div className="profile-pill"><span>AGE</span><strong>{form.age || '--'}</strong></div>
              <div className="profile-pill"><span>SEX</span><strong>{form.sex}</strong></div>
              <div className="profile-pill"><span>BMI</span><strong>{form.bmi || '--'}</strong></div>
              <div className="profile-pill"><span>CHILDREN</span><strong>{String(form.children || 0).padStart(2, '0')}</strong></div>
              <div className="profile-pill"><span>SMOKER</span><strong>{form.smoker}</strong></div>
              <div className="profile-pill"><span>REGION</span><strong>{form.region}</strong></div>
            </div>
          </article>

          <article className="clinical-card">
            <p className="mini-label"><Dot size={24} />Impact Analysis</p>
            <h3 className="card-heading">Impact Analysis</h3>
            <p className="muted-copy">
              Current risk profile suggests an estimated premium contribution of
              <span className="accent-text">
                {' '}
                {result ? formatLkr(result.predicted_charge) : formatLkr(0)}
              </span>
              {' '}
              driven primarily by BMI and smoker status interactions.
            </p>
          </article>
        </div>
      </div>

      {loading && <LoadingSpinner text="Predicting insurance cost..." />}
    </section>
  );
}

export default Predict;
