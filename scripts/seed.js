const fs = require("fs");
const path = require("path");

const connectDatabase = require("../server/src/config/db");

const Customer = require("../server/src/models/Customer");
const Order = require("../server/src/models/Order");
const Ticket = require("../server/src/models/Ticket");
const Document = require("../server/src/models/Document");

const DATA_DIR = path.join(__dirname, "..", "data");
const KNOWLEDGE_BASE_DIR = path.join(DATA_DIR, "knowledge_base");

const CUSTOMERS_FILE = path.join(DATA_DIR, "customers.json");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
const TICKETS_FILE = path.join(DATA_DIR, "tickets.json");
const TOOL_ACTIONS_FILE = path.join(DATA_DIR, "tool_actions.json");
const EVAL_CASES_FILE = path.join(DATA_DIR, "eval_cases.jsonl");

/**
 * Read and parse a JSON file.
 */
const readJsonFile = (filePath) => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const fileContent = fs.readFileSync(filePath, "utf8");

  return JSON.parse(fileContent);
};

/**
 * Read and parse a JSONL file.
 *
 * JSONL means:
 * one JSON object per line.
 */
const readJsonlFile = (filePath) => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const fileContent = fs.readFileSync(filePath, "utf8");

  return fileContent
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      try {
        return JSON.parse(line);
      } catch (error) {
        throw new Error(
          `Invalid JSON in ${path.basename(filePath)} at line ${index + 1}: ${error.message}`
        );
      }
    });
};

/**
 * Extract metadata from a TrustDesk knowledge-base Markdown file.
 *
 * Example:
 *
 * # Refund and Return Policy
 *
 * Doc ID: KB-REFUND-001
 * Audience: Customer support agents
 * Version: 2026.07
 */
const parseKnowledgeDocument = (fileName) => {
  const filePath = path.join(KNOWLEDGE_BASE_DIR, fileName);

  const content = fs.readFileSync(filePath, "utf8");

  const titleMatch = content.match(/^#\s+(.+)$/m);
  const docIdMatch = content.match(/^Doc ID:\s*(.+)$/m);
  const audienceMatch = content.match(/^Audience:\s*(.+)$/m);
  const versionMatch = content.match(/^Version:\s*(.+)$/m);

  const title = titleMatch
    ? titleMatch[1].trim()
    : fileName.replace(/\.md$/i, "");

  const docId = docIdMatch
    ? docIdMatch[1].trim()
    : null;

  const audience = audienceMatch
    ? audienceMatch[1].trim()
    : "support";

  const version = versionMatch
    ? versionMatch[1].trim()
    : "1.0";

  if (!docId) {
    throw new Error(
      `Could not find "Doc ID:" in knowledge-base file: ${fileName}`
    );
  }

  return {
    doc_id: docId,
    title,
    content,
    source_path: path
      .relative(path.join(__dirname, ".."), filePath)
      .replace(/\\/g, "/"),
    version,
    audience,
    updated_at: new Date(),
    chunks: [],
    search_terms: [],
    active: true
  };
};

/**
 * Load every Markdown file from the knowledge base.
 */
const loadKnowledgeDocuments = () => {
  if (!fs.existsSync(KNOWLEDGE_BASE_DIR)) {
    throw new Error(
      `Knowledge base directory not found: ${KNOWLEDGE_BASE_DIR}`
    );
  }

  const files = fs
    .readdirSync(KNOWLEDGE_BASE_DIR)
    .filter((fileName) => fileName.toLowerCase().endsWith(".md"))
    .sort();

  if (files.length === 0) {
    throw new Error("No Markdown files found in the knowledge base.");
  }

  return files.map(parseKnowledgeDocument);
};

/**
 * Validate the provided tool catalog.
 *
 * We keep tool_actions.json as the canonical tool catalog.
 * ToolCall documents will be created later when the agent
 * actually requests an action.
 */
const validateToolCatalog = () => {
  const tools = readJsonFile(TOOL_ACTIONS_FILE);

  if (!Array.isArray(tools)) {
    throw new Error("tool_actions.json must contain an array.");
  }

  const requiredFields = [
    "tool_name",
    "description",
    "risk_level",
    "requires_human_approval",
    "allowed_categories",
    "required_fields"
  ];

  tools.forEach((tool, index) => {
    for (const field of requiredFields) {
      if (!(field in tool)) {
        throw new Error(
          `Tool at index ${index} is missing required field: ${field}`
        );
      }
    }
  });

  return tools;
};

/**
 * Validate the evaluation dataset.
 *
 * We keep eval_cases.jsonl as the canonical evaluation dataset.
 * EvalRun documents will be created later when evaluations execute.
 */
const validateEvaluationCases = () => {
  const cases = readJsonlFile(EVAL_CASES_FILE);

  if (cases.length === 0) {
    throw new Error("eval_cases.jsonl contains no evaluation cases.");
  }

  cases.forEach((testCase, index) => {
    if (!testCase.case_id) {
      throw new Error(
        `Evaluation case at line ${index + 1} is missing case_id.`
      );
    }

    if (!testCase.ticket_id) {
      throw new Error(
        `Evaluation case ${testCase.case_id} is missing ticket_id.`
      );
    }

    if (!testCase.input) {
      throw new Error(
        `Evaluation case ${testCase.case_id} is missing input.`
      );

    }

    if (!testCase.expected) {
      throw new Error(
        `Evaluation case ${testCase.case_id} is missing expected values.`
      );
    }
  });

  return cases;
};

/**
 * Seed MongoDB.
 */
const seedDatabase = async () => {
  console.log("\n========================================");
  console.log("        TrustDesk Database Seed");
  console.log("========================================\n");

  try {
    console.log("Connecting to MongoDB...");
    await connectDatabase();

    console.log("MongoDB connection established.\n");

    // --------------------------------------------------
    // 1. Read source data
    // --------------------------------------------------

    console.log("Reading source data...");

    const customers = readJsonFile(CUSTOMERS_FILE);
    const orders = readJsonFile(ORDERS_FILE);
    const tickets = readJsonFile(TICKETS_FILE);

    const documents = loadKnowledgeDocuments();

    const tools = validateToolCatalog();
    const evaluationCases = validateEvaluationCases();

    console.log(`Customers loaded:       ${customers.length}`);
    console.log(`Orders loaded:          ${orders.length}`);
    console.log(`Tickets loaded:         ${tickets.length}`);
    console.log(`Documents loaded:       ${documents.length}`);
    console.log(`Tools validated:        ${tools.length}`);
    console.log(`Evaluation cases:       ${evaluationCases.length}`);

    // --------------------------------------------------
    // 2. Clear existing seeded collections
    // --------------------------------------------------

    console.log("\nClearing existing database records...");

    await Customer.deleteMany({});
    await Order.deleteMany({});
    await Ticket.deleteMany({});
    await Document.deleteMany({});

    console.log("Existing records cleared.");

    // --------------------------------------------------
    // 3. Insert customers
    // --------------------------------------------------

    console.log("\nSeeding customers...");

    await Customer.insertMany(customers, {
      ordered: true
    });

    console.log(`✓ ${customers.length} customers inserted.`);

    // --------------------------------------------------
    // 4. Insert orders
    // --------------------------------------------------

    console.log("Seeding orders...");

    await Order.insertMany(orders, {
      ordered: true
    });

    console.log(`✓ ${orders.length} orders inserted.`);

    // --------------------------------------------------
    // 5. Insert tickets
    // --------------------------------------------------

    console.log("Seeding tickets...");

    await Ticket.insertMany(tickets, {
      ordered: true
    });

    console.log(`✓ ${tickets.length} tickets inserted.`);

    // --------------------------------------------------
    // 6. Insert knowledge-base documents
    // --------------------------------------------------

    console.log("Seeding knowledge-base documents...");

    await Document.insertMany(documents, {
      ordered: true
    });

    console.log(`✓ ${documents.length} documents inserted.`);

    // --------------------------------------------------
    // 7. Verification
    // --------------------------------------------------

    console.log("\nVerifying database contents...");

    const customerCount = await Customer.countDocuments();
    const orderCount = await Order.countDocuments();
    const ticketCount = await Ticket.countDocuments();
    const documentCount = await Document.countDocuments();

    console.log(`Customers in MongoDB:   ${customerCount}`);
    console.log(`Orders in MongoDB:      ${orderCount}`);
    console.log(`Tickets in MongoDB:     ${ticketCount}`);
    console.log(`Documents in MongoDB:   ${documentCount}`);

    // --------------------------------------------------
    // 8. Verify important document IDs
    // --------------------------------------------------

    const refundDocument = await Document.findOne({
      doc_id: "KB-REFUND-001"
    }).lean();

    if (refundDocument) {
      console.log(
        `✓ Found KB-REFUND-001: "${refundDocument.title}"`
      );
    } else {
      console.warn(
        "⚠ KB-REFUND-001 was not found. Check the knowledge-base files."
      );
    }

    // --------------------------------------------------
    // 9. Verify important ticket
    // --------------------------------------------------

    const demoTicket = await Ticket.findOne({
      ticket_id: "tkt_9001"
    }).lean();

    if (demoTicket) {
      console.log(
        `✓ Found demo ticket: ${demoTicket.ticket_id} - ${demoTicket.subject}`
      );
    } else {
      console.warn(
        "⚠ tkt_9001 was not found. Check tickets.json."
      );
    }

    // --------------------------------------------------
    // 10. Final summary
    // --------------------------------------------------

    console.log("\n========================================");
    console.log("       Seed completed successfully");
    console.log("========================================");

    console.log("\nMongoDB collections are ready for:");

    console.log("  ✓ Ticket APIs");
    console.log("  ✓ Customer/Order lookup");
    console.log("  ✓ Knowledge retrieval");
    console.log("  ✓ AI triage");
    console.log("  ✓ Cited draft replies");
    console.log("  ✓ Tool/action workflow");
    console.log("  ✓ Guardrails");
    console.log("  ✓ Evaluation");

    console.log("\nTool catalog and evaluation dataset remain");
    console.log("as canonical files under /data.");

  } catch (error) {
    console.error("\n========================================");
    console.error("          SEED FAILED");
    console.error("========================================");

    console.error("\nError:", error.message);

    if (error.stack) {
      console.error("\nStack trace:");
      console.error(error.stack);
    }

    process.exitCode = 1;

  } finally {
    // Mongoose connection will be closed automatically
    // when the Node process exits.
  }
};

seedDatabase();