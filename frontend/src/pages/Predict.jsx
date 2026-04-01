import { useState } from 'react';
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
    <section>
      <h1 className="page-title">Predict Your Insurance Cost</h1>
      <ErrorBanner message={error} />

      <article className="panel">
        <form className="predict-form" onSubmit={onSubmit}>
          <label>
            Age
            <input name="age" type="number" min="1" max="100" value={form.age} onChange={updateForm} required />
          </label>

          <label>
            Sex
            <select name="sex" value={form.sex} onChange={updateForm} required>
              <option value="male">male</option>
              <option value="female">female</option>
            </select>
          </label>

          <label>
            BMI
            <input name="bmi" type="number" min="10" max="60" step="0.1" value={form.bmi} onChange={updateForm} required />
          </label>

          <label>
            Children
            <input name="children" type="number" min="0" max="10" value={form.children} onChange={updateForm} required />
          </label>

          <label>
            Smoker
            <select name="smoker" value={form.smoker} onChange={updateForm} required>
              <option value="yes">yes</option>
              <option value="no">no</option>
            </select>
          </label>

          <label>
            Region
            <select name="region" value={form.region} onChange={updateForm} required>
              <option value="southeast">southeast</option>
              <option value="southwest">southwest</option>
              <option value="northeast">northeast</option>
              <option value="northwest">northwest</option>
            </select>
          </label>

          <button className="btn-primary" type="submit" disabled={loading}>
            Predict Cost
          </button>
        </form>
      </article>

      {loading && <LoadingSpinner text="Predicting insurance cost..." />}

      {result && (
        <article className="result-card">
          <h2>Estimated Annual Insurance Cost</h2>
          <p className="result-value">${result.predicted_charge.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="result-currency">Currency: {result.currency}</p>
          <div className="result-inputs">
            {Object.entries(result.inputs).map(([key, value]) => (
              <span key={key}>{key}: {String(value)}</span>
            ))}
          </div>
        </article>
      )}
    </section>
  );
}

export default Predict;
