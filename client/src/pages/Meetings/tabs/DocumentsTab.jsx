import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../api/axios';
import toast from 'react-hot-toast';
import { FileText, Image as ImageIcon, UploadCloud, Trash2, Download } from 'lucide-react';

const FileSection = ({ meetingId, type, title, allowedTypes, documents = [], queryClient }) => {
  const [isDragging, setIsDragging] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      const { data } = await api.post(`/reports/meetings/${meetingId}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['meeting', meetingId]);
      toast.success(`${title} uploaded successfully`);
    },
    onError: () => toast.error(`Failed to upload ${title}`)
  });

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    validateAndUpload(file);
  };

  const handleChange = (e) => {
    const file = e.target.files[0];
    validateAndUpload(file);
  };

  const validateAndUpload = (file) => {
    if (!file) return;
    const extension = file.name.split('.').pop().toLowerCase();
    const isValidType = allowedTypes.includes(extension) || allowedTypes.includes(file.type);
    if (!isValidType) {
      return toast.error(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`);
    }
    if (file.size > 5 * 1024 * 1024) {
      return toast.error('File size must be less than 5MB');
    }
    uploadMutation.mutate(file);
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-semibold text-slate-800 flex items-center">
          {type === 'PHOTO' ? <ImageIcon className="mr-2 text-indigo-500" size={18} /> : <FileText className="mr-2 text-blue-500" size={18} />}
          {title}
        </h4>
        <span className="text-xs font-medium text-slate-500 uppercase">{allowedTypes.join(' | ')}</span>
      </div>

      <div 
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400 bg-white'
        }`}
      >
        <UploadCloud className="mx-auto text-slate-400 mb-2" size={24} />
        <p className="text-sm text-slate-600 mb-1">Drag and drop or click to upload</p>
        <p className="text-xs text-slate-400 mb-3">Max file size 5MB</p>
        <label className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-50 cursor-pointer">
          Select File
          <input type="file" className="hidden" accept={allowedTypes.map(ext => `.${ext}`).join(',')} onChange={handleChange} disabled={uploadMutation.isLoading} />
        </label>
      </div>

      {documents.length > 0 && (
        <div className="mt-4 space-y-2">
          {documents.map((doc) => (
            <div key={doc.id} className="flex justify-between items-center bg-white p-3 rounded border border-slate-200 shadow-sm">
              <div className="flex items-center space-x-3 overflow-hidden">
                {type === 'PHOTO' && doc.secureUrl ? (
                  <img src={doc.secureUrl} alt="Thumbnail" className="w-10 h-10 object-cover rounded" />
                ) : (
                  <FileText className="text-slate-400" size={20} />
                )}
                <div className="truncate">
                  <p className="text-sm font-medium text-slate-700 truncate">Document ID: {doc.id.substring(0,8)}</p>
                  <p className="text-xs text-slate-400">{new Date(doc.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <a href={doc.secureUrl} target="_blank" rel="noreferrer" className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors">
                  <Download size={16} />
                </a>
                <button className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const DocumentsTab = ({ meeting }) => {
  const queryClient = useQueryClient();
  const docs = meeting.documents || [];

  return (
    <div className="p-6 bg-white rounded-b-xl border border-t-0 border-slate-200 space-y-6">
      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6">
        <h3 className="font-semibold text-blue-900">Meeting Documents</h3>
        <p className="text-sm text-blue-700 mt-1">Upload the Minutes of Meeting (MoM), IPC documents, and event photos required for report generation.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FileSection 
          meetingId={meeting.id} 
          type="MINUTES" 
          title="Minutes of Meeting" 
          allowedTypes={['pdf', 'docx', 'txt']} 
          documents={docs.filter(d => d.type === 'MINUTES')} 
          queryClient={queryClient}
        />
        <FileSection 
          meetingId={meeting.id} 
          type="IPC" 
          title="IPC Document" 
          allowedTypes={['pdf', 'docx']} 
          documents={docs.filter(d => d.type === 'IPC')} 
          queryClient={queryClient}
        />
      </div>

      <FileSection 
        meetingId={meeting.id} 
        type="PHOTO" 
        title="Photo Gallery" 
        allowedTypes={['jpg', 'jpeg', 'png', 'image/jpeg', 'image/png']} 
        documents={docs.filter(d => d.type === 'PHOTO')} 
        queryClient={queryClient}
      />
    </div>
  );
};

export default DocumentsTab;
