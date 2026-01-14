'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Error Occurred</h2>
        <p className="text-red-600 mb-4">{error.message}</p>
        <button onClick={reset}>Try again</button>
      </div>
    </div>
  );
}