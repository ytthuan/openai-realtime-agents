import dynamic from 'next/dynamic';
import { ComponentType, Suspense } from 'react';

// Loading components
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
  </div>
);

const LoadingPlaceholder = ({ height = "200px" }: { height?: string }) => (
  <div className="flex items-center justify-center bg-gray-100 rounded-lg animate-pulse" style={{ height }}>
    <div className="text-gray-400">Loading...</div>
  </div>
);

// Dynamically imported components
export const DynamicTranscript = dynamic(() => import('./Transcript'), {
  loading: () => <LoadingPlaceholder height="400px" />,
  ssr: false,
});

export const DynamicEvents = dynamic(() => import('./Events'), {
  loading: () => <LoadingPlaceholder height="300px" />,
  ssr: false,
});

export const DynamicBottomToolbar = dynamic(() => import('./BottomToolbar'), {
  loading: () => <LoadingSpinner />,
  ssr: false,
});

export const DynamicGuardrailChip = dynamic(() => import('./GuardrailChip').then(mod => ({ default: mod.GuardrailChip })), {
  loading: () => <LoadingSpinner />,
  ssr: false,
});

// Wrapper component for Suspense boundary
export const LazyComponent = ({ 
  children, 
  fallback = <LoadingSpinner /> 
}: { 
  children: React.ReactNode; 
  fallback?: React.ReactNode;
}) => (
  <Suspense fallback={fallback}>
    {children}
  </Suspense>
);