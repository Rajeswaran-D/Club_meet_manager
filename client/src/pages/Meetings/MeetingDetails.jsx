import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { ArrowLeft } from 'lucide-react';
import { LoadingSkeleton } from '../../components/ui/Skeletons';

import MembersTab from './tabs/MembersTab';
import InvitationTab from './tabs/InvitationTab';
import RsvpTab from './tabs/RsvpTab';
import AttendanceTab from './tabs/AttendanceTab';
import ODTab from './tabs/ODTab';
import DocumentsTab from './tabs/DocumentsTab';
import ReportsTab from './tabs/ReportsTab';
import LifecycleProgress from '../../components/ui/LifecycleProgress';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const OverviewTab = ({ meeting }) => {
  const queryClient = useQueryClient();
  
  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus) => {
      const { data } = await api.put(`/meetings/${meeting.id}`, { status: newStatus });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['meeting', meeting.id]);
      toast.success('Meeting status updated');
    },
    onError: () => toast.error('Failed to update status')
  });

  return (
    <div className="p-6 bg-white rounded-b-xl border border-t-0 border-slate-200">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg text-slate-800">Meeting Overview</h3>
          <p className="text-slate-600 mt-2">{meeting.description || 'No description provided.'}</p>
        </div>
        <div className="flex space-x-2">
          {meeting.status === 'ATTENDANCE_OPEN' && (
            <button onClick={() => updateStatusMutation.mutate('ATTENDANCE_LOCKED')} className="bg-red-50 text-red-600 px-3 py-1 rounded-md text-sm font-medium border border-red-200 hover:bg-red-100">
              Lock Attendance
            </button>
          )}
          {meeting.status === 'RSVP_OPEN' && (
            <button onClick={() => updateStatusMutation.mutate('ATTENDANCE_OPEN')} className="bg-green-50 text-green-600 px-3 py-1 rounded-md text-sm font-medium border border-green-200 hover:bg-green-100">
              Open Attendance
            </button>
          )}
        </div>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
        <div>
          <span className="text-slate-500 text-sm">Date & Time</span>
          <p className="font-medium text-slate-800">{new Date(meeting.date).toLocaleDateString()} at {meeting.time}</p>
        </div>
        <div>
          <span className="text-slate-500 text-sm">Venue</span>
          <p className="font-medium text-slate-800">{meeting.venue}</p>
        </div>
      </div>
      <div className="mt-8 border-t border-slate-100 pt-6">
        <LifecycleProgress currentStatus={meeting.status} />
      </div>
    </div>
  );
};

const MeetingDetails = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: meeting, isLoading, isError } = useQuery({
    queryKey: ['meeting', id],
    queryFn: async () => {
      const { data } = await api.get(`/meetings/${id}`);
      return data;
    },
  });

  if (isLoading) return <LoadingSkeleton rows={5} />;
  if (isError || !meeting) return <div className="text-red-500">Failed to load meeting details.</div>;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'members', label: 'Members' },
    { id: 'invitations', label: 'Invitations' },
    { id: 'rsvp', label: 'RSVP' },
    { id: 'attendance', label: 'Attendance' },
    { id: 'od', label: 'OD List' },
    { id: 'documents', label: 'Documents' },
    { id: 'reports', label: 'Reports' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/meetings" className="text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{meeting.title}</h2>
          <p className="text-slate-500 text-sm mt-1">Status: <span className="font-bold text-slate-700">{meeting.status}</span></p>
        </div>
      </div>

      <div>
        <div className="flex overflow-x-auto border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        {activeTab === 'overview' && <OverviewTab meeting={meeting} />}
        {activeTab === 'members' && <MembersTab meeting={meeting} />}
        {activeTab === 'invitations' && <InvitationTab meeting={meeting} />}
        {activeTab === 'rsvp' && <RsvpTab meeting={meeting} />}
        {activeTab === 'attendance' && <AttendanceTab meeting={meeting} />}
        {activeTab === 'od' && <ODTab meeting={meeting} />}
        {activeTab === 'documents' && <DocumentsTab meeting={meeting} />}
        {activeTab === 'reports' && <ReportsTab meeting={meeting} />}
      </div>
    </div>
  );
};

export default MeetingDetails;
