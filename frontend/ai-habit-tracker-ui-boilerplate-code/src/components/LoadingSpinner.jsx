export default function LoadingSpinner({ full = false, size = 24 }) {
  const spinner = (
    <div
      className="animate-spin rounded-full border-2 border-ink-200 border-t-brand-600"
      style={{ width: size, height: size }}
    />
  );
  if (!full) return spinner;
  return (
    <div className="flex items-center justify-center min-h-screen">
      {spinner}
    </div>
  );
}
