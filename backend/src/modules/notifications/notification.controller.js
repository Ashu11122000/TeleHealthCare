import { deleteNotification } from "./notification.service.js";

export const deleteNotificationController = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { notificationId } = req.params;

    await deleteNotification(notificationId, userId);

    res.status(200).json({
      success: true,
      message: "Notification removed"
    });
  } catch (err) {
    next(err);
  }
};
