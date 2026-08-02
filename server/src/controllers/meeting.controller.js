const prisma = require('../prisma');
const xlsx = require('xlsx');
const crypto = require('crypto');

// Create a meeting
const createMeeting = async (req, res) => {
  try {
    const { title, description, date, time, venue, agenda, members } = req.body;

    const parsedDate = new Date(date);

    // If members are provided, do it in a transaction
    if (members && members.length > 0) {
      const result = await prisma.$transaction(async (tx) => {
        const meeting = await tx.meeting.create({
          data: { title, description, date: parsedDate, time, venue, agenda }
        });

        for (const member of members) {
          const dbMember = await tx.member.upsert({
            where: { rollNo: member.rollNo },
            update: { name: member.name, email: member.email, department: member.department, isDeleted: false },
            create: { name: member.name, email: member.email, department: member.department, rollNo: member.rollNo }
          });

          await tx.meetingParticipant.create({
            data: {
              meetingId: meeting.id,
              memberId: dbMember.id,
              rsvpToken: crypto.randomUUID()
            }
          });
        }
        return meeting;
      });
      return res.status(201).json({ message: 'Meeting created successfully with members.', data: result });
    } else {
      const newMeeting = await prisma.meeting.create({
        data: { title, description, date: parsedDate, time, venue, agenda }
      });
      return res.status(201).json({ message: 'Meeting created successfully', data: newMeeting });
    }
  } catch (error) {
    console.error('Create meeting error:', error);
    res.status(500).json({ error: 'Failed to create meeting' });
  }
};

// Get all meetings
const getMeetings = async (req, res) => {
  try {
    const meetings = await prisma.meeting.findMany({
      where: { isDeleted: false },
      orderBy: { date: 'desc' },
      include: {
        _count: { select: { participants: true } }
      }
    });
    res.json(meetings);
  } catch (error) {
    console.error('GET /meetings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get single meeting
const getMeetingById = async (req, res) => {
  try {
    const { id } = req.params;
    const meeting = await prisma.meeting.findFirst({
      where: { id, isDeleted: false },
      include: {
        participants: {
          include: { member: true }
        },
        documents: true
      }
    });

    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
    res.json(meeting);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update a meeting
const updateMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date, time, venue, agenda, status, members } = req.body;
    
    const existing = await prisma.meeting.findUnique({ where: { id } });
    if (!existing || existing.isDeleted) return res.status(404).json({ error: 'Meeting not found' });

    const meeting = await prisma.$transaction(async (tx) => {
      const updated = await tx.meeting.update({
        where: { id },
        data: {
          ...(title && { title }),
          ...(description && { description }),
          ...(date && { date: new Date(date) }),
          ...(time && { time }),
          ...(venue && { venue }),
          ...(agenda && { agenda }),
          ...(status && { status }),
        },
      });

      if (members && members.length > 0) {
        for (const member of members) {
          const dbMember = await tx.member.upsert({
            where: { rollNo: member.rollNo },
            update: { name: member.name, email: member.email, department: member.department, isDeleted: false },
            create: { name: member.name, email: member.email, department: member.department, rollNo: member.rollNo }
          });
          
          await tx.meetingParticipant.upsert({
            where: { meetingId_memberId: { meetingId: id, memberId: dbMember.id } },
            update: {}, 
            create: {
              meetingId: id,
              memberId: dbMember.id,
              rsvpToken: crypto.randomUUID()
            }
          });
        }
      }
      return updated;
    });

    res.json(meeting);
  } catch (error) {
    console.error('Update meeting error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a meeting (Soft Delete)
const deleteMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.meeting.update({ where: { id }, data: { isDeleted: true } });
    res.json({ message: 'Meeting deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Import members from Excel
const importMembers = async (req, res) => {
  try {
    const { meetingId } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No Excel file uploaded.' });
    }

    // Read the Excel file
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    let importedCount = 0;

    // Use a transaction for bulk insert
    await prisma.$transaction(async (tx) => {
      for (const row of data) {
        // Expected columns: Name, RollNo, Department, Email
        const name = row['Name'];
        const rollNo = String(row['RollNo'] || row['Roll Number']);
        const department = row['Department'];
        const email = row['Email'];

        if (!name || !rollNo || !email) continue;

        // Upsert Member
        const member = await tx.member.upsert({
          where: { rollNo },
          update: { name, department, email },
          create: { name, rollNo, department, email },
        });

        // Link Member to Meeting
        await tx.MeetingParticipant.upsert({
          where: {
            meetingId_memberId: { meetingId, memberId: member.id }
          },
          update: {}, // Already linked
          create: {
            meetingId,
            memberId: member.id,
            rsvpStatus: 'PENDING',
            attendanceStatus: 'PENDING'
          }
        });
        importedCount++;
      }
    });

    res.json({ message: `Successfully imported ${importedCount} members.`, count: importedCount });
  } catch (error) {
    console.error('Error importing members:', error);
    res.status(500).json({ error: 'Internal server error processing Excel file.' });
  }
};

// Get Global Stats
const getStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalMembers,
      upcomingMeetings,
      completedMeetings,
      todaysMeetings,
      pendingRSVPs,
      acceptedInvitations,
      reportsCount
    ] = await Promise.all([
      prisma.member.count({ where: { isDeleted: false } }),
      prisma.meeting.count({ where: { date: { gte: today }, isDeleted: false, status: { notIn: ['COMPLETED', 'REPORT_GENERATED', 'ARCHIVED'] } } }),
      prisma.meeting.count({ where: { isDeleted: false, status: { in: ['COMPLETED', 'REPORT_GENERATED'] } } }),
      prisma.meeting.count({ where: { date: { gte: today, lt: tomorrow }, isDeleted: false } }),
      prisma.MeetingParticipant.count({ where: { rsvpStatus: 'PENDING' } }),
      prisma.MeetingParticipant.count({ where: { rsvpStatus: 'CONFIRMED' } }),
      prisma.document.count({ where: { type: 'REPORT', isDeleted: false } })
    ]);

    const participants = await prisma.MeetingParticipant.findMany({
      where: { attendanceStatus: { in: ['PRESENT', 'ABSENT'] } },
      select: { attendanceStatus: true }
    });

    let avgAttendance = 0;
    if (participants.length > 0) {
      const presentCount = participants.filter(p => p.attendanceStatus === 'PRESENT').length;
      avgAttendance = Math.round((presentCount / participants.length) * 100);
    }

    const recentMeetingsData = await prisma.meeting.findMany({
      where: { isDeleted: false },
      orderBy: { date: 'desc' },
      take: 5,
      include: {
        participants: {
          select: { rsvpStatus: true, attendanceStatus: true }
        }
      }
    });

    const recentMeetingStats = recentMeetingsData.map(m => {
      const pendingRSVPs = m.participants.filter(p => p.rsvpStatus === 'PENDING').length;
      const acceptedRSVPs = m.participants.filter(p => p.rsvpStatus === 'CONFIRMED').length;
      const declinedRSVPs = m.participants.filter(p => p.rsvpStatus === 'DECLINED').length;
      
      const present = m.participants.filter(p => p.attendanceStatus === 'PRESENT').length;
      const absent = m.participants.filter(p => p.attendanceStatus === 'ABSENT').length;

      return {
        id: m.id,
        title: m.title,
        date: m.date,
        pendingRSVPs,
        acceptedRSVPs,
        declinedRSVPs,
        present,
        absent,
        total: m.participants.length
      };
    });

    res.json({
      totalMembers,
      avgAttendance,
      upcomingMeetings,
      completedMeetings,
      todaysMeetings,
      pendingRSVPs,
      acceptedInvitations,
      recentReports: reportsCount,
      recentMeetingStats
    });
  } catch (error) {
    console.error('Error fetching global stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createMeeting,
  getMeetings,
  getMeetingById,
  updateMeeting,
  deleteMeeting,
  importMembers,
  getStats,
};
