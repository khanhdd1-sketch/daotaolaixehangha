/**
 * Kiểu dữ liệu API (JSDoc) — backend Express.
 * @module types/apiTypes
 */

/**
 * Payload JWT sau khi verify.
 * @typedef {object} AuthUser
 * @property {string} sub - ID người dùng
 * @property {string} role - `admin` | `student`
 * @property {string} email
 * @property {string} name
 */

/**
 * Phản hồi JSON chuẩn.
 * @typedef {object} ApiJsonResponse
 * @property {boolean} success
 * @property {string} [message]
 * @property {*} [data]
 */

/**
 * Học viên trong mock / Sheets.
 * @typedef {object} StudentRecord
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} role
 * @property {string} [course_type]
 */

module.exports = {};
