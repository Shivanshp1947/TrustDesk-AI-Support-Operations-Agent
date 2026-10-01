const draftService = require("../services/draftService");


// ============================== Generate an AI draft reply for a ticket ================================
const generateDraft = async (req, res, next) => {
  try {
    const { ticketId } = req.params;

    const result = await draftService.generateDraft(ticketId);

    res.status(200).json({
      success: true,
      ...result
    });

  } catch (error) {
    next(error);
  }
};


module.exports = {generateDraft};