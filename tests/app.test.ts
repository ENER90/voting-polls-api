import request from "supertest";
import app from "../src/app";

describe("app (no database)", () => {
  it("GET /api returns API metadata", async () => {
    const res = await request(app).get("/api");
    expect(res.status).toBe(200);
    expect(res.body.version).toBe("1.0.0");
    expect(res.body.endpoints).toBeDefined();
  });

  it("GET /health reports DEGRADED when DB is disconnected", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(503);
    expect(res.body.status).toBe("DEGRADED");
    expect(res.body.services.api).toBe("OK");
  });

  it("unknown routes return 404 JSON", async () => {
    const res = await request(app).get("/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Route not found");
  });
});
