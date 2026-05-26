import { getAdminState } from "../state/adminState.js";
import { buildEmptyRow } from "../utils/adminFormUtils.js";
import { escapeHtml, matchesSearch, normalizeText } from "../../shared/textUtils.js";

/**
 * Đọc bộ lọc bảng học viên từ DOM.
 * @returns {{ search: string, course: string }}
 */
export function getStudentTableFilters() {
  return {
    search: document.getElementById("studentSearchInput")?.value || "",
    course: document.getElementById("studentCourseFilterLocal")?.value || ""
  };
}

/**
 * Render bảng học viên và badge đếm.
 */
export function renderStudentsTable() {
  const { students } = getAdminState();
  const { search, course } = getStudentTableFilters();
  const searchTerm = normalizeText(search);
  const filtered = students.filter((item) => {
    return (!course || item.course_type === course) &&
      matchesSearch([item.name, item.email, item.course_type], searchTerm);
  });

  document.getElementById("studentCountBadge").textContent = `${filtered.length} học viên`;
  document.getElementById("studentTable").innerHTML = filtered.length
    ? filtered.map((item) => `
      <tr>
        <td>${escapeHtml(item.name)}</td>
        <td>${escapeHtml(item.email)}</td>
        <td>${escapeHtml(item.course_type || "-")}</td>
        <td>${globalThis.DriveSchoolCommon.formatDateTime(item.created_at)}</td>
      </tr>
    `).join("")
    : buildEmptyRow(4, "Chưa có học viên phù hợp.");
}

/**
 * Đọc bộ lọc bảng lead đăng ký.
 * @returns {{ search: string, course: string }}
 */
export function getRegistrationTableFilters() {
  return {
    search: document.getElementById("registrationSearchInput")?.value || "",
    course: document.getElementById("registrationCourseFilterLocal")?.value || ""
  };
}

/**
 * Render bảng lead đăng ký từ website.
 */
export function renderRegistrationsTable() {
  const { registrations } = getAdminState();
  const { search, course } = getRegistrationTableFilters();
  const searchTerm = normalizeText(search);
  const filtered = registrations.filter((item) => {
    return (!course || item.course_type === course) &&
      matchesSearch([item.name, item.phone, item.email, item.note, item.course_type], searchTerm);
  });

  document.getElementById("registrationCountBadge").textContent = `${filtered.length} lead`;
  document.getElementById("registrationTable").innerHTML = filtered.length
    ? filtered.map((item) => `
      <tr>
        <td>${escapeHtml(item.name || "")}</td>
        <td>${escapeHtml(item.phone || "")}</td>
        <td>${escapeHtml(item.email || "")}</td>
        <td>${escapeHtml(item.course_type || "-")}</td>
        <td>${globalThis.DriveSchoolCommon.formatDateTime(item.created_at)}</td>
        <td>${escapeHtml(item.note || "")}</td>
      </tr>
    `).join("")
    : buildEmptyRow(6, "Chưa có lead phù hợp.");
}

/**
 * Render cả học viên và lead.
 */
export function renderStudentsSection() {
  renderStudentsTable();
  renderRegistrationsTable();
}
