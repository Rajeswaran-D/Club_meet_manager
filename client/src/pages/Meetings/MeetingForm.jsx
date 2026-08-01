import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const MeetingForm = ({ onSuccess, initialData = null }) => {
  const isEditing = !!initialData;
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    date: initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : '',
    time: initialData?.time || '',
    venue: initialData?.venue || '',
    agenda: initialData?.agenda || '',
  });

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (newMeeting) => {
      return isEditing 
        ? api.put(`/meetings/${initialData.id}`, newMeeting)
        : api.post('/meetings', newMeeting);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['meetings']);
      toast.success(`Meeting ${isEditing ? 'updated' : 'created'} successfully!`);
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to save meeting.');
    }
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700">Title</label>
        <input required type="text" name="title" value={formData.title} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Description</label>
        <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Date</label>
          <input required type="date" name="date" value={formData.date} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Time</label>
          <input required type="time" name="time" value={formData.time} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Venue</label>
        <input required type="text" name="venue" value={formData.venue} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Agenda</label>
        <textarea name="agenda" value={formData.agenda} onChange={handleChange} rows={3} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
      </div>
      <div className="pt-4 flex justify-end">
        <button type="submit" disabled={mutation.isLoading} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
          {mutation.isLoading ? 'Saving...' : 'Save Meeting'}
        </button>
      </div>
    </form>
  );
};

export default MeetingForm;
