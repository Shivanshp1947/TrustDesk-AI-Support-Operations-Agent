const Document = require("../models/Document");

// Search the TrustDesk knowledge base.
// MongoDB text search is used because the Document model
// contains a text index on title and content.
const searchDocuments = async (query, limit = 5) => {
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
        const error = new Error("Search query is required");
        error.statusCode = 400;
        throw error;
    }

    const documents = await Document.find(
        {$text: {
            $search: normalizedQuery
        },active: true},
        {score: {
            $meta: "textScore"
        }})
    .sort({
        score: {
            $meta: "textScore"
        }
    }).limit(limit).lean();

  return documents;
};

module.exports = {searchDocuments};