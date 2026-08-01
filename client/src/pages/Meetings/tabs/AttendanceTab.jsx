import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../api/axios';
import toast from 'react-hot-toast';
import Table from '../../../components/ui/Table';
import { Lock, Unlock } from 'lucide-react';

const AttendanceTab = ({ meeting }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const isLocked = meeting.status === 'ATTENDANCE_LOCKED' || meeting.status === 'COMPLETED' || meeting.status === 'REPORT_GENERATED';
  const participants = meeting.members || [];
  const confirmedParticipants = participants.filter(m => m.rsvpStatus === 'CONFIRMED');
  
  const filteredParticipants = confirmedParticipants.filter(m => 
    m.member.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.member.rollNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const markMutation = useMutation({
    mutationFn: async ({ participantIds, status }) => {
      const { data } = await api.post(`/attendance/meetings/${meeting.id}/attendance`, { participantIds, status });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['meeting', meeting.id]);
      toast.success('Attendance updated');
    },
    onError: () => toast.error('Failed to update attendance')
  });

  const toggleIndividual = (participantId, currentStatus) => {
    if (isLocked) return toast.error('Attendance is locked');
    const newStatus = currentStatus === 'PRESENT' ? 'ABSENT' : 'PRESENT';
    markMutation.mutate({ participantIds: [participantId], status: newStatus });
  };

  const markAll = (status) => {
    if (isLocked) return;
    const ids = filteredParticipants.map(p => p.id);
    markMutation.mutate({ participantIds: ids, status });
  };

  const columns = [
    { header: 'Name', accessor: 'name', render: (row) => row.member.name },
    { header: 'Roll No', accessor: 'rollNo', render: (row) => row.member.rollNo },
    { header: 'Status', accessor: 'attendanceStatus', render: (row) => {
      const colors = {
        PRESENT: 'bg-green-100 text-green-800',
        ABSENT: 'bg-red-100 text-red-800',
        PENDING: 'bg-slate-100 text-slate-800'
      };
      return <span className={`px-2 py-1 rounded-full text-xs font-bold ${colors[row.attendanceStatus]}`}>{row.attendanceStatus}</span>;
    }},
    { header: 'Action', accessor: 'id', render: (row) => (
      <button 
        onClick={() => toggleIndividual(row.id, row.attendanceStatus)}
        disabled={isLocked || markMutation.isLoading}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
          row.attendanceStatus === 'PRESENT' 
            ? 'bg-red-50 text-red-600 hover:bg-red-100' 
            : 'bg-green-50 text-green-600 hover:bg-green-100'
        } disabled:opacity-50`}
      >
        Mark {row.attendanceStatus === 'PRESENT' ? 'Absent' : 'Present'}
      </button>
    )}
  ];

  return (
    <div className="p-6 bg-white rounded-b-xl border border-t-0 border-slate-200 space-y-6">
      
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div>
          <h3 className="font-semibold text-slate-800 flex items-center">
            {isLocked ? <Lock size={18} className="mr-2 text-red-500" /> : <Unlock size={18} className="mr-2 text-green-500" />}
            {isLocked ? 'Attendance Locked' : 'Attendance Open'}
          </h3>
          <p className="text-sm text-slate-500">Only CONFIRMED members appear in this list.</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={() => markAll('PRESENT')} disabled={isLocked} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50">
            Mark All Present
          </button>
          <button onClick={() => markAll('ABSENT')} disabled={isLocked} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50">
            Mark All Absent
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <input 
          type="text" 
          placeholder="Search confirmed participants..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64"
        />
        <div className="text-sm font-medium text-slate-600">
          Total Confirmed: {confirmedParticipants.length}
        </div>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <Table columns={columns} data={filteredParticipants} emptyMessage="No confirmed participants found." />
      </div>
    </div>
  );
};

export default AttendanceTab;
