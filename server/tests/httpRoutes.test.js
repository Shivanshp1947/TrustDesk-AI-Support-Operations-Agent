const request =
  require("supertest");


jest.mock("../src/config/env", () => ({
  clientUrl:
    "http://localhost:5173",

  demoToken:
    "test-token",

  aiProvider:
    "mock"
}));


jest.mock(
  "../src/services/ticketService",
  () => ({
    getTickets:
      jest.fn(),

    getTicketById:
      jest.fn()
  })
);


jest.mock(
  "../src/services/documentService",
  () => ({
    searchDocuments:
      jest.fn(),

    getDocumentById:
      jest.fn()
  })
);


jest.mock(
  "../src/services/triageService",
  () => ({
    triageTicket:
      jest.fn()
  })
);


jest.mock(
  "../src/services/draftService",
  () => ({
    generateDraft:
      jest.fn()
  })
);


jest.mock(
  "../src/services/approvalService",
  () => ({
    approveAction:
      jest.fn(),

    rejectAction:
      jest.fn()
  })
);


jest.mock(
  "../src/services/traceService",
  () => ({
    getTraceByRunId:
      jest.fn(),

    updateTraceAfterAction:
      jest.fn()
        .mockResolvedValue(null)
  })
);


jest.mock(
  "../src/services/evaluationService",
  () => ({
    startEvaluation:
      jest.fn(),

    getEvaluationRun:
      jest.fn()
  })
);


jest.mock(
  "../src/agent/trustDeskGraph",
  () => ({
    trustDeskGraph: {

      invoke:
        jest.fn()
    }
  })
);


jest.mock(
  "../src/models/ToolCall",
  () => ({
    findOne:
      jest.fn()
  })
);


const app =
  require("../src/app");


const ticketService =
  require(
    "../src/services/ticketService"
  );


const documentService =
  require(
    "../src/services/documentService"
  );


const triageService =
  require(
    "../src/services/triageService"
  );


const draftService =
  require(
    "../src/services/draftService"
  );


const approvalService =
  require(
    "../src/services/approvalService"
  );


const traceService =
  require(
    "../src/services/traceService"
  );


const evaluationService =
  require(
    "../src/services/evaluationService"
  );


const {
  trustDeskGraph
} =
  require(
    "../src/agent/trustDeskGraph"
  );


const ToolCall =
  require(
    "../src/models/ToolCall"
  );


const auth = {
  Authorization:
    "Bearer test-token"
};


describe("TrustDesk HTTP API", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });


  test("GET /health is public", async () => {

    const response =
      await request(app)
        .get("/health");


    expect(
      response.status
    ).toBe(200);


    expect(
      response.body
    ).toEqual({

      success:
        true,

      message:
        "TrustDesk API is running"
    });
  });


  test("protected route rejects missing authentication", async () => {

    const response =
      await request(app)
        .get("/tickets");


    expect(
      response.status
    ).toBe(401);
  });


  test("GET /tickets works", async () => {

    ticketService
      .getTickets
      .mockResolvedValue([
        {
          ticket_id:
            "tkt_9001"
        }
      ]);


    const response =
      await request(app)
        .get("/tickets")
        .set(auth);


    expect(
      response.status
    ).toBe(200);


    expect(
      response.body.count
    ).toBe(1);


    expect(
      response.body.tickets[0].ticket_id
    ).toBe(
      "tkt_9001"
    );
  });


  test("GET /tickets/:ticketId works", async () => {

    ticketService
      .getTicketById
      .mockResolvedValue({

        ticket: {
          ticket_id:
            "tkt_9001"
        },

        customer: {
          customer_id:
            "cus_1001"
        },

        order: {
          order_id:
            "ord_5001"
        }
      });


    const response =
      await request(app)
        .get(
          "/tickets/tkt_9001"
        )
        .set(auth);


    expect(
      response.status
    ).toBe(200);


    expect(
      response.body.ticket.ticket_id
    ).toBe(
      "tkt_9001"
    );
  });


  test("GET /documents/search works", async () => {

    documentService
      .searchDocuments
      .mockResolvedValue([
        {
          doc_id:
            "KB-REFUND-001"
        }
      ]);


    const response =
      await request(app)
        .get(
          "/documents/search?q=refund"
        )
        .set(auth);


    expect(
      response.status
    ).toBe(200);


    expect(
      response.body.count
    ).toBe(1);


    expect(
      response.body.documents[0].doc_id
    ).toBe(
      "KB-REFUND-001"
    );
  });


  test("POST /tickets/:ticketId/triage works", async () => {

    triageService
      .triageTicket
      .mockResolvedValue({

        ticket_id:
          "tkt_9002",

        triage: {

          category:
            "shipping",

          priority:
            "high",

          sentiment:
            "frustrated",

          escalation:
            false
        }
      });


    const response =
      await request(app)
        .post(
          "/tickets/tkt_9002/triage"
        )
        .set(auth);


    expect(
      response.status
    ).toBe(200);


    expect(
      response.body.triage.category
    ).toBe(
      "shipping"
    );
  });


  test("POST /tickets/:ticketId/draft works", async () => {
    draftService
      .generateDraft
      .mockResolvedValue({
        ticket_id:"tkt_9001",
        draft: {
          draft_id:"draft_1",
          body:"Grounded response.",
          citations: [
            {
              doc_id:"KB-REFUND-001"
            }
          ]
        }
      });


    const response = await request(app)
        .post("/tickets/tkt_9001/draft")
        .set(auth);

    expect(response.status).toBe(200);

    expect(response.body.draft.draft_id).toBe("draft_1");
  });


  test("GET /actions/:actionId works", async () => {
    ToolCall.findOne
      .mockResolvedValue({
        action_id:"action_1",
        status:"approval_required"
      });


    const response = await request(app)
        .get("/actions/action_1")
        .set(auth);

    expect(response.status).toBe(200);
    expect(response.body.toolCall.action_id).toBe("action_1");
  });


  test("POST /actions/:actionId/approve works", async () => {
    approvalService
      .approveAction
      .mockResolvedValue({
        approval: {
          action_id:"action_1",
          decision:"approved"
        },

        toolCall: {
          action_id:"action_1",
          status:"executed"
        },
        result: {
          success:true
        }
      });


    const response = await request(app)
        .post("/actions/action_1/approve")
        .set(auth)
        .send({
          reason:
            "Approved for test."
        });

    expect(response.status).toBe(200);


    expect(approvalService.approveAction)
    .toHaveBeenCalledWith({
      actionId:"action_1",
      reviewerId:"reviewer_demo",
      reason:"Approved for test."
    });
  });


  test("POST /actions/:actionId/reject works", async () => {
    approvalService
      .rejectAction
      .mockResolvedValue({
        approval: {
          action_id:"action_2",
          decision:"rejected"
        },

        toolCall: {
          action_id:"action_2",
          status:"rejected"
        }
      });


    const response = await request(app)
        .post("/actions/action_2/reject")
        .set(auth)
        .send({
          reason:"Rejected for test."
        });

    expect(response.status).toBe(200);
    expect(approvalService.rejectAction).toHaveBeenCalled();
  });


  test("GET /traces/:runId works", async () => {
    traceService
      .getTraceByRunId
      .mockResolvedValue({
        run_id:"run_1",
        ticket_id:"tkt_9001"
      });


    const response = await request(app)
        .get("/traces/run_1")
        .set(auth);

    expect(response.status).toBe(200);
    expect(response.body.trace.run_id).toBe("run_1");
  });


  test("POST /eval/run works", async () => {
    evaluationService
      .startEvaluation
      .mockResolvedValue({
        eval_run_id:"eval_run_1",
        status:"started"
      });


    const response = await request(app)
        .post("/eval/run")
        .set(auth);

    expect(response.status).toBe(202);
    expect(response.body.eval_run_id).toBe("eval_run_1");
  });


  test("GET /eval/:evalRunId works", async () => {
    evaluationService
      .getEvaluationRun
      .mockResolvedValue({
        eval_run_id:"eval_run_1",
        status:"completed"
      });


    const response = await request(app)
        .get("/eval/eval_run_1")
        .set(auth);

    expect(response.status).toBe(200);
    expect(response.body.evaluation.status).toBe("completed");
  });

  test("POST /agent-runs rejects missing ticket_id", async () => {
    const response = await request(app)
        .post("/agent-runs")
        .set(auth)
        .send({});

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("ticket_id is required.");
    expect(trustDeskGraph.invoke).not.toHaveBeenCalled();
  });


  test("POST /agent-runs invokes TrustDesk graph", async () => {
    trustDeskGraph
      .invoke
      .mockResolvedValue({
        finalStatus:"approval_required"
      });

    const response =await request(app)
        .post("/agent-runs")
        .set(auth)
        .send({ticket_id:"tkt_9001"});


    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    expect(response.body.agentRun.finalStatus).toBe("approval_required");

    expect(trustDeskGraph.invoke).toHaveBeenCalledWith({
      ticketId:"tkt_9001"
    });
  });


  test("unknown route returns 404", async () => {
    const response = await request(app)
        .get("/does-not-exist")
        .set(auth);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      success:false,
      message:"Route not found"
    });
  });
});