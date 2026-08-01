import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { Calendar, Users, FileText, Activity } from 'lucide-react';

const Dashboard = () => {
  // Use React Query for caching
  const { data: meetings, isLoading, isError } = useQuery({
    queryKey: ['meetings'],
    queryFn: async () => {
      const { data } = await api.get('/meetings');
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>
          ))}
        </div>
        <div className="h-64 bg-slate-200 rounded-xl"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-200">
        Failed to load dashboard data. Please check your connection.
      </div>
    );
  }

  // Handle both unwrapped and wrapped API responses robustly
  const meetingsList = Array.isArray(meetings) 
    ? meetings 
    : (meetings && Array.isArray(meetings.data) ? meetings.data : []);

  const upcomingMeetings = meetingsList.filter(m => m.status === 'SCHEDULED' || m.status === 'DRAFT');
  const completedMeetings = meetingsList.filter(m => m.status === 'COMPLETED' || m.status === 'REPORT_GENERATED');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg mr-4">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Upcoming</p>
            <p className="text-2xl font-bold text-slate-800">{upcomingMeetings.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg mr-4">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Completed</p>
            <p className="text-2xl font-bold text-slate-800">{completedMeetings.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg mr-4">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Members</p>
            <p className="text-2xl font-bold text-slate-800">142</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-lg mr-4">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Avg Attendance</p>
            <p className="text-2xl font-bold text-slate-800">87%</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800">Upcoming Meetings</h3>
        </div>
        <div className="divide-y divide-slate-200">
          {upcomingMeetings.length === 0 ? (
            <div className="p-6 text-center text-slate-500">No upcoming meetings scheduled.</div>
          ) : (
            upcomingMeetings.slice(0, 5).map((meeting) => (
              <div key={meeting.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-blue-600 text-lg">{meeting.title}</h4>
                    <p className="text-slate-600 mt-1">{new Date(meeting.date).toLocaleDateString()} at {meeting.time}</p>
                    <p className="text-slate-500 text-sm mt-2 flex items-center">
                      <span className="font-medium mr-1">Venue:</span> {meeting.venue}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                    {meeting.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
