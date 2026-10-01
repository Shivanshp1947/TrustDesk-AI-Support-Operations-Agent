jest.mock("../src/models/Document", () => ({
  find: jest.fn(),
  findOne: jest.fn()
}));

const Document = require("../src/models/Document");
const retrievalService = require("../src/services/retrievalService");
const documentService = require("../src/services/documentService");

describe("Knowledge retrieval", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });


  test("rejects empty search query", async () => {
    await expect(
      retrievalService.searchDocuments(
        "   ",5)
    ).rejects.toMatchObject({
      statusCode: 400,
      message: "Search query is required"
    });

    expect(Document.find).not.toHaveBeenCalled();
  });



  test("performs MongoDB text search", async () => {
    const documents = [
      {
        doc_id: "KB-REFUND-001",
        title: "Refund Policy"
      }
    ];

    const query = {
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(documents)
    };

    Document.find.mockReturnValue(query);

    const result = await retrievalService.searchDocuments(
        "refund return",5
      );

    expect(Document.find)
      .toHaveBeenCalledWith(
        {
          $text: {
            $search: "refund return"
          },

          active: true
        },

        {
          score: {
            $meta: "textScore"
          }
        }
      );

    expect(query.sort).toHaveBeenCalledWith({
        score: {
          $meta: "textScore"
        }
      });

    expect(query.limit).toHaveBeenCalledWith(5);
    expect(result).toEqual(documents);
  });

  test("gets document by doc_id", async () => {
    const document = {
      doc_id: "KB-REFUND-001",
      active: true
    };

    Document.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue(document)
    });

    const result = await documentService.getDocumentById("KB-REFUND-001");

    expect(result).toEqual(document);
    expect(Document.findOne)
      .toHaveBeenCalledWith({
        doc_id: "KB-REFUND-001",
        active: true
      });
  });

  test("returns 404 for missing document", async () => {
    Document.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue(null)
    });

    await expect(
      documentService.getDocumentById(
        "KB-NOT-FOUND"
      )
    ).rejects.toMatchObject({
      statusCode: 404
    });
  });
});