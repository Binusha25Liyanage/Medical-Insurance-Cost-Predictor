function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="loading-wrap" role="status" aria-live="polite" aria-busy="true">
      <div className="spinner" />
      <p className="loading-text">{text}</p>
    </div>
  );
}

export default LoadingSpinner;
