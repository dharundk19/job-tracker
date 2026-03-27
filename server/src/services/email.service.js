const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendReminderEmail = async ({ to, jobTitle, company, message, reminderDate }) => {
  await transporter.sendMail({
    from: `"JobTrackr" <${process.env.EMAIL_USER}>`,
    to,
    subject: `⏰ Reminder: ${jobTitle} at ${company}`,
    html: `
      <div style="font-family: sans-serif; padding: 24px; max-width: 500px;">
        <h2 style="color: #6366f1;">JobTrackr Reminder</h2>
        <p><strong>Company:</strong> ${company}</p>
        <p><strong>Role:</strong> ${jobTitle}</p>
        <p><strong>Date:</strong> ${new Date(reminderDate).toLocaleString()}</p>
        <p><strong>Note:</strong> ${message}</p>
        <hr/>
        <small style="color: #888;">This is an automated reminder from JobTrackr.</small>
      </div>
    `,
  });
};

module.exports = { sendReminderEmail };
