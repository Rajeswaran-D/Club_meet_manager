const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Generate meeting invitation draft
 * @param {Object} meetingDetails 
 * @returns {Promise<{subject: string, body: string}>}
 */
const generateInvitation = async (meetingDetails) => {
  const prompt = `
  You are an assistant for a college club. Write a professional meeting invitation email.
  Meeting Details:
  Title: ${meetingDetails.title}
  Description: ${meetingDetails.description || 'N/A'}
  Date: ${meetingDetails.date}
  Time: ${meetingDetails.time}
  Venue: ${meetingDetails.venue}
  Agenda: ${meetingDetails.agenda || 'N/A'}
  
  Return ONLY a JSON object with 'subject' and 'body' properties.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (err) {
    console.error('Failed to parse AI response', err);
    throw new Error('AI generation failed');
  }
};

/**
 * Classify RSVP from email reply
 * @param {string} emailText 
 * @returns {Promise<string>} - CONFIRMED, DECLINED, or PENDING
 */
const classifyRSVP = async (emailText) => {
  const prompt = `
  Analyze the following email reply to a meeting invitation.
  Determine the RSVP status.
  Reply: "${emailText}"
  
  Respond with exactly one of these words: CONFIRMED, DECLINED, PENDING.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3.5-flash',
    contents: prompt,
  });

  const text = response.text.trim().toUpperCase();
  if (['CONFIRMED', 'DECLINED', 'PENDING'].includes(text)) {
    return text;
  }
  return 'PENDING';
};

/**
 * Generate meeting report from minutes
 * @param {string} minutesText 
 * @param {Object} meetingDetails 
 * @returns {Promise<string>} - HTML or Markdown report
 */
const generateReport = async (minutesText, meetingDetails) => {
  const prompt = `
  You are an assistant for a college club. Generate a professional meeting report formatted in HTML based on the provided minutes.
  
  Meeting Details:
  Title: ${meetingDetails.title}
  Date: ${meetingDetails.date}
  
  Minutes:
  ${minutesText}
  
  Include the following sections in HTML:
  1. <h1>Meeting Details</h1>
  2. <h2>Attendance Summary</h2> (Placeholder, to be filled by system)
  3. <h2>Discussion Summary</h2>
  4. <h2>Key Decisions</h2>
  5. <h2>Action Items</h2>
  6. <h2>Conclusion</h2>
  
  Return ONLY the valid HTML snippet without html/body tags, just the content.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3.5-flash',
    contents: prompt,
  });

  return response.text;
};

module.exports = {
  generateInvitation,
  classifyRSVP,
  generateReport,
};
