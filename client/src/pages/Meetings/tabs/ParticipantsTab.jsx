import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../api/axios';
import { LoadingSkeleton } from '../../../components/ui/Skeletons';
import { Mail, CheckCircle, XCircle, HelpCircle } from 'lucide-react';

const ParticipantsTab = ({ meetingId }) => {
  const { data: participants, isLoading, isError } = useQuery({
    queryKey: ['meetings', meetingId, 'participants'],
    queryFn: async () => {
      const { data } = await api.get(`/attendance/meetings/${meetingId}/attendance`);
      return data;
    },
  });

  if (isLoading) return <LoadingSkeleton rows={5} />;
  if (isError) return <div className="text-red-500">Failed to load participants.</div>;

  const getRSVPIcon = (status) => {
    switch(status) {
      case 'CONFIRMED': return <CheckCircle className="text-green-500" size={18} />;
      case 'DECLINED': return <XCircle className="text-red-500" size={18} />;
      case 'MAYBE': return <HelpCircle className="text-yellow-500" size={18} />;
      default: return <HelpCircle className="text-slate-300" size={18} />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Participants & RSVP Status</h3>
          <p className="text-sm text-slate-500">Overview of all members invited to this meeting.</p>
        </div>
        <div className="flex space-x-3 text-sm">
          <div className="flex items-center space-x-1"><CheckCircle className="text-green-500" size={16}/><span>Confirmed</span></div>
          <div className="flex items-center space-x-1"><XCircle className="text-red-500" size={16}/><span>Declined</span></div>
          <div className="flex items-center space-x-1"><HelpCircle className="text-slate-300" size={16}/><span>Pending</span></div>
        </div>
      </div>

      {participants.length === 0 ? (
        <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
          No participants have been added to this meeting yet.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Roll No</th>
                <th className="px-6 py-3 font-medium">Department</th>
                <th className="px-6 py-3 font-medium">Email Sent</th>
                <th className="px-6 py-3 font-medium text-center">RSVP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {participants.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3 font-medium text-slate-800">{p.member.name}</td>
                  <td className="px-6 py-3 text-slate-600">{p.member.rollNo}</td>
                  <td className="px-6 py-3 text-slate-600">{p.member.department}</td>
                  <td className="px-6 py-3">
                    {p.emailSent ? (
                      <span className="flex items-center text-green-600"><Mail size={16} className="mr-1"/> Sent</span>
                    ) : (
                      <span className="text-slate-400">Pending</span>
                    )}
                  </td>
                  <td className="px-6 py-3 flex justify-center">
                    {getRSVPIcon(p.rsvpStatus)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ParticipantsTab;
