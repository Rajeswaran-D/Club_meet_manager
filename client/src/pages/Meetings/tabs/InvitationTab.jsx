import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../api/axios';
import toast from 'react-hot-toast';
import { Sparkles, Send, Mail, Edit3, Save } from 'lucide-react';
import { LoadingSkeleton } from '../../../components/ui/Skeletons';

const InvitationTab = ({ meeting }) => {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const { data: participants, isLoading } = useQuery({
    queryKey: ['meetings', meeting.id, 'participants'],
    queryFn: async () => {
      const { data } = await api.get(`/attendance/meetings/${meeting.id}/attendance`);
      return data;
    }
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.get(`/ai/meetings/${meeting.id}/generate-invite`);
      return data;
    },
    onSuccess: (data) => {
      setDraft(data);
      setSubject(data.subject);
      setBody(data.body);
      toast.success('Draft generated successfully');
    },
    onError: () => toast.error('Failed to generate draft')
  });

  const sendMutation = useMutation({
    mutationFn: async () => api.post(`/ai/meetings/${meeting.id}/send-invites`, { subject, body }),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['meetings', meeting.id]);
      queryClient.invalidateQueries(['meetings', meeting.id, 'participants']);
      toast.success(res.data.message || 'Invitations sent!');
    },
    onError: () => toast.error('Failed to send invitations')
  });

  if (isLoading) return <LoadingSkeleton rows={5} />;

  const total = participants?.length || 0;
  const sent = participants?.filter(p => p.emailSent).length || 0;
  const pending = total - sent;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Email Invitations</h3>
          <p className="text-sm text-slate-500">Draft and dispatch personalized emails to participants.</p>
        </div>
        <div className="flex space-x-4 text-sm bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
          <div><span className="font-semibold text-slate-700">Total:</span> {total}</div>
          <div><span className="font-semibold text-green-600">Sent:</span> {sent}</div>
          <div><span className="font-semibold text-amber-600">Pending:</span> {pending}</div>
        </div>
      </div>

      {!draft ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center shadow-sm">
          <Sparkles className="mx-auto text-blue-500 mb-4" size={48} />
          <h4 className="text-xl font-bold text-slate-800 mb-2">Generate AI Draft</h4>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">Click below to generate a professional, context-aware invitation email using Gemini AI.</p>
          <button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending || total === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-sm disabled:opacity-50"
          >
            {generateMutation.isPending ? 'Drafting...' : 'Generate Draft'}
          </button>
          {total === 0 && <p className="text-red-500 text-sm mt-3">You must add participants before sending invitations.</p>}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h4 className="font-semibold text-slate-800 flex items-center"><Mail className="mr-2 text-slate-400" size={18}/> Draft Preview</h4>
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-700">
                <Edit3 size={16} className="mr-1" /> Edit
              </button>
            ) : (
              <button onClick={() => setIsEditing(false)} className="flex items-center text-sm font-medium text-green-600 hover:text-green-700">
                <Save size={16} className="mr-1" /> Save
              </button>
            )}
          </div>
          
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
              {isEditing ? (
                <input value={subject} onChange={e => setSubject(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              ) : (
                <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800">{subject}</div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Body</label>
              {isEditing ? (
                <textarea value={body} onChange={e => setBody(e.target.value)} rows={8} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm" />
              ) : (
                <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
                  {body}
                </div>
              )}
            </div>
            <p className="text-xs text-amber-600 font-medium">Note: The placeholder [RSVP_LINK] will be automatically replaced with personalized, secure links for each recipient.</p>
          </div>
          
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end space-x-3">
            <button onClick={() => setDraft(null)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors">Discard</button>
            <button 
              onClick={() => sendMutation.mutate()} 
              disabled={sendMutation.isPending || isEditing}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center transition-colors disabled:opacity-50 shadow-sm"
            >
              <Send size={16} className="mr-2" />
              {sendMutation.isPending ? 'Sending...' : 'Dispatch Emails'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvitationTab;
