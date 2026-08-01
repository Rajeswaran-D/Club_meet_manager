import React, { useState } from 'react';
import api from '../../../api/axios';
import Table from '../../../components/ui/Table';
import { Download } from 'lucide-react';
import toast from 'react-hot-toast';

const ODTab = ({ meeting }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const participants = meeting.members || [];
  const presentParticipants = participants.filter(m => m.attendanceStatus === 'PRESENT');
  
  const filteredParticipants = presentParticipants.filter(m => 
    m.member.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.member.rollNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownloadPdf = async () => {
    try {
      toast.loading('Generating OD List PDF...', { id: 'od-pdf' });
      
      const { data } = await api.get(`/reports/meetings/${meeting.id}/export-od-list`);
      
      if (data.downloadUrl) {
        const baseUrl = import.meta.env.VITE_API_URL.replace(/\/api$/, '');
        window.open(`${baseUrl}${data.downloadUrl}`, '_blank');
      }
      
      toast.success('Downloaded successfully', { id: 'od-pdf' });
    } catch (_error) {
      toast.error('Failed to generate PDF', { id: 'od-pdf' });
    }
  };

  const columns = [
    { header: 'Name', accessor: 'name', render: (row) => row.member.name },
    { header: 'Roll No', accessor: 'rollNo', render: (row) => row.member.rollNo },
    { header: 'Department', accessor: 'department', render: (row) => row.member.department },
    { header: 'Attendance', accessor: 'attendanceStatus', render: () => (
      <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">PRESENT</span>
    )},
  ];

  return (
    <div className="p-6 bg-white rounded-b-xl border border-t-0 border-slate-200 space-y-6">
      
      <div className="flex justify-between items-center bg-blue-50 p-4 rounded-xl border border-blue-100">
        <div>
          <h3 className="font-semibold text-blue-900">Official Duty (OD) List</h3>
          <p className="text-sm text-blue-700 mt-1">This list contains only participants who were marked PRESENT.</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handleDownloadPdf}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Download size={18} />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <input 
          type="text" 
          placeholder="Search OD list..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64"
        />
        <div className="text-sm font-medium text-slate-600">
          Total Eligible: {presentParticipants.length}
        </div>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <Table columns={columns} data={filteredParticipants} emptyMessage="No students are eligible for OD (must be marked PRESENT)." />
      </div>
    </div>
  );
};

export default ODTab;
