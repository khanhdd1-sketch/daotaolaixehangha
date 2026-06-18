/**
 * Mã HTTP dùng trong middleware và controllers.
 * @readonly
 */
const HTTP_STATUS = Object.freeze({
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVICE_UNAVAILABLE: 503,
  INTERNAL_ERROR: 500
});

module.exports = { HTTP_STATUS };
