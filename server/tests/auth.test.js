jest.mock("../src/config/env", () => ({
  demoToken: "test-token"
}));

const { requireAuth } = require("../src/middleware/auth");

describe("Authentication middleware", () => {
  const makeResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);

    return res;
  };

  test("rejects request without Authorization header", () => {
    const req = {
      headers: {}
    };

    const res = makeResponse();
    const next = jest.fn();

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Authentication required."
    });

    expect(next).not.toHaveBeenCalled();
  });

  test("rejects malformed Authorization header", () => {
    const req = {
      headers: {
        authorization: "Basic abc"
      }
    };
    const res = makeResponse();
    const next = jest.fn();
    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message:
        "Use Authorization: Bearer <token>."
    });
    expect(next).not.toHaveBeenCalled();
  });


  test("rejects invalid token", () => {
    const req = {
      headers: {
        authorization: "Bearer wrong-token"
      }
    };
    const res = makeResponse();
    const next = jest.fn();
    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message:
        "Invalid authentication token."
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("accepts valid token", () => {
    const req = {
      headers: {
        authorization: "Bearer test-token"
      }
    };
    const res = makeResponse();
    const next = jest.fn();
    requireAuth(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toEqual({reviewerId: "reviewer_demo"});
  });
});