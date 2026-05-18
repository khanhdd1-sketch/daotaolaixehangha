
/**
 * Copyright (c) 2026 Driving Training Center Hang Ha
 * (Trung tâm đào tạo lái xe Hằng Hà)
 *
 * All rights reserved.
 */
const request = require("supertest");
const app = require("../src/index");
const { signToken } = require("../src/services/authService");

describe("Server Tests", () => {
  it("should respond with 200 on the root endpoint", async () => {
    const response = await request(app).get("/");
    expect(response.status).toBe(200);
  });

  it("should respond with 404 for unknown API routes", async () => {
    const response = await request(app).get("/api/not-found");
    expect(response.status).toBe(404);
  });

  it("should require auth for the proof upload config endpoint", async () => {
    const response = await request(app).get("/api/third-party/proof-upload-config");
    expect(response.status).toBe(401);
  });

  it("should return signed Cloudinary upload config for students", async () => {
    process.env.CLOUDINARY_CLOUD_NAME = "demo-cloud";
    process.env.CLOUDINARY_API_KEY = "demo-key";
    process.env.CLOUDINARY_API_SECRET = "demo-secret";
    process.env.CLOUDINARY_UPLOAD_FOLDER = "proof-images";

    const token = signToken({
      id: "student_1",
      role: "student",
      email: "student@example.com",
      name: "Student"
    });

    const response = await request(app)
      .get("/api/third-party/proof-upload-config")
      .set("Cookie", [`auth_token=${token}`]);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual(expect.objectContaining({
      apiKey: "demo-key",
      cloudName: "demo-cloud",
      folder: "proof-images",
      signature: expect.any(String),
      timestamp: expect.any(Number),
      uploadUrl: "https://api.cloudinary.com/v1_1/demo-cloud/image/upload"
    }));
  });

  it("should not expose the JWT token in the login response body", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "admin@drivingschool.vn",
        password: "Admin@123"
      });

    expect(response.status).toBe(200);
    expect(response.body.data.token).toBeUndefined();
    expect(response.headers["set-cookie"]).toEqual(expect.arrayContaining([expect.stringContaining("auth_token=")]));
    expect(response.headers["set-cookie"]).toEqual(expect.arrayContaining([expect.stringContaining("csrf_token=")]));
  });

  it("should reject cookie-auth logout without a matching csrf token", async () => {
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: "admin@drivingschool.vn",
        password: "Admin@123"
      });

    const cookies = loginResponse.headers["set-cookie"] || [];

    const response = await request(app)
      .post("/api/auth/logout")
      .set("Cookie", cookies);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("CSRF validation failed");
  });

  it("should allow cookie-auth logout with a matching csrf token", async () => {
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: "admin@drivingschool.vn",
        password: "Admin@123"
      });

    const cookies = loginResponse.headers["set-cookie"] || [];
    const csrfCookie = cookies.find((cookie) => cookie.startsWith("csrf_token=")) || "";
    const csrfToken = csrfCookie.split(";")[0].split("=")[1];

    const response = await request(app)
      .post("/api/auth/logout")
      .set("Cookie", cookies)
      .set("X-CSRF-Token", csrfToken);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
