'use client'
import { useError } from '../providers/errorContextProvider';
import { useRouter } from 'next/navigation';

export default function ErrorPage() {
  const router = useRouter();
  const { clearError } = useError();
  
  // Get error message from URL params
  const searchParams = typeof window !== 'undefined' 
    ? new URLSearchParams(window.location.search)
    : new URLSearchParams();
  
  const errorMessage = searchParams.get('message') || 'An unexpected error occurred';

  const handleGoBack = () => {
    clearError();
    router.back();
  };

  const handleGoHome = () => {
    clearError();
    router.push('/');
  };

  return (
    <div className="screen-container">
      <div className="content-wrapper">
        <div className="space-y-8">
          {/* Error Icon */}
          <div className="text-center">
            <div className="icon-lg">⚠️</div>
            <h1 className="section-title">Error Occurred</h1>
          </div>

          {/* Error Details */}
          <div className="card-lg space-y-4">
            <div>
              <label className="form-label">Error Details</label>
              <div className="display-field-mono">
                {errorMessage}
              </div>
            </div>

            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Something went wrong while processing your request. You can try going back and attempting the action again, or return to the home page.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="btn-group">
            <button onClick={handleGoBack} className="btn-secondary btn-flex">
              Go Back
            </button>
            <button onClick={handleGoHome} className="btn-primary btn-flex">
              Go Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}