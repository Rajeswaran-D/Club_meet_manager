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
        <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Engagement Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Today's Meetings" 
            value={stats.todaysMeetings} 
            icon={<Clock size={28} className="text-rose-600" />} 
            colorClass="bg-rose-50" 
          />
          <StatCard 
            title="Pending RSVPs" 
            value={stats.pendingRSVPs} 
            icon={<HelpCircle size={28} className="text-amber-600" />} 
            colorClass="bg-amber-50" 
          />
          <StatCard 
            title="Accepted RSVPs" 
            value={stats.acceptedInvitations} 
            icon={<CheckCircle size={28} className="text-teal-600" />} 
            colorClass="bg-teal-50" 
          />
          <StatCard 
            title="Generated Reports" 
            value={stats.recentReports} 
            icon={<FileText size={28} className="text-slate-600" />} 
            colorClass="bg-slate-100" 
          />
        </div>
      </div>
    </div>
  );
};

// HelpCircle missing from lucide-react import above, let's fix it here
import { HelpCircle } from 'lucide-react';

export default Dashboard;
