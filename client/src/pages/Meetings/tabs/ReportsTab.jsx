import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../api/axios';
import toast from 'react-hot-toast';
import { LoadingSkeleton } from '../../../components/ui/Skeletons';
import { FileText, Sparkles, Download, CheckCircle } from 'lucide-react';

const ReportsTab = ({ meetingId }) => {
  const queryClient = useQueryClient();
  const [instructions, setInstructions] = useState('');

  const { isLoading } = useQuery({
    queryKey: ['meetings', meetingId],
    queryFn: async () => {
      const { data } = await api.get(`/meetings/${meetingId}`);
      return data;
    },
  });

  const { data: documents } = useQuery({
    queryKey: ['meetings', meetingId, 'documents'],
    queryFn: async () => {
      const { data } = await api.get(`/reports/meetings/${meetingId}/documents`);
      return data;
    }
  });

  const generateMutation = useMutation({
    mutationFn: async () => api.post(`/reports/meetings/${meetingId}/generate-report`, { additionalInstructions: instructions }),
    onSuccess: () => {
      queryClient.invalidateQueries(['meetings', meetingId]);
      queryClient.invalidateQueries(['meetings', meetingId, 'documents']);
      toast.success('AI Report generated successfully!');
    },
    onError: () => toast.error('Failed to generate report')
  });

  if (isLoading) return <LoadingSkeleton rows={5} />;

  const reportDoc = documents?.find(d => d.type === 'REPORT');
  const minutesDoc = documents?.find(d => d.type === 'MINUTES');

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-100">
        <h3 className="text-lg font-semibold text-slate-800">Final Meeting Report</h3>
        <p className="text-sm text-slate-500">Generate a structured PDF report summarizing the meeting minutes, attendance, and photos.</p>
      </div>

      {!reportDoc ? (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          {!minutesDoc ? (
            <div className="text-center py-6">
              <FileText className="mx-auto text-slate-300 mb-3" size={48} />
              <p className="text-slate-600 font-medium">Missing Minutes</p>
              <p className="text-sm text-slate-500 mb-4">You must upload the Meeting Minutes in the Documents tab before generating a report.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start space-x-3 bg-blue-50 p-4 rounded-lg border border-blue-100">
                <CheckCircle className="text-blue-600 mt-0.5" size={20} />
                <div>
                  <p className="text-sm font-medium text-blue-900">Ready to Generate</p>
                  <p className="text-xs text-blue-700 mt-1">Minutes found. The AI will combine these with attendance data to generate the final PDF.</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Additional Instructions (Optional)</label>
                <textarea 
                  value={instructions} 
                  onChange={(e) => setInstructions(e.target.value)} 
                  placeholder="e.g. Highlight the financial decisions made in bold."
                  rows={3} 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                />
              </div>

              <button 
                onClick={() => generateMutation.mutate()} 
                disabled={generateMutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center disabled:opacity-50"
              >
                <Sparkles size={18} className="mr-2" />
                {generateMutation.isPending ? 'Generating Report...' : 'Generate AI Report'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-green-600" size={32} />
          </div>
          <h4 className="text-xl font-bold text-slate-800 mb-2">Report Generated Successfully</h4>
          <p className="text-slate-500 mb-6">The official PDF report has been compiled and saved.</p>
          
          <div className="flex justify-center space-x-4">
            <a 
              href={reportDoc.secureUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <Download size={18} className="mr-2" />
              Download PDF Report
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsTab;
