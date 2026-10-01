const {
  StateGraph,
  START,
  END
} = require("@langchain/langgraph");


const {
  TrustDeskState
} = require("./state");


const {
  loadContext
} = require("./nodes/loadContext");


const {
  retrievePolicy
} = require("./nodes/retrievePolicy");


const {
  runTriage
} = require("./nodes/triage");


const {
  runDraftGeneration
} = require("./nodes/draftGeneration");


const {
  runActionRecommendation
} = require(
  "./nodes/actionRecommendation"
);


const {
  runGuardrailCheck
} = require(
  "./nodes/guardrailCheck"
);


const {
  runActionExecution
} = require(
  "./nodes/actionExecution"
);

const {
  runTrace
} = require(
  "./nodes/trace"
);

/*
 * ============================================================
 * TrustDesk LangGraph
 * ============================================================
 *
 * Current workflow:
 *
 * START
 *   ↓
 * loadContext
 *   ↓
 * retrievePolicy
 *   ↓
 * runTriage
 *   ↓
 * runDraftGeneration
 *   ↓
 * runActionRecommendation
 *   ↓
 * runGuardrailCheck
 *   ↓
 * END
 */


const graphBuilder =
  new StateGraph(
    TrustDeskState
  );


/*
 * ------------------------------------------------------------
 * Register nodes
 * ------------------------------------------------------------
 */

graphBuilder

  .addNode(
    "loadContext",
    loadContext
  )

  .addNode(
    "retrievePolicy",
    retrievePolicy
  )

  .addNode(
    "runTriage",
    runTriage
  )

  .addNode(
    "runDraftGeneration",
    runDraftGeneration
  )

  .addNode(
    "runActionRecommendation",
    runActionRecommendation
  )

  .addNode(
    "runGuardrailCheck",
    runGuardrailCheck
  )

  .addNode(
    "runActionExecution",
    runActionExecution
  )

  .addNode(
    "runTrace",
    runTrace
  );


/*
 * ------------------------------------------------------------
 * Define workflow
 * ------------------------------------------------------------
 */

graphBuilder

  .addEdge(
    START,
    "loadContext"
  )

  .addEdge(
    "loadContext",
    "retrievePolicy"
  )

  .addEdge(
    "retrievePolicy",
    "runTriage"
  )

  .addEdge(
    "runTriage",
    "runDraftGeneration"
  )

  .addEdge(
    "runDraftGeneration",
    "runActionRecommendation"
  )

  .addEdge(
    "runActionRecommendation",
    "runGuardrailCheck"
  )

  .addEdge(
    "runGuardrailCheck",
    "runActionExecution"
  )

  .addEdge(
    "runActionExecution",
    "runTrace"
  )

  .addEdge(
    "runTrace",
    END
  );


/*
 * ------------------------------------------------------------
 * Compile graph
 * ------------------------------------------------------------
 */

const trustDeskGraph =
  graphBuilder.compile();


module.exports = {
  trustDeskGraph
};