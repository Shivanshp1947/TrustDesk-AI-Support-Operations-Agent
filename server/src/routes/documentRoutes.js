const express = require("express");
const {searchDocuments,getDocumentById} = require("../controllers/documentController");
const router = express.Router();


// -------------------Search the TrustDesk knowledge base.--------------------
router.get("/search", searchDocuments);

// -------------------Get one knowledge-base document by ID.--------------------
router.get("/:docId", getDocumentById);






module.exports = router;