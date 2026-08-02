import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { Users, Calendar, CheckCircle, Clock, FileText, Activity } from 'lucide-react';
import { LoadingSkeleton } from '../components/ui/Skeletons';

const StatCard = ({ title, value, icon, colorClass }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between transition-transform hover:scale-105">
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <p className="text-3xl font-bold text-slate-800">{value}</p>
    </div>
    <div className={`p-4 rounded-full ${colorClass}`}>
      {icon}
    </div>
  </div>
);

const Dashboard = () => {
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const { data } = await api.get('/meetings/stats');
      return data;
    },
  });

  if (isLoading) return <LoadingSkeleton rows={8} />;
  if (isError || !stats) return <div className="text-red-500">Failed to load dashboard statistics.</div>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Club Overview</h2>
        <p className="text-slate-500">Live statistics and pending actions for your organization.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Members" 
          value={stats.totalMembers} 
          icon={<Users size={28} className="text-blue-600" />} 
          colorClass="bg-blue-50" 
        />
        <StatCard 
          title="Avg Attendance" 
          value={`${stats.avgAttendance}%`} 
          icon={<Activity size={28} className="text-emerald-600" />} 
          colorClass="bg-emerald-50" 
        />
        <StatCard 
          title="Upcoming Meetings" 
          value={stats.upcomingMeetings} 
          icon={<Calendar size={28} className="text-indigo-600" />} 
          colorClass="bg-indigo-50" 
        />
        <StatCard 
          title="Completed Meetings" 
          value={stats.completedMeetings} 
          icon={<CheckCircle size={28} className="text-purple-600" />} 
          colorClass="bg-purple-50" 
        />
      </div>

      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Meeting-wise Engagement</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {stats.recentMeetingStats?.map((meeting) => (
            <div key={meeting.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="font-semibold text-slate-800 truncate mb-1" title={meeting.title}>{meeting.title}</h4>
              <p className="text-xs text-slate-500 mb-4">{new Date(meeting.date).toLocaleDateString()}</p>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-slate-600 flex items-center"><CheckCircle size={12} className="mr-1 text-teal-500" /> RSVPs Accepted</span>
                    <span className="text-slate-900">{meeting.acceptedRSVPs} / {meeting.total}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-teal-500 h-2 rounded-full" style={{ width: meeting.total > 0 ? `${(meeting.acceptedRSVPs / meeting.total) * 100}%` : '0%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-slate-600 flex items-center"><Users size={12} className="mr-1 text-blue-500" /> Attendance</span>
                    <span className="text-slate-900">{meeting.present} / {meeting.total}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: meeting.total > 0 ? `${(meeting.present / meeting.total) * 100}%` : '0%' }}></div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-center">
                <div className="bg-amber-50 rounded-lg p-2">
                  <p className="text-[10px] text-amber-600 font-semibold uppercase">Pending</p>
                  <p className="text-sm font-bold text-amber-700">{meeting.pendingRSVPs}</p>
                </div>
                <div className="bg-rose-50 rounded-lg p-2">
                  <p className="text-[10px] text-rose-600 font-semibold uppercase">Absent</p>
                  <p className="text-sm font-bold text-rose-700">{meeting.absent}</p>
                </div>
              </div>
            </div>
          ))}
          {(!stats.recentMeetingStats || stats.recentMeetingStats.length === 0) && (
            <div className="col-span-full py-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
              No recent meetings available to show engagement.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// HelpCircle missing from lucide-react import above, let's fix it here
import { HelpCircle } from 'lucide-react';

export default Dashboard;
