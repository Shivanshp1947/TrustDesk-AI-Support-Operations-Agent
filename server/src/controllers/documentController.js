const documentService = require("../services/documentService");

// ==============================Search the TrustDesk knowledge base ================================
const searchDocuments = async (req, res, next) => {
  try {
    const { q, limit } = req.query;

    const parsedLimit = limit
      ? Number.parseInt(limit, 10)
      : 5;

    if (!Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > 20) {
      const error = new Error("limit must be an integer between 1 and 20");
      error.statusCode = 400;
      throw error;
    }

    const documents = await documentService.searchDocuments(
      q || "",
      parsedLimit
    );

    res.status(200).json({
      success: true,
      query: q,
      count: documents.length,
      documents
    });
  } catch (error) {
    next(error);
  }
};


// ==============================Get one knowledge-base document by ID =============================
const getDocumentById = async (req, res, next) => {
  try {
    const { docId } = req.params;

    const document = await documentService.getDocumentById(docId);

    res.status(200).json({
      success: true,
      document
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {searchDocuments,getDocumentById};