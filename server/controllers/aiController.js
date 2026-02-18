import { generateAIResponse } from "../services/aiService.js";

const httpErrorHandler = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

//POST /api/ai/assistant
export const aiAssistant =async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return next(httpErrorHandler("Unauthorized", 401));
    const MAX_CHARS = 500;
    const message = req.body?.message?.trim();
    if (!message || message.length < 1 || message.length > MAX_CHARS) {
      return next(httpErrorHandler("message is required but not more than 500 characters ", 400));
    }

    const reply = await generateAIResponse(userId, message);

    res.status(200).json({ reply });
  } catch (error) {
    next(error);
  }
};