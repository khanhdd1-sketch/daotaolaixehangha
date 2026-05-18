
/**
 * Copyright (c) 2026 Driving Training Center Hang Ha
 * (Trung tâm đào tạo lái xe Hằng Hà)
 *
 * All rights reserved.
 */
document.addEventListener("DOMContentLoaded", async () => {
  await globalThis.DriveSchoolI18n.loadTranslations();
  globalThis.DriveSchoolCommon.initZaloBubble();
  globalThis.DriveSchoolCommon.trackVisit();
  initLoginForm();
  guardLoggedIn();
});

function t(key, fallback = "") {
  return globalThis.DriveSchoolI18n.t(key, fallback);
}

async function guardLoggedIn() {
  const currentUser = await globalThis.DriveSchoolCommon.getCurrentUser();
  if (currentUser?.role === "admin") {
    globalThis.DriveSchoolCommon.redirectWithLang("/admin.html");
  }
  if (currentUser?.role === "student") {
    globalThis.DriveSchoolCommon.redirectWithLang("/exam.html");
  }
}

function initLoginForm() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(form).entries());
    const submitButton = form.querySelector("button[type='submit']");
    submitButton.disabled = true;

    try {
      const response = await globalThis.DriveSchoolCommon.apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      globalThis.DriveSchoolCommon.showToast(t("login.toastSuccess", "Login successful."), "success");
      if (response.data.user.role === "admin") {
        globalThis.DriveSchoolCommon.redirectWithLang("/admin.html");
      } else {
        globalThis.DriveSchoolCommon.redirectWithLang("/exam.html");
      }
    } catch (error) {
      globalThis.DriveSchoolCommon.showToast(error.message, "danger");
    } finally {
      submitButton.disabled = false;
    }
  });
}
