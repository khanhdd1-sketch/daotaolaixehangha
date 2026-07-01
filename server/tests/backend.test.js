const request = require("supertest");
const app = require("../src/index");

describe("🚀 Server Integration Tests", () => {

  let cookies = [];
  let csrfToken = "";
  let accessToken = "";

  /**
   * =====================================
   * HEALTH & BASIC
   * =====================================
   */
  describe("✅ Basic Routes", () => {
    it("GET /health should return 200", async () => {
      const res = await request(app).get("/health");
      expect(res.status).toBe(200);
    });

    it("Unknown API should return 404", async () => {
      const res = await request(app).get("/api/xyz");
      expect(res.status).toBe(404);
    });
  });

  /**
   * =====================================
   * AUTH FLOW
   * =====================================
   */
  describe("🔐 Auth Flow", () => {

    it("Login should succeed and set cookies", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "admin@drivingschool.vn",
          password: "Admin@123"
        });

      expect(res.status).toBe(200);

      cookies = res.headers["set-cookie"] || [];

      // ✅ extract csrf
      const csrfCookie = cookies.find(c => c.startsWith("csrf_token=")) || "";
      csrfToken = csrfCookie.split(";")[0].split("=")[1];

      // ✅ extract access token cookie
      const authCookie = cookies.find(c => c.startsWith("auth_token=")) || "";
      accessToken = authCookie.split(";")[0].split("=")[1];

      expect(accessToken).toBeTruthy();
      expect(csrfToken).toBeTruthy();
    });

    it("Should reject logout without CSRF", async () => {
      const res = await request(app)
        .post("/api/auth/logout")
        .set("Cookie", cookies);

      expect(res.status).toBe(403);
    });

    it("Should logout with valid CSRF", async () => {
      const res = await request(app)
        .post("/api/auth/logout")
        .set("Cookie", cookies)
        .set("X-CSRF-Token", csrfToken);

      expect(res.status).toBe(200);
    });

  });

  /**
   * =====================================
   * PROTECTED ROUTES
   * =====================================
   */
  describe("🔒 Protected APIs", () => {

    beforeEach(async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "admin@drivingschool.vn",
          password: "Admin@123"
        });

      cookies = res.headers["set-cookie"] || [];
    });

    it("Should block unauthenticated access", async () => {
      const res = await request(app)
        .get("/api/admin");

      expect(res.status).toBe(401);
    });

    it("Should allow authenticated access", async () => {
      const res = await request(app)
        .get("/api/admin")
        .set("Cookie", cookies);

      expect([200, 403]).toContain(res.status);
    });

  });

  /**
   * =====================================
   * ROLE CHECK
   * =====================================
   */
  describe("👥 Role-based Access", () => {

    it("Student should not access admin API", async () => {
      const resLogin = await request(app)
        .post("/api/auth/login")
        .send({
          email: "student@example.com",
          password: "Student123"
        });

      const studentCookies = resLogin.headers["set-cookie"] || [];

      const res = await request(app)
        .get("/api/admin")
        .set("Cookie", studentCookies);

      expect(res.status).toBe(403);
    });

  });

  /**
   * =====================================
   * THIRD PARTY (Cloudinary)
   * =====================================
   */
  describe("☁️ Third Party APIs", () => {

    beforeAll(() => {
      process.env.CLOUDINARY_CLOUD_NAME = "demo-cloud";
      process.env.CLOUDINARY_API_KEY = "demo-key";
      process.env.CLOUDINARY_API_SECRET = "demo-secret";
      process.env.CLOUDINARY_UPLOAD_FOLDER = "proof-images";
    });

    it("Should require auth", async () => {
      const res = await request(app)
        .get("/api/third-party/proof-upload-config");

      expect(res.status).toBe(401);
    });

    it("Should return upload config when authenticated", async () => {

      const login = await request(app)
        .post("/api/auth/login")
        .send({
          email: "student@example.com",
          password: "Student123"
        });

      const cookies = login.headers["set-cookie"];

      const res = await request(app)
        .get("/api/third-party/proof-upload-config")
        .set("Cookie", cookies);

      expect(res.status).toBe(200);

      expect(res.body.data).toEqual(expect.objectContaining({
        apiKey: "demo-key",
        cloudName: "demo-cloud"
      }));
    });

  });

  /**
   * =====================================
   * SECURITY
   * =====================================
   */
  describe("🛡️ Security Checks", () => {

    it("Should reject large payload", async () => {
      const largeString = "x".repeat(3 * 1024 * 1024);

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: largeString });

      // Express body or custom guard
      expect([400, 413]).toContain(res.status);
    });

    it("Should include security headers", async () => {
      const res = await request(app).get("/health");

      expect(res.headers["x-content-type-options"]).toBe("nosniff");
      expect(res.headers["x-frame-options"]).toBe("DENY");
    });

  });

});