const mongoose = require("mongoose");

const env = require("../config/env");

const {
  trustDeskGraph
} = require("./trustDeskGraph");

const TEST_TICKET_ID =
  process.argv[2] || "tkt_9001";

const run = async () => {
  try {
    /*
     * --------------------------------------------------------
     * Validate environment
     * --------------------------------------------------------
     */

    if (!env.mongodbUrl) {
      throw new Error(
        "MONGODB_URI is missing from the project root .env file"
      );
    }

    /*
     * --------------------------------------------------------
     * Connect to MongoDB
     * --------------------------------------------------------
     */

    await mongoose.connect(
      env.mongodbUrl
    );

    console.log(
      "\n========================================"
    );

    console.log(
      "TrustDesk LangGraph Test"
    );

    console.log(
      "========================================\n"
    );

    console.log(
      "Ticket ID:",
      TEST_TICKET_ID
    );

    /*
     * --------------------------------------------------------
     * Invoke LangGraph
     * --------------------------------------------------------
     */

    const result =
      await trustDeskGraph.invoke({
        ticketId: TEST_TICKET_ID
      });

    /*
     * --------------------------------------------------------
     * Basic execution information
     * --------------------------------------------------------
     */

    console.log(
      "\nLangGraph execution successful.\n"
    );

    console.log(
      "Run ID:",
      result.runId
    );

    console.log(
      "Ticket ID:",
      result.ticket?.ticket_id
    );

    console.log(
      "Customer ID:",
      result.customer?.customer_id ||
        "none"
    );

    console.log(
      "Order ID:",
      result.order?.order_id ||
        "none"
    );

    /*
     * --------------------------------------------------------
     * Retrieved documents
     * --------------------------------------------------------
     */

    console.log(
      "\nRetrieved Documents:"
    );

    if (
      Array.isArray(
        result.retrievedDocuments
      ) &&
      result.retrievedDocuments.length > 0
    ) {
      result.retrievedDocuments.forEach(
        (document, index) => {
          console.log(
            `${index + 1}. ${document.doc_id}`
          );
        }
      );
    } else {
      console.log(
        "No documents retrieved"
      );
    }

    /*
     * --------------------------------------------------------
     * Triage
     * --------------------------------------------------------
     */

    console.log(
      "\nTriage:"
    );

    if (result.triage) {
      console.log(
        JSON.stringify(
          result.triage,
          null,
          2
        )
      );
    } else {
      console.log(
        "No triage result"
      );
    }


    /*
    * --------------------------------------------------------
    * Draft
    * --------------------------------------------------------
    */

    console.log("\nDraft:");

    if (result.draft) {
        console.log(JSON.stringify(result.draft,null,2));
    } else {
        console.log("No draft generated");
    }

    /*
    * --------------------------------------------------------
    * Action Recommendation
    * --------------------------------------------------------
    */

    console.log("\nRecommended Action:");

    if (result.recommendedAction) {
        console.log(JSON.stringify(result.recommendedAction,null,2));
    } else {
        console.log("No action recommendation");
    }

    /*
    * --------------------------------------------------------
    * Guardrail Result
    * --------------------------------------------------------
    */

    console.log("\nGuardrail Result:");

    if (result.guardrailResult) {
        console.log(JSON.stringify(result.guardrailResult,null,2));
    } else {
        console.log("No guardrail result");
    }


    /*
    * --------------------------------------------------------
    * ToolCall
    * --------------------------------------------------------
    */

    console.log("\nToolCall:");

    if (result.toolCall) {
      console.log(JSON.stringify(result.toolCall,null,2));
    } else {
      console.log("No ToolCall created");
    }


    /*
    * --------------------------------------------------------
    * Tool Result
    * --------------------------------------------------------
    */

    console.log("\nTool Result:");

    if (result.toolResult) {
      console.log(JSON.stringify(result.toolResult,null,2));
    } else {
      console.log("No Tool Result yet");
    }


    /*
    * --------------------------------------------------------
    * Final Status
    * --------------------------------------------------------
    */

    console.log("\nFinal Status:");

    console.log(result.finalStatus ||"unknown");


    /*
    * --------------------------------------------------------
    * Trace
    * --------------------------------------------------------
    */

    console.log("\nTrace:");

    if (result.trace) {
      console.log(JSON.stringify(result.trace, null, 2));
    } else {
      console.log("No trace generated");
    }


    /*
     * --------------------------------------------------------
     * Final state summary
     * --------------------------------------------------------
     */

    console.log("\n========================================");

    console.log("Graph test completed");

    console.log("========================================\n");

  } catch (error) {

    console.error(
      "\nLangGraph test failed:"
    );

    console.error(error.message);

    if (error.stack) {
      console.error("\nStack:");
      console.error(error.stack);
    }

    process.exitCode = 1;

  } finally {

    if (
      mongoose.connection.readyState !== 0
    ) {
      await mongoose.disconnect();
    }

  }
};

run();