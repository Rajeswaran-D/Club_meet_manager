const prisma = require('../prisma');
const aiService = require('../services/ai.service');
const { generatePDF } = require('../utils/pdfGenerator');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(__dirname, '../../uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const supabase = require('../config/supabase');

// Upload a document for a meeting (Supabase)
const uploadDocument = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const { type } = req.body; 
    
    if (!req.file || !type) {
      return res.status(400).json({ error: 'File and document type are required.' });
    }

    const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } });
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });

    // Generate unique filename
    const ext = path.extname(req.file.originalname);
    const filename = `${meetingId}/${type}-${Date.now()}${ext}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase
      .storage
      .from('clubmeet_documents')
      .upload(filename, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true
      });

    if (error) throw error;

    // Get public URL
    const { data: publicUrlData } = supabase
      .storage
      .from('clubmeet_documents')
      .getPublicUrl(filename);

    const document = await prisma.document.create({
      data: {
        meetingId,
        type,
        publicId: filename,
        secureUrl: publicUrlData.publicUrl,
      }
    });

    res.status(201).json({ message: 'Document uploaded successfully', document });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Generate AI Report and PDF
const generateReport = async (req, res) => {
  try {
    const { meetingId } = req.params;

    const meeting = await prisma.meeting.findUnique({ 
      where: { id: meetingId },
      include: { documents: true }
    });

    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });

    // Find minutes document
    const minutesDoc = meeting.documents.find(d => d.type === 'MINUTES');
    if (!minutesDoc) {
      return res.status(400).json({ error: 'Minutes document must be uploaded before generating a report.' });
    }

    // Fetch text from Cloudinary secure URL (mocked extraction for brevity)
    let minutesText = `Extracted text from Cloudinary document: ${minutesDoc.secureUrl}`;

    // Get attendance summary
    const attendees = await prisma.MeetingParticipant.findMany({
      where: { meetingId, attendanceStatus: 'PRESENT' },
      include: { member: true }
    });
    
    let attendanceHtml = `<ul>`;
    attendees.forEach(a => { attendanceHtml += `<li>${a.member.name} (${a.member.rollNo})</li>`; });
    attendanceHtml += `</ul>`;

    // Ask AI to generate report HTML
    let reportHtmlSnippet = await aiService.generateReport(minutesText, meeting);
    
    // Inject attendance
    reportHtmlSnippet = reportHtmlSnippet.replace(
      /<h2>Attendance Summary<\/h2>\s*\(Placeholder, to be filled by system\)/gi, 
      `<h2>Attendance Summary</h2>${attendanceHtml}`
    );

    // Wrap in standard HTML template for PDF
    const finalHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Meeting Report</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; line-height: 1.6; }
          h1 { color: #1e3a8a; border-bottom: 2px solid #3b82f6; padding-bottom: 5px; }
          h2 { color: #2563eb; margin-top: 20px; }
          ul { background: #f8fafc; padding: 15px 35px; border-radius: 8px; }
        </style>
      </head>
      <body>
        ${reportHtmlSnippet}
      </body>
      </html>
    `;

    const pdfFilename = `Report-${meetingId}.pdf`;
    const pdfPath = path.join(UPLOADS_DIR, pdfFilename);
    await generatePDF(finalHtml, pdfPath);

    // Update meeting status
    await prisma.meeting.update({
      where: { id: meetingId },
      data: { status: 'REPORT_GENERATED' }
    });

    res.json({ message: 'Report generated successfully', downloadUrl: `/uploads/${pdfFilename}` });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Export OD List PDF
const exportODList = async (req, res) => {
  try {
    const { meetingId } = req.params;

    const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } });
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });

    const attendees = await prisma.MeetingParticipant.findMany({
      where: { meetingId, attendanceStatus: 'PRESENT' },
      include: { member: true },
      orderBy: { member: { rollNo: 'asc' } }
    });

    let tableRows = '';
    attendees.forEach((a, i) => {
      tableRows += `
        <tr>
          <td>${i + 1}</td>
          <td>${a.member.name}</td>
          <td>${a.member.rollNo}</td>
          <td>${a.member.department}</td>
        </tr>
      `;
    });

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>OD List - ${meeting.title}</title>
        <style>
          body { font-family: Arial, sans-serif; }
          h1 { text-align: center; color: #1e3a8a; }
          p { text-align: center; color: #64748b; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; }
          th { background-color: #f1f5f9; color: #0f172a; }
        </style>
      </head>
      <body>
        <h1>On-Duty (OD) List</h1>
        <p>Meeting: <strong>${meeting.title}</strong> | Date: ${meeting.date.toISOString().split('T')[0]}</p>
        <table>
          <thead>
            <tr>
              <th>S.No</th>
              <th>Name</th>
              <th>Roll Number</th>
              <th>Department</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const pdfFilename = `OD-List-${meetingId}.pdf`;
    const pdfPath = path.join(UPLOADS_DIR, pdfFilename);
    await generatePDF(html, pdfPath);

    res.json({ message: 'OD List generated successfully', downloadUrl: `/uploads/${pdfFilename}` });
  } catch (error) {
    console.error('Error exporting OD list:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  uploadDocument,
  generateReport,
  exportODList
};
