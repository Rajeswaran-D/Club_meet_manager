import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { ArrowLeft, FileText, Users, Mail, CheckCircle, Paperclip, BarChart } from 'lucide-react';
import { LoadingSkeleton } from '../../components/ui/Skeletons';

import OverviewTab from './tabs/OverviewTab';
import ParticipantsTab from './tabs/ParticipantsTab';
import InvitationTab from './tabs/InvitationTab';
import AttendanceTab from './tabs/AttendanceTab';
import DocumentsTab from './tabs/DocumentsTab';
import ReportsTab from './tabs/ReportsTab';
import LifecycleProgress from '../../components/ui/LifecycleProgress';

const MeetingDetails = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: meeting, isLoading, isError } = useQuery({
    queryKey: ['meetings', id],
    queryFn: async () => {
      const { data } = await api.get(`/meetings/${id}`);
      return data;
    },
  });

  if (isLoading) return <LoadingSkeleton rows={10} />;
  if (isError || !meeting) return <div className="text-red-500">Failed to load meeting details.</div>;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FileText size={18} /> },
    { id: 'participants', label: 'Participants', icon: <Users size={18} /> },
    { id: 'invitations', label: 'Invitations', icon: <Mail size={18} /> },
    { id: 'attendance', label: 'Attendance', icon: <CheckCircle size={18} /> },
    { id: 'documents', label: 'Documents', icon: <Paperclip size={18} /> },
    { id: 'report', label: 'Report', icon: <BarChart size={18} /> },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab meeting={meeting} />;
      case 'participants':
        return <ParticipantsTab meetingId={meeting.id} />;
      case 'invitations':
        return <InvitationTab meeting={meeting} />;
      case 'attendance':
        return <AttendanceTab meetingId={meeting.id} />;
      case 'documents':
        return <DocumentsTab meetingId={meeting.id} />;
      case 'report':
        return <ReportsTab meetingId={meeting.id} />;
      default:
        return <OverviewTab meeting={meeting} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/meetings" className="text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-3xl font-bold text-slate-800">{meeting.title}</h1>
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
          meeting.status === 'DRAFT' ? 'bg-slate-100 text-slate-600' :
          meeting.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
          'bg-blue-100 text-blue-700'
        }`}>
          {meeting.status.replace('_', ' ')}
        </span>
      </div>

      <LifecycleProgress currentStatus={meeting.status} />

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="flex border-b border-slate-200 overflow-x-auto hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
        
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default MeetingDetails;
