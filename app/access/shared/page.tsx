import { Suspense } from 'react';
import SharedPageContent from './SharedPageContent';

export default function Page() {
  return (
    <Suspense fallback={
      <div className="screen-container">
        <div className="content-wrapper">
          <div className="spinner"></div>
        </div>
      </div>
    }>
      <SharedPageContent />
    </Suspense>
  );
}