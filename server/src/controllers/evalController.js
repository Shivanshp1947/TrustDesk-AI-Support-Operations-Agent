const {startEvaluation,getEvaluationRun} = require("../services/evaluationService");


// ====================== Start Evaluation ============================
// ---------------------POST /eval/run --------------------------------
// --------------------Starts the evaluation asynchronously. -----------
 

const startEval = async (req, res, next) => {
    try {
      const evalRun = await startEvaluation();

      res.status(202).json({
        success: true,
        message: "Evaluation started.",
        eval_run_id:evalRun.eval_run_id,
        status: evalRun.status
      });
    } catch (error) {
      next(error);
    }
  };



// ====================== Get Evaluation Result================================
// ====================== GET /eval/:evalRunId ================================

const getEval =async (req, res, next) => {
    try {
      const {evalRunId} = req.params;
      const evalRun = await getEvaluationRun(evalRunId);

      res.status(200).json({
        success: true,
        evaluation: evalRun
      });
    } catch (error) {
      next(error);
    }
  };


module.exports = {startEval, getEval};