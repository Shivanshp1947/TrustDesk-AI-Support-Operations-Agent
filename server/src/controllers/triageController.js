const triageService = require("../services/triageService");


// ----------------------1. Run AI triage for one ticket---------------------------
// This function handles the HTTP POST request to run AI triage for a specific ticket identified by its ticketId. It calls the triageService to perform the triage operation and returns the result in the response.
const triageTicket = async (req, res, next) => {
  try {
    const { ticketId } = req.params;

    const result = await triageService.triageTicket(
      ticketId
    );

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {triageTicket};