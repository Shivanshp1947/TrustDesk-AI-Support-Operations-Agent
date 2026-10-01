jest.mock("../src/models/Ticket", () => ({
  findOne: jest.fn()
}));

jest.mock("../src/models/Customer", () => ({
  findOne: jest.fn()
}));

jest.mock("../src/models/Order", () => ({
  findOne: jest.fn()
}));

jest.mock("../src/models/Draft", () => ({
  create: jest.fn()
}));

jest.mock("../src/services/retrievalService", () => ({
  searchDocuments: jest.fn()
}));

jest.mock("../src/ai/aiProvider", () => ({
  getAIProvider: jest.fn()
}));

jest.mock("../src/config/env", () => ({
  aiProvider: "mock"
}));

const Ticket = require("../src/models/Ticket");
const Customer = require("../src/models/Customer");
const Order = require("../src/models/Order");
const Draft = require("../src/models/Draft");
const retrievalService = require("../src/services/retrievalService");

const {getAIProvider} = require("../src/ai/aiProvider");
const draftService =require("../src/services/draftService");

describe("Draft generation", () => {
  const ticket = {
    ticket_id: "tkt_9001",
    customer_id:"cus_1001",
    order_id:"ord_5001",
    subject:"Received damaged earbuds",
    body:"My earbuds arrived damaged. Can I get a replacement?"
  };

  const documents = [
    {
      doc_id:"KB-REFUND-001",
      title:"Refund Policy",
      content:"Damaged items may qualify for replacement review."
    }
  ];


  beforeEach(() => {
    jest.clearAllMocks();

    Ticket.findOne.mockReturnValue({
      lean:jest.fn().mockResolvedValue(ticket)
    });


    Customer.findOne.mockReturnValue({
      lean:jest.fn().mockResolvedValue({
            customer_id:"cus_1001",
            name:"Aisha Rao"
          })
    });

    Order.findOne.mockReturnValue({
      lean:jest.fn().mockResolvedValue({
            order_id:"ord_5001",
            total:8999,
            items: [{
                sku:"BG-AIRPODS-01"
              }]
          })
    });

    retrievalService.searchDocuments.mockResolvedValue(documents);

    Draft.create.mockImplementation(async (data) => ({
          ...data,
          created_at:new Date()
        })
      );


    getAIProvider
    .mockReturnValue({
        generateDraft:jest.fn().mockResolvedValue({
              body:"We are sorry that your product arrived damaged. A replacement can be reviewed. Please provide a clear photo of the damaged item.",
              recommended_actions:["replacement_review"]
            })
      });
  });


  test("generates and stores grounded draft", async () => {
    const result = await draftService.generateDraft("tkt_9001");

    expect(result.ticket_id).toBe("tkt_9001");

    expect(result.draft.body).toContain("damaged");


    expect(result.draft.citations).toEqual([
      {
        doc_id:"KB-REFUND-001",
        title:"Refund Policy",
        excerpt:documents[0].content
      }
    ]);

    expect(result.retrieved_doc_ids).toEqual(["KB-REFUND-001"]);

    expect(Draft.create).toHaveBeenCalledWith(
      expect.objectContaining(
        {
          ticket_id:"tkt_9001",
          status:"generated",
          generated_by:"ai"
        }
      )
    );
  });


  test("adds deterministic information when damaged-product AI draft is incomplete", async () => {
    getAIProvider.mockReturnValue({
        generateDraft:jest.fn().mockResolvedValue({
              body:"Sorry about the issue.",
              recommended_actions:[]
            })
      });


    const result =await draftService.generateDraft("tkt_9001");

    expect(result.draft.body).toContain("damaged");

    expect(result.draft.body).toContain("replacement");

    expect(result.draft.body).toContain("photo");
  });

  test("rejects unknown ticket", async () => {
    Ticket.findOne.mockReturnValue({
      lean:jest.fn().mockResolvedValue(null)
    });

    await expect(draftService.generateDraft("tkt_unknown"))
    .rejects.toMatchObject({
      statusCode: 404
    });
  });


  test("requires retrieved documents to be an array", async () => {
    await expect(draftService.generateDraftFromContext({
        ticket,
        customer: null,
        order: null,
        retrievedDocuments:"not-an-array",
        runId:"run_test"
      })
    ).rejects.toMatchObject({
      statusCode: 400
    });
  });
});