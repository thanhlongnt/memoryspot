const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/auth");

process.env.JWT_SECRET = "test-secret";

function makeReqRes(token, via = "header") {
  const req = {
    headers: via === "header" ? { authorization: `Bearer ${token}` } : {},
    cookies: via === "cookie" ? { token } : {},
  };
  const res = {
    statusCode: 200,
    json: jest.fn().mockReturnThis(),
    status: jest.fn().mockReturnThis(),
  };
  // chain status().json()
  res.status.mockImplementation((code) => {
    res.statusCode = code;
    return res;
  });
  return { req, res };
}

describe("authMiddleware", () => {
  const userId = "64a0000000000000000000ab";
  let validToken;

  beforeAll(() => {
    validToken = jwt.sign({ userId }, "test-secret", { expiresIn: "1h" });
  });

  it("sets req.userId and calls next() for a valid Bearer token", () => {
    const { req, res } = makeReqRes(validToken, "header");
    const next = jest.fn();
    authMiddleware(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(req.userId).toBe(userId);
  });

  it("sets req.userId from a valid cookie token", () => {
    const { req, res } = makeReqRes(validToken, "cookie");
    const next = jest.fn();
    authMiddleware(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(req.userId).toBe(userId);
  });

  it("returns 401 when no token is provided", () => {
    const req = { headers: {}, cookies: {} };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    authMiddleware(req, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("returns 401 for an invalid token", () => {
    const { req, res } = makeReqRes("invalid.token.here", "header");
    authMiddleware(req, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("returns 401 for an expired token", () => {
    const expired = jwt.sign({ userId }, "test-secret", { expiresIn: "-1s" });
    const { req, res } = makeReqRes(expired, "header");
    authMiddleware(req, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(401);
  });
});
