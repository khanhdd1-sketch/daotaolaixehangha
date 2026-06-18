const { HTTP_STATUS } = require("../constants/httpStatus");
const {
  ENCRYPTION_HEADER,
  ENCRYPTION_REQUEST_HEADER,
  decryptPayload,
  decryptSessionKey,
  hasPayloadEncryptionKey,
  isEncryptedPayload
} = require("../utils/crypto");

function decryptRequest(req, res, next) {
  const encryptedKey = req.header(ENCRYPTION_HEADER);
  const expectsEncryption = req.header(ENCRYPTION_REQUEST_HEADER) === "1" || isEncryptedPayload(req.body);

  if (!encryptedKey) {
    if (expectsEncryption) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Missing payload encryption key"
      });
    }

    return next();
  }

  if (!hasPayloadEncryptionKey()) {
    return res.status(HTTP_STATUS.SERVICE_UNAVAILABLE).json({
      success: false,
      message: "Payload encryption is not configured"
    });
  }

  try {
    req.encryptionKey = decryptSessionKey(encryptedKey);

    if (isEncryptedPayload(req.body)) {
      req.body = decryptPayload(req.body, req.encryptionKey);
    }

    return next();
  } catch (error) {
    console.error("Decrypt request failed:", error);
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: "Invalid encrypted payload"
    });
  }
}

module.exports = decryptRequest;
