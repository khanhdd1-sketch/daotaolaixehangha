
/**
 * Copyright (c) 2026 Driving Training Center Hang Ha
 * (Trung tâm đào tạo lái xe Hiếu Khánh)
 *
 * All rights reserved.
 */
const crypto = require("node:crypto");

const DEFAULT_PROOF_FOLDER = "drive-school/proof-images";
const DEFAULT_QUESTION_FOLDER = "drive-school/question-images";
const DEFAULT_LESSON_QUESTION_FOLDER = "drive-school/lesson-questions";

function normalizeFolder(value, fallback = DEFAULT_PROOF_FOLDER) {
  const normalized = String(value || fallback)
    .trim()
    .replace(/^\/+|\/+$/g, "");

  return normalized || fallback;
}

function getConfig() {
  return {
    cloudName: String(process.env.CLOUDINARY_CLOUD_NAME || "").trim(),
    apiKey: String(process.env.CLOUDINARY_API_KEY || "").trim(),
    apiSecret: String(process.env.CLOUDINARY_API_SECRET || "").trim(),
    proofFolder: normalizeFolder(process.env.CLOUDINARY_UPLOAD_FOLDER, DEFAULT_PROOF_FOLDER),
    questionFolder: normalizeFolder(process.env.CLOUDINARY_QUESTION_UPLOAD_FOLDER, DEFAULT_QUESTION_FOLDER),
    
    // ✅ THÊM DÒNG NÀY
    lessonQuestionFolder: normalizeFolder(
      process.env.CLOUDINARY_LESSON_QUESTION_UPLOAD_FOLDER,
      DEFAULT_LESSON_QUESTION_FOLDER
    )
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

function buildUploadConfig({ folder, publicIdPrefix, fallbackPrefix }) {
  const { cloudName, apiKey, apiSecret } = getConfig();
  if (!cloudName || !apiKey || !apiSecret) {
    return null;
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const publicId = `${sanitizeSegment(publicIdPrefix, fallbackPrefix)}-${timestamp}-${crypto.randomBytes(4).toString("hex")}`;
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

function buildProofUploadConfig({ userId }) {
  const { proofFolder } = getConfig();
  return buildUploadConfig({
    folder: proofFolder,
    publicIdPrefix: userId,
    fallbackPrefix: "student"
  });
}

function buildQuestionImageUploadConfig({ userId, examId }) {
  const { questionFolder } = getConfig();
  return buildUploadConfig({
    folder: questionFolder,
    publicIdPrefix: `${examId || "question"}-${userId || "admin"}`,
    fallbackPrefix: "question"
  });
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

function buildLessonQuestionImageUploadConfig({ userId, lessonId }) {
  const { lessonQuestionFolder } = getConfig();

  return buildUploadConfig({
    folder: lessonQuestionFolder,
    publicIdPrefix: `${lessonId || "lesson"}-${userId || "admin"}`,
    fallbackPrefix: "lesson"
  });
}

module.exports = {
  buildProofUploadConfig,
  buildQuestionImageUploadConfig,
  buildLessonQuestionImageUploadConfig,
  isConfigured,
  isOwnedAssetUrl
};
