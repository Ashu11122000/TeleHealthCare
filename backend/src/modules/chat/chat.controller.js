import {
  createConversation,
  getConversation,
  sendMessage
} from "../chat/chat.service.js";

/**
 * =========================
 * CREATE CONVERSATION
 * =========================
 */
export const createConversationController = async (req, res, next) => {
  try {
    const { appointment_id } = req.body;

    const data = await createConversation(req.user.id, appointment_id);

    res.status(201).json({
      success: true,
      data
    });
  } catch (err) {
    next(err);
  }
};

/**
 * =========================
 * GET CONVERSATION
 * =========================
 */
export const getConversationController = async (req, res, next) => {
  try {
    const conversationId = req.params.id;

    const data = await getConversation(req.user, conversationId);

    res.json({
      success: true,
      data
    });
  } catch (err) {
    next(err);
  }
};

/**
 * =========================
 * SEND MESSAGE
 * =========================
 */
export const sendMessageController = async (req, res, next) => {
  try {
    const { conversation_id, message } = req.body;

    const data = await sendMessage(req.user, conversation_id, message);

    res.status(201).json({
      success: true,
      data
    });
  } catch (err) {
    next(err);
  }
};
