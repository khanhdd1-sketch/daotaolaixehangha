const CRYPTO_PUBLIC_KEY_ENDPOINT = "/api/crypto/public-key";
const ENCRYPTION_HEADER = "X-Encrypted-Key";
const ENCRYPTION_REQUEST_HEADER = "X-Encrypted-Request";
const ENCRYPTED_PAYLOAD_MARKER = "__encrypted";
const AES_ALGORITHM = "AES-GCM";
const RSA_ALGORITHM = "RSA-OAEP";
const TEXT_ENCODER = new TextEncoder();
const TEXT_DECODER = new TextDecoder();

let publicKeyPromise;

function base64ToBytes(value) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function bytesToBase64(bytes) {
  let binary = "";
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  return btoa(binary);
}

function pemToArrayBuffer(pem) {
  const base64 = String(pem || "")
    .replace(/-----BEGIN PUBLIC KEY-----/g, "")
    .replace(/-----END PUBLIC KEY-----/g, "")
    .replace(/\s/g, "");

  return base64ToBytes(base64).buffer;
}

async function importPublicKey(pem) {
  return crypto.subtle.importKey(
    "spki",
    pemToArrayBuffer(pem),
    { name: RSA_ALGORITHM, hash: "SHA-256" },
    false,
    ["encrypt"]
  );
}

async function loadPublicKey() {
  if (!crypto?.subtle) {
    return null;
  }

  const response = await fetch(CRYPTO_PUBLIC_KEY_ENDPOINT, {
    credentials: "include",
    headers: { Accept: "application/json" }
  });
  const config = await response.json().catch(() => ({}));

  if (!response.ok || !config.enabled || !config.publicKey) {
    return null;
  }

  return importPublicKey(config.publicKey);
}

async function getPublicKey() {
  if (!publicKeyPromise) {
    publicKeyPromise = loadPublicKey().catch((error) => {
      console.warn("Payload encryption unavailable", error);
      return null;
    });
  }

  return publicKeyPromise;
}

async function generateSession() {
  const publicKey = await getPublicKey();
  if (!publicKey) {
    return null;
  }

  const aesKey = await crypto.subtle.generateKey(
    { name: AES_ALGORITHM, length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
  const rawKey = await crypto.subtle.exportKey("raw", aesKey);
  const encryptedKey = await crypto.subtle.encrypt(
    { name: RSA_ALGORITHM },
    publicKey,
    rawKey
  );

  return {
    aesKey,
    encryptedKey: bytesToBase64(new Uint8Array(encryptedKey))
  };
}

async function encryptWithSession(data, aesKey) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: AES_ALGORITHM, iv },
    aesKey,
    TEXT_ENCODER.encode(JSON.stringify(data))
  );
  const encryptedBytes = new Uint8Array(encrypted);
  const tagStart = encryptedBytes.length - 16;

  return {
    [ENCRYPTED_PAYLOAD_MARKER]: true,
    alg: "RSA-OAEP-256+A256GCM",
    iv: bytesToBase64(iv),
    tag: bytesToBase64(encryptedBytes.slice(tagStart)),
    data: bytesToBase64(encryptedBytes.slice(0, tagStart))
  };
}

async function decryptWithSession(payload, aesKey) {
  if (!payload || payload[ENCRYPTED_PAYLOAD_MARKER] !== true) {
    return payload;
  }

  const encryptedBytes = base64ToBytes(payload.data);
  const tagBytes = base64ToBytes(payload.tag);
  const combined = new Uint8Array(encryptedBytes.length + tagBytes.length);
  combined.set(encryptedBytes);
  combined.set(tagBytes, encryptedBytes.length);

  const decrypted = await crypto.subtle.decrypt(
    { name: AES_ALGORITHM, iv: base64ToBytes(payload.iv) },
    aesKey,
    combined
  );

  return JSON.parse(TEXT_DECODER.decode(decrypted));
}

export async function createEncryptedRequest(body) {
  const session = await generateSession();
  if (!session) {
    return { body, headers: {}, decryptResponse: async (payload) => payload };
  }

  return {
    body: body === undefined ? undefined : await encryptWithSession(body, session.aesKey),
    headers: {
      [ENCRYPTION_HEADER]: session.encryptedKey,
      [ENCRYPTION_REQUEST_HEADER]: "1"
    },
    decryptResponse: (payload) => decryptWithSession(payload, session.aesKey)
  };
}
