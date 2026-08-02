const aiService = require('../services/ai.service');
const emailService = require('../services/email.service');
const prisma = require('../prisma');

// Generate Invitation Draft
const generateInvitation = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } });
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });

    const draft = await aiService.generateInvitation(meeting);
    res.json(draft);
  } catch (error) {
    console.error('Error generating invitation:', error);
    res.status(500).json({ error: 'Failed to generate invitation' });
  }
};

// Send Invitations
const sendInvitations = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const { subject, body } = req.body;

    if (!subject || !body) {
      return res.status(400).json({ error: 'Subject and body are required' });
    }

    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      include: { participants: { include: { member: true } } }
    });

    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });

    let sentCount = 0;
    const errors = [];

    // Send emails
    for (const participant of meeting.participants) {
      try {
        const to = participant.member.email;
        const appUrl = process.env.APP_URL || 'http://localhost:5173';
        const rsvpLink = `${appUrl}/rsvp/${participant.rsvpToken}`;
        
        let personalizedBody = body.replace(/{{name}}/gi, participant.member.name);
        personalizedBody = personalizedBody.replace(/\[RSVP_LINK\]/gi, rsvpLink);
        
        const htmlBody = `<p>${personalizedBody.replace(/\n/g, '<br/>')}</p><br/><a href="${rsvpLink}" style="padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; display: inline-block;">View Invitation</a>`;

        await emailService.sendEmail(to, subject, personalizedBody, htmlBody);
        
        // Mark as sent
        await prisma.meetingParticipant.update({
          where: { id: participant.id },
          data: { emailSent: true }
        });
        
        sentCount++;
      } catch (err) {
        errors.push({ email: participant.member.email, error: err.message });
      }
    }

    res.json({ message: `Successfully sent ${sentCount} invitations`, errors });
  } catch (error) {
    console.error('Error sending invitations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Process RSVPs (In a real app, this would be a webhook or chron job reading Gmail)
// For demonstration, an endpoint to manually trigger reading unread emails
const processRSVPs = async (req, res) => {
  try {
    // 1. Fetch unread emails using Gmail API (pseudo-code as IMAP setup is complex, assuming we have emails)
    // 2. Extract sender email and text body
    // 3. For each email:
    //    const status = await aiService.classifyRSVP(emailBody);
    //    const member = await prisma.member.findFirst({ where: { email: senderEmail } });
    //    if (member) {
    //       await prisma.MeetingParticipant.updateMany({
    //         where: { memberId: member.id, meeting: { status: 'SCHEDULED' } }, // update active meeting
    //         data: { rsvpStatus: status }
    //       });
    //    }

    // Mock response for now until full IMAP read is implemented
    res.json({ message: 'RSVP processing triggered successfully (Mock)' });
  } catch (error) {
    console.error('Error processing RSVPs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  generateInvitation,
  sendInvitations,
  processRSVPs,
};
