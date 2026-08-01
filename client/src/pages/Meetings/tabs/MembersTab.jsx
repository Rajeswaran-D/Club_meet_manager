import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../api/axios';
import toast from 'react-hot-toast';
import Table from '../../../components/ui/Table';
import { UploadCloud, Search, Trash2 } from 'lucide-react';

const MembersTab = ({ meeting }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [file, setFile] = useState(null);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (uploadFile) => {
      const formData = new FormData();
      formData.append('file', uploadFile);
      const { data } = await api.post(`/meetings/${meeting.id}/members/import`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['meeting', meeting.id]);
      toast.success(data.message || 'Members imported successfully');
      setFile(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to import members');
    }
  });

  const handleUpload = () => {
    if (!file) return toast.error('Please select an Excel file first');
    uploadMutation.mutate(file);
  };

  const membersData = meeting?.members?.map(m => m.member) || [];
  const filteredMembers = membersData.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.rollNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { header: 'Name', accessor: 'name', render: (row) => <span className="font-medium text-slate-900">{row.name}</span> },
    { header: 'Roll Number', accessor: 'rollNo' },
    { header: 'Department', accessor: 'department' },
    { header: 'Email', accessor: 'email' },
    { header: 'Actions', accessor: 'id', render: () => (
      <button className="text-red-600 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors">
        <Trash2 size={18} />
      </button>
    )}
  ];

  return (
    <div className="p-6 bg-white rounded-b-xl border border-t-0 border-slate-200 space-y-6">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search members..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-64"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3 bg-slate-50 p-2 rounded-lg border border-slate-200">
          <input 
            type="file" 
            accept=".xlsx, .xls, .csv" 
            onChange={(e) => setFile(e.target.files[0])}
            className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <button 
            onClick={handleUpload}
            disabled={!file || uploadMutation.isLoading}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <UploadCloud size={18} />
            <span>{uploadMutation.isLoading ? 'Importing...' : 'Import'}</span>
          </button>
        </div>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <Table columns={columns} data={filteredMembers} emptyMessage="No members found. Import an Excel file to get started." />
      </div>
      
    </div>
  );
};

export default MembersTab;
