const prisma = require('../prisma');
const xlsx = require('xlsx');

// Create a meeting
const createMeeting = async (req, res) => {
  try {
    const { title, description, date, time, venue, agenda } = req.body;
    
    if (!title || !date || !time || !venue) {
      return res.status(400).json({ error: 'Title, date, time, and venue are required.' });
    }

    const meeting = await prisma.meeting.create({
      data: {
        title,
        description,
        date: new Date(date),
        time,
        venue,
        agenda,
      },
    });

    res.status(201).json(meeting);
  } catch (error) {
    console.error('Error creating meeting:', error);
    res.status(500).json({ error: 'Internal server error' });
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
    const { title, description, date, time, venue, agenda, status } = req.body;
    
    const existing = await prisma.meeting.findUnique({ where: { id } });
    if (!existing || existing.isDeleted) return res.status(404).json({ error: 'Meeting not found' });

    const meeting = await prisma.meeting.update({
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
    res.json(meeting);
  } catch (error) {
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

module.exports = {
  createMeeting,
  getMeetings,
  getMeetingById,
  updateMeeting,
  deleteMeeting,
  importMembers,
};
