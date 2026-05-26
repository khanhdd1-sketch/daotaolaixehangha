const request = require("supertest");
const app = require("../src/index");
describe("Admin pagination", () => {
  let adminCookies;
  let csrfToken;

  beforeAll(async () => {
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@drivingschool.vn", password: "Admin@123" });

    adminCookies = loginResponse.headers["set-cookie"] || [];
    const csrfCookie = adminCookies.find((cookie) => cookie.startsWith("csrf_token=")) || "";
    csrfToken = csrfCookie.split(";")[0].split("=")[1];
  });

  it("returns paginated envelope from /api/admin/result-rows", async () => {
    const response = await request(app)
      .get("/api/admin/result-rows?page=1&limit=5")
      .set("Cookie", adminCookies)
      .set("X-CSRF-Token", csrfToken);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body).toEqual(
      expect.objectContaining({
        total: expect.any(Number),
        page: 1,
        limit: 5,
        totalPages: expect.any(Number)
      })
    );
    expect(response.body.data.length).toBeLessThanOrEqual(5);
  });

  it("keeps backward compatible array response for /api/admin/results without pagination", async () => {
    const response = await request(app)
      .get("/api/admin/results")
      .set("Cookie", adminCookies)
      .set("X-CSRF-Token", csrfToken);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.total).toBeUndefined();
  });
});
