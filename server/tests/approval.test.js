jest.mock("../src/models/Approval", () => ({
  findOne: jest.fn(),
  create: jest.fn()
}));

jest.mock("../src/models/ToolCall", () => ({
  findOne: jest.fn()
}));

jest.mock("../src/models/Ticket", () => ({
  updateOne: jest.fn()
}));

jest.mock(
  "../src/services/toolExecutionService",
  () => ({
    executeToolCall: jest.fn()
  })
);


const Approval =
  require("../src/models/Approval");

const ToolCall =
  require("../src/models/ToolCall");

const Ticket =
  require("../src/models/Ticket");

const {
  executeToolCall
} =
  require("../src/services/toolExecutionService");

const {
  approveAction,
  rejectAction
} =
  require("../src/services/approvalService");


describe("Approval workflow", () => {

  beforeEach(() => {

    jest.clearAllMocks();

    Ticket.updateOne.mockResolvedValue({
      acknowledged: true,
      modifiedCount: 1
    });

  });


  test("approves pending action and executes it", async () => {

    const toolCall = {

      action_id:
        "action_1",

      requires_human_approval:
        true,

      status:
        "approval_required",

      save:
        jest.fn()
          .mockResolvedValue()
    };


    const approval = {

      approval_id:
        "approval_1",

      action_id:
        "action_1",

      decision:
        "approved",

      reviewer_id:
        "reviewer_demo"
    };


    ToolCall.findOne
      .mockResolvedValue(
        toolCall
      );


    Approval.findOne
      .mockResolvedValue(
        null
      );


    Approval.create
      .mockResolvedValue(
        approval
      );


    executeToolCall
      .mockResolvedValue({

        toolCall: {
          ...toolCall,

          status:
            "executed"
        },

        result: {
          success:
            true
        }
      });


    const result =
      await approveAction({

        actionId:
          "action_1",

        reviewerId:
          "reviewer_demo",

        reason:
          "Looks valid."
      });


    expect(
      Approval.create
    ).toHaveBeenCalledWith(
      expect.objectContaining({

        action_id:
          "action_1",

        reviewer_id:
          "reviewer_demo",

        decision:
          "approved",

        reason:
          "Looks valid."
      })
    );


    expect(
      toolCall.status
    ).toBe("approved");


    expect(
      toolCall.save
    ).toHaveBeenCalled();


    expect(
      executeToolCall
    ).toHaveBeenCalledWith({
      actionId:
        "action_1"
    });


    expect(
      result.approval
    ).toBe(approval);

  });


  test("rejects pending action without execution", async () => {

    const toolCall = {

      action_id:
        "action_2",

      ticket_id:
        "tkt_9001",

      requires_human_approval:
        true,

      status:
        "approval_required",

      save:
        jest.fn()
          .mockResolvedValue()
    };


    const approval = {

      approval_id:
        "approval_2",

      action_id:
        "action_2",

      decision:
        "rejected",

      reviewer_id:
        "reviewer_demo"
    };


    ToolCall.findOne
      .mockResolvedValue(
        toolCall
      );


    Approval.findOne
      .mockResolvedValue(
        null
      );


    Approval.create
      .mockResolvedValue(
        approval
      );


    const result =
      await rejectAction({

        actionId:
          "action_2",

        reviewerId:
          "reviewer_demo",

        reason:
          "Insufficient evidence."
      });


    expect(
      Approval.create
    ).toHaveBeenCalledWith(
      expect.objectContaining({

        action_id:
          "action_2",

        reviewer_id:
          "reviewer_demo",

        decision:
          "rejected",

        reason:
          "Insufficient evidence."
      })
    );


    expect(
      toolCall.status
    ).toBe("rejected");


    expect(
      toolCall.error
    ).toBe(
      "Insufficient evidence."
    );


    expect(
      toolCall.save
    ).toHaveBeenCalled();


    expect(
      Ticket.updateOne
    ).toHaveBeenCalledWith(

      {
        ticket_id:
          "tkt_9001"
      },

      {
        $set: {
          status:
            "action_rejected"
        }
      }

    );


    expect(
      executeToolCall
    ).not.toHaveBeenCalled();


    expect(
      result.approval
    ).toBe(approval);

  });


  test("requires reviewer identity", async () => {

    await expect(
      approveAction({

        actionId:
          "action_1"

      })

    ).rejects.toThrow(
      "reviewerId is required"
    );

  });


  test("requires action ID", async () => {

    await expect(
      approveAction({

        reviewerId:
          "reviewer_demo"

      })

    ).rejects.toThrow(
      "actionId is required"
    );

  });

});