const ToolCall = require("../models/ToolCall");

const {approveAction,rejectAction} = require("../services/approvalService");
const {updateTraceAfterAction} = require("../services/traceService");



// =================================Action Controller========================================


// -----------------------Get ToolCall------------------------------
const getAction = async (req, res, next) => {
    try {
      const {actionId} = req.params;

      const toolCall =await ToolCall.findOne({action_id:actionId});

      if (!toolCall) {
        return res.status(404).json({
          success: false,
          message:
            "ToolCall not found"
        });
      }


      res.status(200).json({
        success: true,
        toolCall
      });

    } catch (error) {
      next(error);
    }
  };



// -----------------Approve action------------------------------

const approve = async (req, res, next) => {
    try {
      const {actionId} = req.params;
      const { reason } = req.body;
      const reviewerId =req.user?.reviewerId;

      const result = await approveAction({
          actionId,
          reviewerId,
          reason
        });

        await updateTraceAfterAction({
            actionId,
            approval:result.approval,
            toolCall:result.toolCall,
            toolResult:result.result
        });

      res.status(200).json({
        success: true,
        message:
          "Action approved and executed.",...result
      });
    } catch (error) {
      next(error);
    }
  };



// ---------------------------- Reject action ------------------------------


const reject = async (req, res, next) => {

    try {
      const {actionId} = req.params;
      const { reason } = req.body;

      const reviewerId =req.user?.reviewerId;


      const result = await rejectAction({
            actionId,
            reviewerId,
            reason
      });

      await updateTraceAfterAction({
          actionId,
          approval:result.approval,
          toolCall:result.toolCall,
          toolResult:null
      });


      res.status(200).json({
        success: true,
        message:"Action rejected.",...result
      });

    } catch (error) {
      next(error);
    }
  };


module.exports = {getAction, approve, reject};