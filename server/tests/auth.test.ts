import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import authMiddleware from "../src/middleware/auth";

process.env.JWT_SECRET = "test-secret";

interface MockReq {
  headers: Record<string, string>;
  cookies: Record<string, string>;
  userId?: string;
}

interface MockRes {
  statusCode: number;
  json: jest.Mock;
  status: jest.Mock;
}

function makeReqRes(
  token: string,
  via: "header" | "cookie" = "header"
): { req: MockReq; res: MockRes } {
  const req: MockReq = {
    headers: via === "header" ? { authorization: `Bearer ${token}` } : {},
    cookies: via === "cookie" ? { token } : {},
  };
  const res: MockRes = {
    statusCode: 200,
    json: jest.fn().mockReturnThis(),
    status: jest.fn().mockReturnThis(),
  };
  res.status.mockImplementation((code: number) => {
    res.statusCode = code;
    return res;
  });
  return { req, res };
}

describe("authMiddleware", () => {
  const userId = "64a0000000000000000000ab";
  let validToken: string;

  beforeAll(() => {
    validToken = jwt.sign({ userId }, "test-secret", { expiresIn: "1h" });
  });

  it("sets req.userId and calls next() for a valid Bearer token", () => {
    const { req, res } = makeReqRes(validToken, "header");
    const next = jest.fn();
    authMiddleware(
      req as unknown as Request,
      res as unknown as Response,
      next as NextFunction
    );
    expect(next).toHaveBeenCalledTimes(1);
    expect(req.userId).toBe(userId);
  });

  it("sets req.userId from a valid cookie token", () => {
    const { req, res } = makeReqRes(validToken, "cookie");
    const next = jest.fn();
    authMiddleware(
      req as unknown as Request,
      res as unknown as Response,
      next as NextFunction
    );
    expect(next).toHaveBeenCalledTimes(1);
    expect(req.userId).toBe(userId);
  });

  it("returns 401 when no token is provided", () => {
    const req = { headers: {}, cookies: {} } as unknown as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    authMiddleware(req, res, jest.fn() as unknown as NextFunction);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("returns 401 for an invalid token", () => {
    const { req, res } = makeReqRes("invalid.token.here", "header");
    authMiddleware(
      req as unknown as Request,
      res as unknown as Response,
      jest.fn() as unknown as NextFunction
    );
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("returns 401 for an expired token", () => {
    const expired = jwt.sign({ userId }, "test-secret", { expiresIn: "-1s" });
    const { req, res } = makeReqRes(expired, "header");
    authMiddleware(
      req as unknown as Request,
      res as unknown as Response,
      jest.fn() as unknown as NextFunction
    );
    expect(res.status).toHaveBeenCalledWith(401);
  });
});
