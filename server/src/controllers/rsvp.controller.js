const prisma = require('../prisma');

// Verify token and fetch details for public RSVP page
const verifyToken = async (req, res) => {
  try {
    const { token } = req.params;
    
    const participant = await prisma.MeetingParticipant.findUnique({
      where: { rsvpToken: token },
      include: {
        meeting: true,
        member: { select: { name: true, email: true } }
      }
    });

    if (!participant || participant.meeting.isDeleted) {
      return res.status(404).json({ error: 'Invalid or expired RSVP link.' });
    }

    res.json({
      member: participant.member,
      meeting: participant.meeting,
      status: participant.rsvpStatus
    });
  } catch (error) {
    console.error('Error verifying RSVP token:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Handle RSVP action
const submitRSVP = async (req, res) => {
  try {
    const { token } = req.params;
    const { action } = req.body; // 'accept' or 'decline'

    if (!['accept', 'decline'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action. Must be accept or decline.' });
    }

    const participant = await prisma.MeetingParticipant.findUnique({
      where: { rsvpToken: token }
    });

    if (!participant) {
      return res.status(404).json({ error: 'Invalid RSVP link.' });
    }

    const updated = await prisma.MeetingParticipant.update({
      where: { id: participant.id },
      data: {
        rsvpStatus: action === 'accept' ? 'CONFIRMED' : 'DECLINED',
        updatedAt: new Date()
      }
    });

    res.json({ message: `Response successfully marked as ${updated.rsvpStatus}.` });
  } catch (error) {
    console.error('Error submitting RSVP:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  verifyToken,
  submitRSVP
};
