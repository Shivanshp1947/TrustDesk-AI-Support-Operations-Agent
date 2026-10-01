const Document = require("../models/Document");
const retrievalService = require("./retrievalService");


// ----------Search the knowledge base for documents matching the query.-------------------
const searchDocuments = async (query, limit = 5) => {
  return retrievalService.searchDocuments(query, limit);
};



// -----------Get a knowledge-base document by its official doc_id.-----------------
const getDocumentById = async (docId) => {
    const document = await Document.findOne({
        doc_id: docId,
        active: true
    }).lean();

    if (!document) {
        const error = new Error(`Document not found: ${docId}`);
        error.statusCode = 404;
        throw error;
    }

    return document;
};

module.exports = {searchDocuments,getDocumentById};