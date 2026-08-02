import React from 'react';
import { Calendar, Clock, MapPin, AlignLeft } from 'lucide-react';

const OverviewTab = ({ meeting }) => {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-2">Meeting Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start space-x-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <Calendar className="text-blue-500 mt-1" size={24} />
            <div>
              <p className="text-sm font-medium text-slate-500">Date</p>
              <p className="text-lg font-semibold text-slate-800">{new Date(meeting.date).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <Clock className="text-blue-500 mt-1" size={24} />
            <div>
              <p className="text-sm font-medium text-slate-500">Time</p>
              <p className="text-lg font-semibold text-slate-800">{meeting.time}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 bg-slate-50 p-4 rounded-xl border border-slate-100 md:col-span-2">
            <MapPin className="text-blue-500 mt-1" size={24} />
            <div>
              <p className="text-sm font-medium text-slate-500">Venue</p>
              <p className="text-lg font-semibold text-slate-800">{meeting.venue}</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-2">Agenda</h3>
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-start space-x-3">
            <AlignLeft className="text-slate-400 mt-1" size={24} />
            <div className="flex-1 whitespace-pre-wrap text-slate-700 leading-relaxed font-sans">
              {meeting.agenda ? meeting.agenda : <span className="italic text-slate-400">No agenda specified for this meeting.</span>}
            </div>
          </div>
        </div>
      </div>
      
      {meeting.description && (
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-2">Description</h3>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-slate-700">
            {meeting.description}
          </div>
        </div>
      )}
    </div>
  );
};

export default OverviewTab;
