import React from 'react';

export const LoadingSkeleton = ({ rows = 3, columns = 4 }) => {
  return (
    <div className="w-full animate-pulse">
      <div className="h-10 bg-slate-200 rounded mb-4 w-full"></div>
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex space-x-4 mb-4">
          {[...Array(columns)].map((_, j) => (
            <div key={j} className="h-6 bg-slate-200 rounded w-full"></div>
          ))}
        </div>
      ))}
    </div>
  );
};

export const CardSkeleton = () => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 animate-pulse">
    <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
    <div className="h-8 bg-slate-200 rounded w-1/2"></div>
  </div>
);
