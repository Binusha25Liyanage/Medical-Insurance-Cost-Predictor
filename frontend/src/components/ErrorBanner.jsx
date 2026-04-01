function ErrorBanner({ message }) {
  if (!message) return null;

  return (
    <div className="error-banner" role="alert" aria-live="assertive">
      {message}
    </div>
  );
}

export default ErrorBanner;
