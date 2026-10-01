const { trustDeskGraph } = require("../agent/trustDeskGraph");


//  POST /agent-runs
//  Runs the existing TrustDesk LangGraph for one ticket.

const runAgent = async (req, res, next) => {
  try {
    const ticketId =req.body?.ticket_id || req.body?.ticketId;

    if (!ticketId) {
      return res.status(400).json({
        success: false,
        message: "ticket_id is required."
      });
    }

    /*
     * Run the EXISTING TrustDesk LangGraph.
     *
     * We are not creating another AI workflow.
     * We are simply exposing the existing graph
     * through an HTTP API.
     */
    const agentRun = await trustDeskGraph.invoke({ticketId});

    return res.status(200).json({
      success: true,
      agentRun
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {runAgent};