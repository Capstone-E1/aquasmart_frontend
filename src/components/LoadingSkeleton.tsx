interface LoadingSkeletonProps {
  variant?: 'card' | 'table' | 'chart' | 'page';
  rows?: number;
}

export function LoadingSkeleton({ variant = 'card', rows = 1 }: LoadingSkeletonProps) {
  
  if (variant === 'card') {
    return (
      <div className="bg-primary-light/50 backdrop-blur-sm rounded-xl border border-slate-600 p-6 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
            <div className="h-4 bg-slate-600 rounded w-20"></div>
          </div>
          <div className="w-4 h-4 bg-slate-600 rounded"></div>
        </div>
        
        <div className="h-8 bg-slate-600 rounded w-16 mb-2"></div>
        <div className="h-6 bg-slate-600 rounded w-24"></div>
      </div>
    );
  }

  if (variant === 'chart') {
    return (
      <div className="bg-primary-light/50 backdrop-blur-sm rounded-xl border border-slate-600 p-6 animate-pulse">
        <div className="h-6 bg-slate-600 rounded w-24 mb-4"></div>
        <div className="flex items-center justify-center">
          <div className="w-32 h-32 bg-slate-600 rounded-full"></div>
        </div>
        <div className="mt-4 text-center">
          <div className="h-4 bg-slate-600 rounded w-32 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className="bg-primary-light/50 backdrop-blur-sm rounded-xl border border-slate-600 p-6 animate-pulse">
        <div className="flex gap-4 mb-4 pb-3 border-b border-slate-600">
          {Array.from({ length: 7 }, (_, i) => (
            <div key={i} className="h-4 bg-slate-600 rounded flex-1"></div>
          ))}
        </div>
        
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="flex gap-4 mb-3">
            {Array.from({ length: 7 }, (_, j) => (
              <div key={j} className="h-4 bg-slate-600 rounded flex-1"></div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'page') {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="space-y-2">
          <div className="h-8 bg-slate-600 rounded w-48"></div>
          <div className="h-4 bg-slate-600 rounded w-64"></div>
        </div>
        
        <div className="bg-primary-light/50 backdrop-blur-sm rounded-xl border border-slate-600 p-6">
          <div className="space-y-4">
            <div className="h-6 bg-slate-600 rounded w-32"></div>
            <div className="h-32 bg-slate-600 rounded"></div>
            <div className="flex gap-4">
              <div className="h-4 bg-slate-600 rounded flex-1"></div>
              <div className="h-4 bg-slate-600 rounded flex-1"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
