import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { Upload, X, Users, Calendar, MapPin, AlignLeft, Clock } from 'lucide-react';

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

  const [members, setMembers] = useState([]);
  const [fileError, setFileError] = useState('');

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (newMeeting) => {
      // Create payload that matches updated backend expectations
      const payload = { ...newMeeting, members };
      return isEditing 
        ? api.put(`/meetings/${initialData.id}`, payload)
        : api.post('/meetings', payload);
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

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.match(/\.(xlsx|xls|csv)$/)) {
      setFileError('Please upload a valid Excel or CSV file.');
      return;
    }
    
    setFileError('');

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        // Basic validation: ensure expected headers exist
        const parsedMembers = data.map(row => ({
          name: row.Name || row.name,
          email: row.Email || row.email,
          rollNo: String(row.RollNo || row.rollNo || row['Roll Number']),
          department: row.Department || row.department
        })).filter(m => m.name && m.email && m.rollNo);

        if (parsedMembers.length === 0) {
          setFileError('Could not find valid rows. Ensure columns: Name, Email, RollNo, Department exist.');
        } else {
          setMembers(parsedMembers);
          toast.success(`Parsed ${parsedMembers.length} members successfully.`);
        }
      } catch (err) {
        setFileError('Failed to parse file.');
        console.error(err);
      }
    };
    reader.readAsBinaryString(file);
  };

  const removeMember = (indexToRemove) => {
    setMembers(members.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (members.length === 0 && !isEditing) {
       // Allow creating without members, but confirm first
       if(!window.confirm("You haven't imported any members. Create meeting anyway?")) return;
    }
    mutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl border border-slate-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Basic Information</h3>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Meeting Title *</label>
            <input required type="text" name="title" value={formData.title} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. Annual General Body Meeting" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={2} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Brief context about the meeting" />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Scheduling</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center text-sm font-medium text-slate-700 mb-1"><Calendar size={16} className="mr-1 text-slate-400"/> Date *</label>
              <input required type="date" name="date" value={formData.date} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="flex items-center text-sm font-medium text-slate-700 mb-1"><Clock size={16} className="mr-1 text-slate-400"/> Time *</label>
              <input required type="time" name="time" value={formData.time} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="flex items-center text-sm font-medium text-slate-700 mb-1"><MapPin size={16} className="mr-1 text-slate-400"/> Venue *</label>
            <input required type="text" name="venue" value={formData.venue} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="e.g. Main Auditorium" />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Agenda</h3>
          <div>
            <label className="flex items-center text-sm font-medium text-slate-700 mb-1"><AlignLeft size={16} className="mr-1 text-slate-400"/> Discussion Points</label>
            <textarea name="agenda" value={formData.agenda} onChange={handleChange} rows={4} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="1. Opening remarks&#10;2. Financial review&#10;..." />
          </div>
        </div>

        <div className="md:col-span-2 space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center"><Users className="mr-2 text-blue-600" size={20}/> {isEditing ? 'Add More Participants' : 'Add Participants'} (Optional)</h3>
          <p className="text-sm text-slate-500">Upload an Excel (.xlsx/.csv) or manually add members below.</p>
          
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 className="text-sm font-medium text-slate-700 mb-2">Manual Entry</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input type="text" id="manualName" placeholder="Name" className="px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500" />
              <input type="text" id="manualRoll" placeholder="Roll No" className="px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500" />
              <input type="email" id="manualEmail" placeholder="Email" className="px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500" />
              <div className="flex gap-2">
                <input type="text" id="manualDept" placeholder="Dept" className="px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 w-full" />
                <button type="button" onClick={() => {
                  const n = document.getElementById('manualName').value;
                  const r = document.getElementById('manualRoll').value;
                  const e = document.getElementById('manualEmail').value;
                  const d = document.getElementById('manualDept').value;
                  if (n && r && e) {
                    setMembers([...members, { name: n, rollNo: r, email: e, department: d }]);
                    document.getElementById('manualName').value = '';
                    document.getElementById('manualRoll').value = '';
                    document.getElementById('manualEmail').value = '';
                    document.getElementById('manualDept').value = '';
                  } else {
                    toast.error('Name, Roll No, and Email are required');
                  }
                }} className="bg-blue-600 text-white px-3 rounded hover:bg-blue-700 shrink-0 font-bold">+</button>
              </div>
            </div>
          </div>

          <div className="mt-2">
            <label className="cursor-pointer border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 transition-colors rounded-xl p-6 flex flex-col items-center justify-center text-center">
              <Upload className="text-slate-400 mb-2" size={24} />
              <span className="text-sm font-medium text-blue-600">Click to upload Excel/CSV</span>
              <span className="text-xs text-slate-500 mt-1">or drag and drop</span>
              <input type="file" className="hidden" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} />
            </label>
            {fileError && <p className="text-red-500 text-sm mt-2">{fileError}</p>}
          </div>

          {members.length > 0 && (
            <div className="mt-4 border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                <span className="font-semibold text-slate-700">Preview ({members.length} members to add)</span>
                <button type="button" onClick={() => setMembers([])} className="text-red-600 text-sm hover:underline">Clear All</button>
              </div>
              <div className="max-h-60 overflow-y-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-100 text-slate-600 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 font-medium">Name</th>
                      <th className="px-4 py-2 font-medium">Roll No</th>
                      <th className="px-4 py-2 font-medium">Email</th>
                      <th className="px-4 py-2 font-medium text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {members.map((m, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-4 py-2 font-medium">{m.name}</td>
                        <td className="px-4 py-2">{m.rollNo}</td>
                        <td className="px-4 py-2 text-slate-500">{m.email}</td>
                        <td className="px-4 py-2 text-center">
                          <button type="button" onClick={() => removeMember(i)} className="text-slate-400 hover:text-red-500 p-1 rounded-md transition-colors"><X size={16}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="pt-6 mt-6 border-t border-slate-200 flex justify-end">
        <button type="submit" disabled={mutation.isPending} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50">
          {mutation.isPending ? 'Saving...' : (isEditing ? 'Update Meeting' : 'Create Meeting')}
        </button>
      </div>
    </form>
  );
};

export default MeetingForm;
