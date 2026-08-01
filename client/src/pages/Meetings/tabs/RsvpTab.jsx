import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../api/axios';
import Table from '../../../components/ui/Table';
import { LoadingSkeleton } from '../../../components/ui/Skeletons';

const RsvpTab = ({ meeting }) => {
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: stats, isLoading } = useQuery({
    queryKey: ['meeting-rsvp-stats', meeting.id],
    queryFn: async () => {
      const { data } = await api.get(`/attendance/meetings/${meeting.id}/rsvp-stats`);
      return data;
    },
  });

  if (isLoading) return <LoadingSkeleton rows={4} />;

  const members = meeting.members || [];
  const filteredMembers = members.filter(m => 
    (filter === 'ALL' || m.rsvpStatus === filter) &&
    (m.member.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.member.rollNo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const columns = [
    { header: 'Name', accessor: 'name', render: (row) => row.member.name },
    { header: 'Roll No', accessor: 'rollNo', render: (row) => row.member.rollNo },
    { header: 'Status', accessor: 'rsvpStatus', render: (row) => {
      const colors = {
        CONFIRMED: 'bg-green-100 text-green-800',
        DECLINED: 'bg-red-100 text-red-800',
        MAYBE: 'bg-yellow-100 text-yellow-800',
        PENDING: 'bg-slate-100 text-slate-800'
      };
      return <span className={`px-2 py-1 rounded-full text-xs font-bold ${colors[row.rsvpStatus]}`}>{row.rsvpStatus}</span>;
    }},
    { header: 'Check In Time', accessor: 'checkInTime', render: (row) => row.checkInTime ? new Date(row.checkInTime).toLocaleString() : '-' }
  ];

  return (
    <div className="p-6 bg-white rounded-b-xl border border-t-0 border-slate-200 space-y-6">
      
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-center">
            <p className="text-sm text-slate-500 font-medium">Total Invited</p>
            <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
            <p className="text-sm text-green-600 font-medium">Confirmed</p>
            <p className="text-2xl font-bold text-green-700">{stats.confirmed}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-center">
            <p className="text-sm text-red-600 font-medium">Declined</p>
            <p className="text-2xl font-bold text-red-700">{stats.declined}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-center">
            <p className="text-sm text-yellow-600 font-medium">Maybe</p>
            <p className="text-2xl font-bold text-yellow-700">{stats.maybe}</p>
          </div>
          <div className="bg-slate-100 p-4 rounded-lg border border-slate-300 text-center">
            <p className="text-sm text-slate-500 font-medium">Pending</p>
            <p className="text-2xl font-bold text-slate-700">{stats.pending}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <input 
          type="text" 
          placeholder="Search participants..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64"
        />
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-48 bg-white"
        >
          <option value="ALL">All Statuses</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="DECLINED">Declined</option>
          <option value="MAYBE">Maybe</option>
          <option value="PENDING">Pending</option>
        </select>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <Table columns={columns} data={filteredMembers} emptyMessage="No RSVP data found." />
      </div>

    </div>
  );
};

export default RsvpTab;
