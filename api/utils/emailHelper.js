const nodemailer = require('nodemailer');

/**
 * Send an email notification to students when a new note is uploaded.
 * @param {string[]} studentEmails - List of student emails.
 * @param {Object} noteDetails - Details of the note (subject, topic, branch, year).
 * @param {string} teacherName - Name of the teacher who uploaded the note.
 */
const sendNoteNotification = async (studentEmails, noteDetails, teacherName) => {
  if (!studentEmails || studentEmails.length === 0) {
    console.log('No students to notify.');
    return;
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const { subject, topic, branch, year } = noteDetails;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f0f2f5; }
        .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 1px; }
        .content { 
          padding: 30px; 
          color: #444; 
          position: relative;
          background-image: url('${process.env.EMAIL_WATERMARK_URL || ''}');
          background-repeat: no-repeat;
          background-position: center;
          background-size: 80%;
          background-blend-mode: overlay;
        }
        .greeting { font-size: 18px; font-weight: 600; color: #333; margin-bottom: 20px; }
        .info-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #667eea; }
        .info-row { margin-bottom: 10px; display: flex; }
        .info-label { font-weight: 600; color: #718096; width: 100px; font-size: 14px; }
        .info-value { color: #2d3748; font-size: 15px; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; color: #a0aec0; font-size: 12px; border-top: 1px solid #edf2f7; }
        .btn { display: inline-block; padding: 12px 25px; background: #667eea; color: white !important; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 20px; transition: background 0.3s; }
        .highlight { color: #667eea; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          ${process.env.EMAIL_LOGO_URL 
            ? `<img src="${process.env.EMAIL_LOGO_URL}" alt="Chat.VVP Logo" style="height: 60px; margin-bottom: 10px; border-radius: 8px;">`
            : ''
          }
          <h1>Chat.VVP Study Portal</h1>
        </div>
        <div class="content">
          <div class="greeting">New Study Material Uploaded! 📚</div>
          <p>Hello there,</p>
          <p>Good news! Your teacher <span class="highlight">${teacherName}</span> just uploaded a new set of notes for your course. Keep your preparation on track!</p>
          
          <div class="info-card">
            <div class="info-row">
              <span class="info-label">Subject:</span>
              <span class="info-value">${subject}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Topic:</span>
              <span class="info-value">${topic}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Branch:</span>
              <span class="info-value">${branch}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Year:</span>
              <span class="info-value">${year} Year</span>
            </div>
          </div>

          <p>Please log in to the app to view and download the full notes.</p>
          
          <div style="text-align: center;">
            <a href="#" class="btn">View Notes Now</a>
          </div>
        </div>
        <div class="footer">
          <p>This is an automated notification from Chat.VVP Artificial Intelligence College Study Assistant.</p>
          <p>&copy; 2026 Chat.VVP Team. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'Chat.VVP Assistant'}" <${process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER}>`,
    bcc: studentEmails.join(','),
    subject: `[New Notes] ${subject}: ${topic}`,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Premium notification emails sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending premium notification emails:', error);
    throw error;
  }
};

module.exports = {
  sendNoteNotification,
};
