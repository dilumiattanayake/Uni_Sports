const nodemailer = require('nodemailer');
const config = require('../config/config');

/**
 * Email Service
 * Handles all email communications using NodeMailer
 * Abstracted for easy replacement or extension
 */

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: config.EMAIL.HOST,
    port: config.EMAIL.PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: config.EMAIL.USER,
      pass: config.EMAIL.PASSWORD,
    },
  });
};

/**
 * Send generic email
 */
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: config.EMAIL.FROM,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send session time change notification email
 */
const sendSessionTimeChangeEmail = async (studentEmail, studentName, sessionDetails) => {
  const subject = 'Practice Session Time Changed - UniSports';
  const html = `
    <h2>Practice Session Time Change</h2>
    <p>Dear ${studentName},</p>
    <p>The practice session you are enrolled in has been rescheduled:</p>
    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
      <p><strong>Sport:</strong> ${sessionDetails.sport}</p>
      <p><strong>Coach:</strong> ${sessionDetails.coach}</p>
      <p><strong>New Time:</strong> ${sessionDetails.newStartTime} - ${sessionDetails.newEndTime}</p>
      <p><strong>Location:</strong> ${sessionDetails.location}</p>
    </div>
    <p>Please adjust your schedule accordingly.</p>
    <p>Best regards,<br>UniSports Team</p>
  `;
  const text = `Practice Session Time Changed\n\nDear ${studentName},\n\nThe practice session you are enrolled in has been rescheduled to ${sessionDetails.newStartTime} - ${sessionDetails.newEndTime}.\n\nBest regards,\nUniSports Team`;

  return await sendEmail({ to: studentEmail, subject, html, text });
};

/**
 * Send join request decision email
 */
const sendJoinRequestDecisionEmail = async (studentEmail, studentName, decision, sessionDetails) => {
  const subject = `Join Request ${decision === 'accepted' ? 'Accepted' : 'Rejected'} - UniSports`;
  const html = `
    <h2>Join Request ${decision === 'accepted' ? 'Accepted' : 'Rejected'}</h2>
    <p>Dear ${studentName},</p>
    <p>Your request to join the practice session has been <strong>${decision}</strong>:</p>
    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
      <p><strong>Sport:</strong> ${sessionDetails.sport}</p>
      <p><strong>Coach:</strong> ${sessionDetails.coach}</p>
      <p><strong>Time:</strong> ${sessionDetails.startTime} - ${sessionDetails.endTime}</p>
      <p><strong>Location:</strong> ${sessionDetails.location}</p>
      ${sessionDetails.responseMessage ? `<p><strong>Coach's Message:</strong> ${sessionDetails.responseMessage}</p>` : ''}
    </div>
    ${decision === 'accepted' ? '<p>We look forward to seeing you at the practice session!</p>' : '<p>Please feel free to apply for other sessions.</p>'}
    <p>Best regards,<br>UniSports Team</p>
  `;
  const text = `Join Request ${decision === 'accepted' ? 'Accepted' : 'Rejected'}\n\nDear ${studentName},\n\nYour request to join the practice session has been ${decision}.\n\nBest regards,\nUniSports Team`;

  return await sendEmail({ to: studentEmail, subject, html, text });
};

/**
 * Send session cancellation email
 */
const sendSessionCancellationEmail = async (studentEmail, studentName, sessionDetails, reason) => {
  const subject = 'Practice Session Cancelled - UniSports';
  const html = `
    <h2>Practice Session Cancelled</h2>
    <p>Dear ${studentName},</p>
    <p>Unfortunately, the following practice session has been cancelled:</p>
    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
      <p><strong>Sport:</strong> ${sessionDetails.sport}</p>
      <p><strong>Coach:</strong> ${sessionDetails.coach}</p>
      <p><strong>Time:</strong> ${sessionDetails.startTime} - ${sessionDetails.endTime}</p>
      <p><strong>Location:</strong> ${sessionDetails.location}</p>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
    </div>
    <p>We apologize for any inconvenience caused.</p>
    <p>Best regards,<br>UniSports Team</p>
  `;
  const text = `Practice Session Cancelled\n\nDear ${studentName},\n\nThe practice session has been cancelled.\n\nBest regards,\nUniSports Team`;

  return await sendEmail({ to: studentEmail, subject, html, text });
};

module.exports = {
  sendEmail,
  sendSessionTimeChangeEmail,
  sendJoinRequestDecisionEmail,
  sendSessionCancellationEmail,
};
