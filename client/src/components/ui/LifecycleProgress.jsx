import React from 'react';
import { Check } from 'lucide-react';

const stages = [
  'DRAFT',
  'INVITATIONS_SENT',
  'RSVP_OPEN',
  'ATTENDANCE_OPEN',
  'ATTENDANCE_LOCKED',
  'COMPLETED',
  'REPORT_GENERATED',
  'ARCHIVED'
];

const LifecycleProgress = ({ currentStatus }) => {
  const currentIndex = stages.indexOf(currentStatus);

  return (
    <div className="py-6">
      <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-6">Meeting Lifecycle</h3>
      <div className="relative">
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-slate-200 rounded-full"></div>
        <div 
          className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-blue-500 rounded-full transition-all duration-500" 
          style={{ width: `${currentIndex === -1 ? 0 : (currentIndex / (stages.length - 1)) * 100}%` }}
        ></div>
        
        <div className="relative flex justify-between w-full">
          {stages.map((stage, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;
            
            return (
              <div key={stage} className="flex flex-col items-center group relative">
                <div 
                  className={`w-6 h-6 rounded-full flex items-center justify-center border-2 bg-white transition-colors duration-300 ${
                    isCompleted ? 'border-blue-500 bg-blue-500 text-white' : 
                    isCurrent ? 'border-blue-600 ring-4 ring-blue-100' : 'border-slate-300'
                  }`}
                >
                  {isCompleted && <Check size={12} strokeWidth={3} />}
                </div>
                
                {/* Tooltip on hover since labels might overlap on small screens */}
                <span className="absolute top-8 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-xs font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded shadow-sm z-10">
                  {stage.replace(/_/g, ' ')}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-8 flex justify-between text-xs font-medium text-slate-500">
        <span>Draft</span>
        <span>Archived</span>
      </div>
    </div>
  );
};

export default LifecycleProgress;
