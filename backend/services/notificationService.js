const Notification = require('../models/Notification');

/**
 * Notification Service
 * Handles creation and management of in-app notifications
 */

/**
 * Create a notification
 */
const createNotification = async (notificationData) => {
  try {
    const notification = await Notification.create(notificationData);
    return notification;
  } catch (error) {
    console.error('Create notification error:', error);
    throw error;
  }
};

/**
 * Create notifications for multiple recipients
 */
const createBulkNotifications = async (recipients, notificationTemplate) => {
  try {
    const notifications = recipients.map((recipientId) => ({
      ...notificationTemplate,
      recipient: recipientId,
    }));

    const createdNotifications = await Notification.insertMany(notifications);
    return createdNotifications;
  } catch (error) {
    console.error('Create bulk notifications error:', error);
    throw error;
  }
};

/**
 * Notify students about session time change
 */
const notifySessionTimeChange = async (studentIds, sessionDetails) => {
  const notificationTemplate = {
    type: 'session_time_change',
    title: 'Practice Session Time Changed',
    message: `The practice session for ${sessionDetails.sport} has been rescheduled to ${sessionDetails.newTime}`,
    relatedSession: sessionDetails.sessionId,
    relatedSport: sessionDetails.sportId,
  };

  return await createBulkNotifications(studentIds, notificationTemplate);
};

/**
 * Notify student about join request decision
 */
const notifyJoinRequestDecision = async (studentId, decision, sessionDetails) => {
  const notification = {
    recipient: studentId,
    type: decision === 'accepted' ? 'join_request_accepted' : 'join_request_rejected',
    title: `Join Request ${decision === 'accepted' ? 'Accepted' : 'Rejected'}`,
    message: `Your request to join ${sessionDetails.sport} practice has been ${decision}`,
    relatedSession: sessionDetails.sessionId,
    relatedSport: sessionDetails.sportId,
  };

  return await createNotification(notification);
};

/**
 * Notify students about session cancellation
 */
const notifySessionCancellation = async (studentIds, sessionDetails, reason) => {
  const notificationTemplate = {
    type: 'session_cancelled',
    title: 'Practice Session Cancelled',
    message: `The practice session for ${sessionDetails.sport} has been cancelled${reason ? `: ${reason}` : ''}`,
    relatedSession: sessionDetails.sessionId,
    relatedSport: sessionDetails.sportId,
  };

  return await createBulkNotifications(studentIds, notificationTemplate);
};

/**
 * Mark notification as read
 */
const markAsRead = async (notificationId, userId) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );
    return notification;
  } catch (error) {
    console.error('Mark as read error:', error);
    throw error;
  }
};

/**
 * Mark all notifications as read for a user
 */
const markAllAsRead = async (userId) => {
  try {
    const result = await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    return result;
  } catch (error) {
    console.error('Mark all as read error:', error);
    throw error;
  }
};

/**
 * Get user notifications
 */
const getUserNotifications = async (userId, { page = 1, limit = 20, unreadOnly = false }) => {
  try {
    const query = { recipient: userId };
    if (unreadOnly) {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .populate('relatedSession', 'title startTime')
      .populate('relatedSport', 'name')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Notification.countDocuments(query);

    return {
      notifications,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error('Get user notifications error:', error);
    throw error;
  }
};

/**
 * Delete notification
 */
const deleteNotification = async (notificationId, userId) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      recipient: userId,
    });
    return notification;
  } catch (error) {
    console.error('Delete notification error:', error);
    throw error;
  }
};

module.exports = {
  createNotification,
  createBulkNotifications,
  notifySessionTimeChange,
  notifyJoinRequestDecision,
  notifySessionCancellation,
  markAsRead,
  markAllAsRead,
  getUserNotifications,
  deleteNotification,
};
