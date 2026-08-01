const prisma = require('../prisma');

// Get RSVP statistics for a meeting
const getRSVPStats = async (req, res) => {
  try {
    const { meetingId } = req.params;

    const stats = await prisma.MeetingParticipant.groupBy({
      by: ['rsvpStatus'],
      where: { meetingId },
      _count: { rsvpStatus: true },
    });

    const totalInvited = await prisma.MeetingParticipant.count({ where: { meetingId } });

    // Format stats into an easy object
    const formattedStats = {
      totalInvited,
      CONFIRMED: 0,
      DECLINED: 0,
      MAYBE: 0,
      PENDING: 0,
    };

    stats.forEach(stat => {
      formattedStats[stat.rsvpStatus] = stat._count.rsvpStatus;
    });

    res.json(formattedStats);
  } catch (error) {
    console.error('Error fetching RSVP stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Retrieve confirmed participants for attendance
const getConfirmedParticipants = async (req, res) => {
  try {
    const { meetingId } = req.params;

    const participants = await prisma.MeetingParticipant.findMany({
      where: { 
        meetingId,
        rsvpStatus: 'CONFIRMED'
      },
      include: {
        member: true
      },
      orderBy: { member: { rollNo: 'asc' } }
    });

    res.json(participants);
  } catch (error) {
    console.error('Error fetching confirmed participants:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Mark attendance in bulk
const markAttendance = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const { attendanceData } = req.body; // Array of { memberId, status: 'PRESENT' | 'ABSENT' }

    if (!Array.isArray(attendanceData)) {
      return res.status(400).json({ error: 'Invalid attendance data format' });
    }

    // Check meeting status to enforce locking
    const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } });
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
    
    if (['COMPLETED', 'REPORT_GENERATED'].includes(meeting.status)) {
      return res.status(403).json({ error: 'Cannot update attendance for a completed meeting.' });
    }

    // Update using transaction for bulk
    let updatedCount = 0;
    await prisma.$transaction(async (tx) => {
      for (const record of attendanceData) {
        if (!['PRESENT', 'ABSENT'].includes(record.status)) continue;

        await tx.MeetingParticipant.updateMany({
          where: { meetingId, memberId: record.memberId },
          data: { attendanceStatus: record.status }
        });
        updatedCount++;
      }
    });

    res.json({ message: `Successfully updated attendance for ${updatedCount} members.` });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get JSON OD List (Only PRESENT members)
const getODList = async (req, res) => {
  try {
    const { meetingId } = req.params;

    const odList = await prisma.MeetingParticipant.findMany({
      where: {
        meetingId,
        attendanceStatus: 'PRESENT'
      },
      include: {
        member: {
          select: { name: true, rollNo: true, department: true }
        }
      },
      orderBy: { member: { rollNo: 'asc' } }
    });

    const formattedList = odList.map(item => item.member);

    res.json({ count: formattedList.length, data: formattedList });
  } catch (error) {
    console.error('Error fetching OD list:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getRSVPStats,
  getConfirmedParticipants,
  markAttendance,
  getODList
};
