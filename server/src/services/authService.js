
/**
 * Copyright (c) 2026 Driving Training Center Hang Ha
 * (Trung tâm đào tạo lái xe Hiếu Khánh)
 *
 * All rights reserved.
 */
const crypto = require("node:crypto");
const jwt = require("jsonwebtoken");
const { getJwtSecret } = require("../config/security");

/** Số vòng PBKDF2 khi băm mật khẩu */
const ITERATIONS = 100000;
/** Độ dài khóa PBKDF2 (byte) */
const KEY_LENGTH = 64;
/** Thuật toán băm mật khẩu */
const DIGEST = "sha512";
/** Thời hạn JWT mặc định */
const JWT_EXPIRES_IN = "8h";

/**
 * Băm mật khẩu bằng PBKDF2 (salt ngẫu nhiên).
 * @param {string} password - Mật khẩu thô
 * @returns {string} Chuỗi `salt:hash` hex
 */
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString("hex");
  return `${salt}:${hash}`;
}

/**
 * So khớp mật khẩu với bản băm đã lưu (timing-safe).
 * @param {string} password - Mật khẩu nhập
 * @param {string} storedHash - Băm đã lưu
 * @returns {boolean}
 */
function comparePassword(password, storedHash) {
  if (!storedHash?.includes(":")) {
    return false;
  }

  const [salt, originalHash] = storedHash.split(":");
  const hash = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(originalHash, "hex"));
}

/**
 * Ký JWT cho phiên đăng nhập.
 * @param {{ id: string, role: string, email: string, name: string }} user
 * @returns {string} Token JWT
 */
function signToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      email: user.email,
      name: user.name
    },
    getJwtSecret(),
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Xác minh và giải mã JWT.
 * @param {string} token
 * @returns {import('../types/apiTypes').AuthUser}
 * @throws {import('jsonwebtoken').JsonWebTokenError}
 */
function verifyToken(token) {
  return jwt.verify(token, getJwtSecret());
}

module.exports = {
  hashPassword,
  comparePassword,
  signToken,
  verifyToken
};
