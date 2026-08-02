import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { Calendar, MapPin, CheckCircle, XCircle } from 'lucide-react';
import { LoadingSkeleton } from '../components/ui/Skeletons';

const RSVP = () => {
  const { token } = useParams();
  const queryClient = useQueryClient();
  const [successMessage, setSuccessMessage] = useState(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['rsvp', token],
    queryFn: async () => {
      const res = await api.get(`/rsvp/verify/${token}`);
      return res.data;
    },
    retry: false,
  });

  const mutation = useMutation({
    mutationFn: async (action) => {
      const res = await api.post(`/rsvp/${token}`, { action });
      return { action, message: res.data.message };
    },
    onSuccess: (res) => {
      setSuccessMessage(res.message);
      queryClient.invalidateQueries(['rsvp', token]);
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
          <LoadingSkeleton rows={4} />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-200 text-center">
          <XCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Invalid or Expired Link</h2>
          <p className="text-slate-600">This meeting link is no longer valid. Please contact your club administrator if you believe this is a mistake.</p>
        </div>
      </div>
    );
  }

  const { meeting, member, status } = data;

  if (successMessage || status === 'CONFIRMED' || status === 'DECLINED') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-200 text-center">
          {status === 'CONFIRMED' || (successMessage && successMessage.includes('CONFIRMED')) ? (
             <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
          ) : (
             <XCircle className="mx-auto text-slate-400 mb-4" size={48} />
          )}
          
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Thank You, {member.name.split(' ')[0]}!</h2>
          <p className="text-slate-600">
            {successMessage ? successMessage.replace('RSVP', 'Response') : `Your response has been marked as ${status}.`}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-blue-600 p-6 text-white text-center">
          <h1 className="text-xl font-bold mb-1">ClubMeet Invitation</h1>
          <p className="text-blue-100 text-sm">You have been invited to a meeting.</p>
        </div>
        <div className="p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">{meeting.title}</h2>
          {meeting.description && <p className="text-slate-600 mb-6">{meeting.description}</p>}
          
          <div className="space-y-3 mb-8">
            <div className="flex items-center text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <Calendar className="mr-3 text-blue-500" size={20} />
              <div>
                <p className="font-semibold text-sm">Date & Time</p>
                <p className="text-sm">{new Date(meeting.date).toLocaleDateString()} at {meeting.time}</p>
              </div>
            </div>
            <div className="flex items-center text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <MapPin className="mr-3 text-blue-500" size={20} />
              <div>
                <p className="font-semibold text-sm">Venue</p>
                <p className="text-sm">{meeting.venue}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button 
              onClick={() => mutation.mutate('accept')}
              disabled={mutation.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-sm disabled:opacity-50"
            >
              Yeah, I am going to attend
            </button>
            <button 
              onClick={() => mutation.mutate('decline')}
              disabled={mutation.isPending}
              className="w-full bg-white hover:bg-slate-50 text-slate-700 font-bold py-3 px-4 rounded-xl border border-slate-200 transition-colors shadow-sm disabled:opacity-50"
            >
              No, I can't make it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RSVP;
