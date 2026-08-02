import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../api/axios';
import toast from 'react-hot-toast';
import { Upload, FileText, Image as ImageIcon, Trash2, Download } from 'lucide-react';
import { LoadingSkeleton } from '../../../components/ui/Skeletons';

const DocumentsTab = ({ meetingId }) => {
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  const { data: documents, isLoading } = useQuery({
    queryKey: ['meetings', meetingId, 'documents'],
    queryFn: async () => {
      const { data } = await api.get(`/reports/meetings/${meetingId}/documents`);
      return data;
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ file, type }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      await api.post(`/reports/meetings/${meetingId}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['meetings', meetingId, 'documents']);
      toast.success('File uploaded successfully');
    },
    onError: () => toast.error('Failed to upload file'),
    onSettled: () => setIsUploading(false),
  });

  const deleteMutation = useMutation({
    mutationFn: async (docId) => api.delete(`/reports/meetings/${meetingId}/documents/${docId}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['meetings', meetingId, 'documents']);
      toast.success('Document deleted');
    }
  });

  const handleFileUpload = (type) => (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsUploading(true);
      uploadMutation.mutate({ file, type });
    }
  };

  if (isLoading) return <LoadingSkeleton rows={5} />;

  const getIcon = (type) => {
    if (type === 'PHOTO') return <ImageIcon className="text-blue-500" size={24} />;
    return <FileText className="text-slate-500" size={24} />;
  };

  const renderUploadBox = (type, title, description, accept) => (
    <div className="border border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="bg-blue-50 p-3 rounded-full mb-3">
        <Upload className="text-blue-600" size={24} />
      </div>
      <h4 className="font-semibold text-slate-800">{title}</h4>
      <p className="text-sm text-slate-500 mb-4">{description}</p>
      <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 px-4 rounded-lg transition-colors">
        {isUploading ? 'Uploading...' : 'Choose File'}
        <input type="file" className="hidden" accept={accept} onChange={handleFileUpload(type)} disabled={isUploading} />
      </label>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Upload Documents</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {renderUploadBox('MINUTES', 'Meeting Minutes', 'Upload official typed minutes (.pdf, .docx)', '.pdf,.doc,.docx')}
          {renderUploadBox('IPC', 'Supporting Documents (Optional)', 'Upload slide decks, Excel sheets, etc.', '*/*')}
          {renderUploadBox('PHOTO', 'Photos (Optional)', 'Upload event photos (.jpg, .png)', 'image/*')}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-2">Uploaded Files</h3>
        {documents?.length === 0 ? (
          <p className="text-slate-500 italic bg-slate-50 p-4 rounded-lg border border-slate-100 text-center">No documents uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents?.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-blue-300 transition-colors">
                <div className="flex items-center space-x-3 overflow-hidden">
                  {getIcon(doc.type)}
                  <div>
                    <p className="font-medium text-slate-800 truncate">{doc.type}</p>
                    <p className="text-xs text-slate-500">{new Date(doc.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <a href={doc.secureUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 rounded-lg transition-colors">
                    <Download size={18} />
                  </a>
                  <button onClick={() => deleteMutation.mutate(doc.id)} className="p-2 text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentsTab;
