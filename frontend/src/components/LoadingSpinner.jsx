function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="loading-wrap" role="status" aria-live="polite">
      <div className="spinner" />
      <p>{text}</p>
    </div>
  );
}

export default LoadingSpinner;
