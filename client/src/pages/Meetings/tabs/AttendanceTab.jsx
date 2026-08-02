import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../api/axios';
import toast from 'react-hot-toast';
import { LoadingSkeleton } from '../../../components/ui/Skeletons';
import { UserCheck, UserX, CheckCircle, XCircle, Lock, Users, Download } from 'lucide-react';

const AttendanceTab = ({ meetingId }) => {
  const queryClient = useQueryClient();

  const { data: participants, isLoading } = useQuery({
    queryKey: ['meetings', meetingId, 'participants'],
    queryFn: async () => {
      const { data } = await api.get(`/attendance/meetings/${meetingId}/attendance`);
      return data;
    }
  });

  const { data: meeting } = useQuery({
    queryKey: ['meetings', meetingId],
    queryFn: async () => {
      const { data } = await api.get(`/meetings/${meetingId}`);
      return data;
    }
  });

  const markMutation = useMutation({
    mutationFn: async ({ attendanceData }) => api.post(`/attendance/meetings/${meetingId}/attendance`, { attendanceData }),
    onSuccess: () => {
      queryClient.invalidateQueries(['meetings', meetingId, 'participants']);
      toast.success('Attendance updated');
    },
    onError: () => toast.error('Failed to update attendance')
  });

  const toggleAttendance = (memberId, currentStatus) => {
    if (meeting?.status === 'ATTENDANCE_LOCKED') {
      toast.error('Attendance is locked for this meeting.');
      return;
    }
    const newStatus = currentStatus === 'PRESENT' ? 'ABSENT' : 'PRESENT';
    markMutation.mutate({ attendanceData: [{ memberId, status: newStatus }] });
  };

  if (isLoading) return <LoadingSkeleton rows={6} />;

  // Compute stats
  const total = participants?.length || 0;
  const present = participants?.filter(p => p.attendanceStatus === 'PRESENT').length || 0;
  const absent = participants?.filter(p => p.attendanceStatus === 'ABSENT').length || 0;

  const accepted = participants?.filter(p => p.rsvpStatus === 'CONFIRMED').length || 0;
  const declined = participants?.filter(p => p.rsvpStatus === 'DECLINED').length || 0;

  const StatCard = ({ title, value, icon, colorClass }) => (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      </div>
      <div className={`p-3 rounded-full ${colorClass}`}>
        {icon}
      </div>
    </div>
  );

  const downloadODList = async () => {
    try {
      const { data } = await api.get(`/attendance/meetings/${meetingId}/od-list`);
      if (data.count === 0) {
        toast.error('No students marked as present yet.');
        return;
      }
      
      const csvContent = 'data:text/csv;charset=utf-8,' 
        + 'Name,Roll No,Department\n'
        + data.data.map(m => `${m.name},${m.rollNo},${m.department}`).join('\n');
        
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `OD_List_${meeting?.title || 'Meeting'}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('OD List downloaded successfully');
    } catch (error) {
      toast.error('Failed to download OD List');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Attendance Management</h3>
          <p className="text-sm text-slate-500">Record physical or virtual presence for the meeting.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={downloadODList}
            className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-medium rounded-lg transition-colors border border-indigo-200 text-sm"
          >
            <Download size={16} className="mr-2" />
            Download OD List
          </button>
          
          {meeting?.status === 'ATTENDANCE_LOCKED' && (
            <div className="flex items-center text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-sm font-medium border border-amber-200 h-9">
              <Lock size={16} className="mr-1" /> Locked
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard title="Total" value={total} icon={<Users size={20} className="text-blue-600" />} colorClass="bg-blue-50" />
        <StatCard title="RSVP Yes" value={accepted} icon={<CheckCircle size={20} className="text-indigo-600" />} colorClass="bg-indigo-50" />
        <StatCard title="RSVP No" value={declined} icon={<XCircle size={20} className="text-rose-600" />} colorClass="bg-rose-50" />
        <StatCard title="Present" value={present} icon={<UserCheck size={20} className="text-emerald-600" />} colorClass="bg-emerald-50" />
        <StatCard title="Absent" value={absent} icon={<UserX size={20} className="text-red-600" />} colorClass="bg-red-50" />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-medium">Participant</th>
              <th className="px-6 py-4 font-medium">Department</th>
              <th className="px-6 py-4 font-medium text-center">RSVP</th>
              <th className="px-6 py-4 font-medium text-right">Attendance Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {participants?.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-medium text-slate-800">{p.member.name}</p>
                  <p className="text-xs text-slate-500">{p.member.rollNo}</p>
                </td>
                <td className="px-6 py-4 text-slate-600">{p.member.department}</td>
                <td className="px-6 py-4">
                  <div className="flex justify-center">
                    {p.rsvpStatus === 'CONFIRMED' ? <span className="text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded border border-green-100">YES</span> :
                     p.rsvpStatus === 'DECLINED' ? <span className="text-red-600 text-xs font-bold bg-red-50 px-2 py-1 rounded border border-red-100">NO</span> :
                     <span className="text-slate-400 text-xs font-bold bg-slate-50 px-2 py-1 rounded border border-slate-100">PENDING</span>}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => toggleAttendance(p.memberId, p.attendanceStatus)}
                    disabled={meeting?.status === 'ATTENDANCE_LOCKED'}
                    className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                      p.attendanceStatus === 'PRESENT'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        : p.attendanceStatus === 'ABSENT'
                        ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                        : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {p.attendanceStatus === 'PRESENT' ? <><UserCheck size={16} className="mr-2"/> Marked Present</> :
                     p.attendanceStatus === 'ABSENT' ? <><UserX size={16} className="mr-2"/> Marked Absent</> :
                     'Mark Status'}
                  </button>
                </td>
              </tr>
            ))}
            {participants?.length === 0 && (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
                  No participants found. Import members to manage attendance.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceTab;
