const { encryptPayload } = require("../utils/crypto");

function encryptResponse(req, res, next) {
  const originalJson = res.json;

  res.json = function (data) {
    if (!req.encryptionKey) {
      return originalJson.call(this, data);
    }

    try {
      const encrypted = encryptPayload(data, req.encryptionKey);
      return originalJson.call(this, encrypted);
    } catch (err) {
      console.error("Encrypt response failed:", err);
      return originalJson.call(this, {
        success: false,
        message: "Encryption failed"
      });
    }
  };

  next();
}

module.exports = encryptResponse;
