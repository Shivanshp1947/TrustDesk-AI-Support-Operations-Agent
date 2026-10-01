jest.mock("../src/models/Ticket", () => ({
  find: jest.fn(),
  findOne: jest.fn()
}));

jest.mock("../src/models/Customer", () => ({
  findOne: jest.fn()
}));

jest.mock("../src/models/Order", () => ({
  findOne: jest.fn()
}));

const Ticket = require("../src/models/Ticket");
const Customer = require("../src/models/Customer");
const Order = require("../src/models/Order");

const ticketService = require("../src/services/ticketService");

describe("Ticket service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns ticket queue sorted by newest first", async () => {
    const tickets = [
      {
        ticket_id: "tkt_9002"
      },
      {
        ticket_id: "tkt_9001"
      }
    ];

    const query = {
      sort: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(
        tickets
      )
    };

    Ticket.find.mockReturnValue(query);
    const result = await ticketService.getTickets();

    expect(Ticket.find).toHaveBeenCalledWith({});
    expect(query.sort)
      .toHaveBeenCalledWith({
        created_at: -1
      });

    expect(result).toEqual(tickets);
  });

  test("returns ticket with customer and order", async () => {
    const ticket = {
      ticket_id: "tkt_9001",
      customer_id: "cus_1001",
      order_id: "ord_5001"
    };

    const customer = {
      customer_id: "cus_1001",
      name: "Aisha Rao"
    };

    const order = {
      order_id: "ord_5001",
      status: "delivered"
    };

    Ticket.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue(ticket)
    });

    Customer.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue(customer)
    });

    Order.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue(order)
    });

    const result = await ticketService.getTicketById("tkt_9001");

    expect(result).toEqual({
      ticket,
      customer,
      order
    });
  });

  test("throws 404 when ticket does not exist", async () => {
    Ticket.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue(null)
    });

    await expect(ticketService.getTicketById("tkt_unknown")
    ).rejects.toMatchObject({
      statusCode: 404
    });
  });
});