import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Table from '../../components/ui/Table';
import { LoadingSkeleton } from '../../components/ui/Skeletons';
import Modal from '../../components/ui/Modal';
import MeetingForm from './MeetingForm';

const MeetingsList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const queryClient = useQueryClient();

  const { data: meetings, isLoading, isError } = useQuery({
    queryKey: ['meetings'],
    queryFn: async () => {
      const { data } = await api.get('/meetings');
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => api.delete(`/meetings/${id}`),
    onSuccess: () => {
      toast.success('Meeting deleted successfully');
      queryClient.invalidateQueries(['meetings']);
    },
    onError: () => {
      toast.error('Failed to delete meeting');
    }
  });

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this meeting?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (meeting) => {
    setEditingMeeting(meeting);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMeeting(null);
  };

  const columns = [
    { header: 'Title', accessor: 'title', render: (row) => <span className="font-semibold text-slate-800">{row.title}</span> },
    { header: 'Date & Time', accessor: 'date', render: (row) => `${new Date(row.date).toLocaleDateString()} at ${row.time}` },
    { header: 'Venue', accessor: 'venue' },
    { header: 'Status', accessor: 'status', render: (row) => (
        <span className="px-2 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">{row.status}</span>
    )},
    { header: 'Members', accessor: '_count', render: (row) => row._count?.participants || 0 },
    { header: 'Actions', accessor: 'id', render: (row) => (
      <div className="flex space-x-2">
        <Link to={`/meetings/${row.id}`} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
          <Eye size={18} />
        </Link>
        <button onClick={() => handleEdit(row)} className="p-1 text-slate-600 hover:bg-slate-50 rounded"><Edit size={18} /></button>
        <button onClick={() => handleDelete(row.id)} disabled={deleteMutation.isPending} className="p-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"><Trash2 size={18} /></button>
      </div>
    )}
  ];

  if (isLoading) return <LoadingSkeleton />;
  if (isError) return <div className="text-red-500">Failed to load meetings.</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Meetings</h2>
        <button 
          onClick={() => { setEditingMeeting(null); setIsModalOpen(true); }}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          <span>New Meeting</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <Table columns={columns} data={Array.isArray(meetings) ? meetings : (meetings?.data || [])} />
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingMeeting ? "Edit Meeting" : "Create New Meeting"}>
        <MeetingForm initialData={editingMeeting} isEditing={!!editingMeeting} onSuccess={handleCloseModal} />
      </Modal>
    </div>
  );
};

export default MeetingsList;
