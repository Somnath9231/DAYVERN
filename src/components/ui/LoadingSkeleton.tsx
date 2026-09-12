'use client';

export function LoadingSkeleton({ 
  type = 'card', 
  count = 3 
}: { 
  type?: 'card' | 'bars' | 'text'; 
  count?: number; 
}) {
  return (
    <div className="space-y-4 animate-pulse" aria-busy="true" aria-label="Loading content...">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="rpg-panel p-5 space-y-3 bg-white border border-[#E8D6D9]">
          {type === 'card' && (
            <>
              <div className="flex justify-between items-center">
                <div className="h-4 bg-[#FFF5F6] rounded w-1/3" />
                <div className="h-4 bg-[#FFF5F6] rounded w-1/6" />
              </div>
              <div className="h-3 bg-[#FFF5F6] rounded w-full" />
              <div className="h-3 bg-[#FFF5F6] rounded w-2/3" />
              <div className="h-8 bg-[#FFF5F6] rounded w-full pt-2" />
            </>
          )}

          {type === 'bars' && (
            <div className="space-y-2">
              <div className="h-3 bg-[#FFF5F6] rounded w-1/4" />
              <div className="h-2 bg-[#FFF5F6] rounded w-full" />
            </div>
          )}

          {type === 'text' && (
            <div className="space-y-2">
              <div className="h-3 bg-[#FFF5F6] rounded w-full" />
              <div className="h-3 bg-[#FFF5F6] rounded w-5/6" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
