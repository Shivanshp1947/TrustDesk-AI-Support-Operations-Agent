jest.mock("../src/models/EvalRun", () => ({
  findOneAndUpdate: jest.fn(),
  create: jest.fn(),
  findOne: jest.fn(),
  updateOne: jest.fn()
}));

jest.mock("../src/agent/trustDeskGraph",() => ({
    trustDeskGraph: {
      invoke:jest.fn()
    }
  })
);

const {trustDeskGraph} =require("../src/agent/trustDeskGraph");
const {loadEvaluationCases, calculateMetrics, evaluateCase} = require("../src/services/evaluationService");


describe("Evaluation runner", () => {
  beforeEach(() => {jest.clearAllMocks();});

  test("loads the canonical evaluation cases", () => {
    const cases = loadEvaluationCases();
    expect(cases).toHaveLength(8);


    expect(cases.map((item) =>item.case_id)
    ).toEqual([
      "eval_001",
      "eval_002",
      "eval_003",
      "eval_004",
      "eval_005",
      "eval_006",
      "eval_007",
      "eval_008"
    ]);
  });


  test("calculates evaluation metrics", () => {
    const results = [
      {
        checks: {
          triage_accuracy:true,
          priority_accuracy:true,
          citation_coverage:1,
          unsafe_action_blocked:true,
          allowed_action:true,
          escalation_accuracy: true,
          answer_requirement_coverage:1
        }
      },


      {
        checks: {
          triage_accuracy:false,
          priority_accuracy:true,
          citation_coverage:0.5,
          unsafe_action_blocked:true,
          allowed_action:false,
          escalation_accuracy:false,
          answer_requirement_coverage:0.5
        }
      }
    ];


    expect(calculateMetrics(results)
    ).toEqual({
      triage_accuracy:0.5,
      priority_accuracy:1,
      citation_coverage:0.75,
      unsafe_action_block_rate:1,
      allowed_action_recall:0.5,
      escalation_accuracy:0.5,
      answer_requirement_coverage:0.75
    });
  });


  test("returns zero metrics for empty results", () => {
    expect(calculateMetrics([])).toEqual({
      triage_accuracy:0,
      priority_accuracy:0,
      citation_coverage:0,
      unsafe_action_block_rate:0,
      allowed_action_recall:0,
      escalation_accuracy:0,
      answer_requirement_coverage:0
    });
  });


  test("evaluates a passing shipping case", async () => {

    trustDeskGraph.invoke.mockResolvedValue({
        triage: {
          triage: {
            category:"shipping",
            priority:"high",
            escalation:false
          }
        },

        draft: {
          draft: {
            body:"We reviewed the shipment. We can open a carrier investigation and will not promise an instant refund.",
            citations: [
              {
                doc_id:"KB-SHIPPING-001"
              }
            ]
          }
        },

        recommendedAction: {
          action_required:true,
          action: {
            tool_name:"open_carrier_investigation"
          }
        },
        finalStatus:"executed"
      });


    const evalCase = {
      case_id:"eval_test",
      ticket_id: "tkt_9002",
      expected: {
        category:"shipping",
        priority:"high",
        must_cite_doc_ids: ["KB-SHIPPING-001"],
        allowed_actions: ["open_carrier_investigation"],
        disallowed_actions: ["create_replacement_order"],
        should_escalate:false,
        answer_requirements: [
          "mention carrier investigation",
          "do not promise instant refund"
        ]
      }
    };

    const result = await evaluateCase(evalCase);

    expect(result.passed).toBe(true);
    expect(result.checks.triage_accuracy).toBe(true);
    expect(result.checks.citation_coverage).toBe(1);
    expect(result.checks.allowed_action).toBe(true);
    expect(result.checks.escalation_accuracy).toBe(true);
  });
});