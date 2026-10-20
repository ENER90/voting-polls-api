import { generateToken, verifyToken } from "../src/utils/jwt";
import { AppError } from "../src/utils/AppError";

describe("jwt utils", () => {
  const OLD = process.env.JWT_SECRET;
  beforeAll(() => { process.env.JWT_SECRET = "test-only-secret"; });
  afterAll(() => { process.env.JWT_SECRET = OLD; });

  it("round-trips a payload", () => {
    const token = generateToken({ userId: "u1", email: "a@b.c", role: "user" });
    const decoded = verifyToken(token);
    expect(decoded.userId).toBe("u1");
    expect(decoded.role).toBe("user");
  });

  it("rejects a tampered token", () => {
    const token = generateToken({ userId: "u1", email: "a@b.c", role: "user" });
    expect(() => verifyToken(token + "x")).toThrow();
  });

  it("throws when JWT_SECRET is missing", () => {
    delete process.env.JWT_SECRET;
    expect(() => generateToken({ userId: "u1", email: "a@b.c", role: "user" })).toThrow();
    process.env.JWT_SECRET = "test-only-secret";
  });
});

describe("AppError", () => {
  it("defaults to 500 and is operational", () => {
    const e = new AppError("boom");
    expect(e.statusCode).toBe(500);
    expect(e.isOperational).toBe(true);
  });
});
