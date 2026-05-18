
/**
 * Copyright (c) 2026 Driving Training Center Hang Ha
 * (Trung tâm đào tạo lái xe Hằng Hà)
 *
 * All rights reserved.
 */
const crypto = require("node:crypto");

const DEFAULT_PROOF_FOLDER = "drive-school/proof-images";

function normalizeFolder(value) {
  const normalized = String(value || DEFAULT_PROOF_FOLDER)
    .trim()
    .replace(/^\/+|\/+$/g, "");

  return normalized || DEFAULT_PROOF_FOLDER;
}

function getConfig() {
  return {
    cloudName: String(process.env.CLOUDINARY_CLOUD_NAME || "").trim(),
    apiKey: String(process.env.CLOUDINARY_API_KEY || "").trim(),
    apiSecret: String(process.env.CLOUDINARY_API_SECRET || "").trim(),
    folder: normalizeFolder(process.env.CLOUDINARY_UPLOAD_FOLDER)
  };
}

function sanitizeSegment(value, fallback = "proof") {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || fallback;
}

function signParams(params, apiSecret) {
  const payload = Object.keys(params)
    .sort((a, b) => a.localeCompare(b))
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return crypto.createHash("sha1").update(`${payload}${apiSecret}`).digest("hex");
}

function isConfigured() {
  const { cloudName, apiKey, apiSecret } = getConfig();
  return Boolean(cloudName && apiKey && apiSecret);
}

function buildProofUploadConfig({ userId }) {
  const { cloudName, apiKey, apiSecret, folder } = getConfig();
  if (!cloudName || !apiKey || !apiSecret) {
    return null;
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const publicId = `${sanitizeSegment(userId, "student")}-${timestamp}-${crypto.randomBytes(4).toString("hex")}`;
  const signedParams = {
    folder,
    public_id: publicId,
    timestamp
  };

  return {
    cloudName,
    apiKey,
    folder,
    publicId,
    timestamp,
    signature: signParams(signedParams, apiSecret),
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
  };
}

function isOwnedAssetUrl(value) {
  const proofUrl = String(value || "").trim();
  if (!proofUrl) {
    return false;
  }

  const { cloudName } = getConfig();
  if (!cloudName) {
    return /^https?:\/\//i.test(proofUrl);
  }

  try {
    const parsedUrl = new URL(proofUrl);
    return /^res(-\d+)?\.cloudinary\.com$/i.test(parsedUrl.hostname)
      && parsedUrl.pathname.startsWith(`/${cloudName}/`);
  } catch {
    return false;
  }
}

module.exports = {
  buildProofUploadConfig,
  isConfigured,
  isOwnedAssetUrl
};
