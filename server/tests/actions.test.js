const {recommendAction,loadToolCatalog} = require( "../src/services/actionService");



describe("Operational action recommendation", () => {
  test("loads canonical tool catalog", () => {
    const tools = loadToolCatalog();
    expect(Array.isArray(tools)).toBe(true);


    expect(
      tools.map((tool) =>tool.tool_name)
    ).toEqual(
      expect.arrayContaining([
        "create_replacement_order",
        "start_refund_review",
        "open_carrier_investigation",
        "escalate_to_human"
      ])
    );
  });


  test("recommends replacement for damaged product", async () => {

    const result =
      await recommendAction({
        ticket: {
          ticket_id: "tkt_9001",
          subject: "Received damaged earbuds",
          body: "The earbud is cracked. Can I get a replacement?"
        },

        customer: {
          customer_id:"cus_1001"
        },

        order: {
          order_id:"ord_5001",
          total:8999,
          items: [{sku:"BG-AIRPODS-01"}]
        },

        triage: {
          category: "refund",
          priority: "medium",
          escalation: false,
          reason:"Damaged product."
        },

        draft: {
          draft: {
            recommended_actions: [
              "replacement_review"
            ]
          }
        },
        retrievedDocuments: [],
        runId:"run_9001"
      });


    expect(result.action_required).toBe(true);
    expect(result.action.tool_name).toBe("create_replacement_order");

    expect(result.action.requires_human_approval).toBe(true);


    expect(
      result.action.payload
    ).toEqual(
      expect.objectContaining({
        order_id:"ord_5001",
        sku:"BG-AIRPODS-01",
        idempotency_key:"trustdesk:tkt_9001:create_replacement_order"
      })
    );
  });


  test("recommends carrier investigation for shipping delay", async () => {

    const result =
      await recommendAction({
        ticket: {
          ticket_id:"tkt_9002",
          subject: "Package has not moved",
          body: "Tracking has not moved for 6 business days."
        },

        customer: {},
        order: {
          order_id:"ord_5002",
          tracking_number:"TRACK-5002"
        },

        triage: {
          category:"shipping",
          priority:"high",
          escalation:false
        },

        draft: {
          draft: {
            recommended_actions: [
              "shipping_review"
            ]
          }
        },

        retrievedDocuments: [],

        runId: "run_9002"
      });

    expect(result.action.tool_name).toBe("open_carrier_investigation");

    expect(result.action.requires_human_approval).toBe(false);
  });


  test("recommends refund review for duplicate billing", async () => {

    const result = await recommendAction({

        ticket: {
          ticket_id: "tkt_9008",
          subject: "Double charge",
          body: "I was charged twice for one order."
        },
        customer: {},
        order: {
          order_id:"ord_5006",
          total: 8999
        },

        triage: {
          category:"billing",
          priority:"high",
          escalation:false
        },


        draft: {
          draft: {
            recommended_actions: [
              "refund_review"
            ]
          }
        },

        retrievedDocuments: [],
        runId: "run_9008"
      });


    expect(result.action.tool_name).toBe("start_refund_review");


    expect(
      result.action.requires_human_approval
    ).toBe(true);


    expect(
      result.action.payload.amount
    ).toBe(8999);
  });


  test("escalates safety-critical cases", async () => {

    const result =
      await recommendAction({

        ticket: {

          ticket_id:
            "tkt_9004",

          subject:
            "Swollen battery",

          body:
            "The tablet battery is swelling."
        },


        customer: {},

        order: {},


        triage: {

          category:
            "warranty",

          priority:
            "urgent",

          escalation:
            true,

          reason:
            "Safety issue."
        },


        draft: {

          draft: {

            recommended_actions: [
              "human_escalation"
            ]
          }
        },


        retrievedDocuments: [],

        runId:
          "run_9004"
      });


    expect(
      result.action.tool_name
    ).toBe(
      "escalate_to_human"
    );


    expect(
      result.action.requires_human_approval
    ).toBe(false);
  });


  test("does not recommend refund for final-sale software", async () => {

    const result =
      await recommendAction({

        ticket: {

          ticket_id:
            "tkt_9003",

          subject:
            "Refund cloud backup license",

          body:
            "Please refund my software license."
        },


        customer: {},


        order: {

          order_id: "ord_5004",
          items: [
            {
              name: "Cloud Backup Annual License",
              category: "software",
              final_sale: true
            }
          ]
        },


        triage: {
          category: "refund",
          priority:"low",
          escalation:false
        },

        draft: {
          draft: {
            recommended_actions: [
              "refund_review"
            ]
          }
        },

        retrievedDocuments: [],
        runId: "run_9003"
      });

    expect(result.action_required).toBe(false);
    expect(result.action).toBeNull();
  });
});