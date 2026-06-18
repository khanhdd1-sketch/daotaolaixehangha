const crypto = require("node:crypto");

const ENCRYPTED_PAYLOAD_MARKER = "__encrypted";
const ENCRYPTION_HEADER = "x-encrypted-key";
const ENCRYPTION_REQUEST_HEADER = "x-encrypted-request";

function normalizePem(value) {
  return String(value || "").replace(/\\n/g, "\n").trim();
}

function getPrivateKeyPem() {
  return normalizePem(process.env.PAYLOAD_ENCRYPTION_PRIVATE_KEY);
}

function hasPayloadEncryptionKey() {
  return Boolean(getPrivateKeyPem());
}

function getPublicKeyPem() {
  const privateKeyPem = getPrivateKeyPem();
  if (!privateKeyPem) {
    return "";
  }

  return crypto
    .createPublicKey(privateKeyPem)
    .export({ type: "spki", format: "pem" });
}

function decryptSessionKey(encryptedKey) {
  const privateKeyPem = getPrivateKeyPem();
  if (!privateKeyPem) {
    throw new Error("Payload encryption private key is not configured");
  }

  return crypto.privateDecrypt(
    {
      key: privateKeyPem,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256"
    },
    Buffer.from(String(encryptedKey || ""), "base64")
  );
}

function encryptPayload(payload, sessionKey) {
  if (!Buffer.isBuffer(sessionKey) && !(sessionKey instanceof Uint8Array)) {
    throw new Error("A binary session key is required");
  }

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", Buffer.from(sessionKey), iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(payload), "utf8"),
    cipher.final()
  ]);
  const tag = cipher.getAuthTag();

  return {
    [ENCRYPTED_PAYLOAD_MARKER]: true,
    alg: "RSA-OAEP-256+A256GCM",
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
    data: encrypted.toString("base64")
  };
}

function decryptPayload(payload, sessionKey) {
  if (!payload || payload[ENCRYPTED_PAYLOAD_MARKER] !== true) {
    return payload;
  }

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    Buffer.from(sessionKey),
    Buffer.from(payload.iv, "base64")
  );
  decipher.setAuthTag(Buffer.from(payload.tag, "base64"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(payload.data, "base64")),
    decipher.final()
  ]);

  return JSON.parse(decrypted.toString("utf8"));
}

function isEncryptedPayload(payload) {
  return Boolean(payload && payload[ENCRYPTED_PAYLOAD_MARKER] === true);
}

module.exports = {
  ENCRYPTED_PAYLOAD_MARKER,
  ENCRYPTION_HEADER,
  ENCRYPTION_REQUEST_HEADER,
  decryptPayload,
  decryptSessionKey,
  encryptPayload,
  getPublicKeyPem,
  hasPayloadEncryptionKey,
  isEncryptedPayload
};
