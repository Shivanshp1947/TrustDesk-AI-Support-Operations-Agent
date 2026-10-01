const {getTraceByRunId} = require("../services/traceService");


// ====================GET /traces/:runId=============================
const getTrace =async (req, res, next) => {
    try {
      const {runId} = req.params;
      const trace = await getTraceByRunId(runId);

      res.status(200).json({
        success: true,
        trace
      });

    } catch (error) {
      next(error);
    }
  };


module.exports = {getTrace};