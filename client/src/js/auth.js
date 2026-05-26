
(() => {
  if (globalThis.__AUTH_JS_LOADED__) return;
  globalThis.__AUTH_JS_LOADED__ = true;

  const C = globalThis.DriveSchoolConstants || {};
  const ROLES = C.ROLES || { ADMIN: "admin", STUDENT: "student" };
  const API_PATHS = C.API_PATHS || { AUTH_LOGIN: "/api/auth/login" };
  const PAGE_ROUTES = C.PAGE_ROUTES || { ADMIN: "/admin.html", EXAM_DASHBOARD: "/exam.html" };

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
    if (currentUser?.role === ROLES.ADMIN) {
      globalThis.DriveSchoolCommon.redirectWithLang(PAGE_ROUTES.ADMIN);
    }
    if (currentUser?.role === ROLES.STUDENT) {
      globalThis.DriveSchoolCommon.redirectWithLang(PAGE_ROUTES.EXAM_DASHBOARD);
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
        const response = await globalThis.DriveSchoolCommon.apiFetch(API_PATHS.AUTH_LOGIN, {
          method: "POST",
          body: JSON.stringify(payload)
        });

        globalThis.DriveSchoolCommon.showToast(
          t("login.toastSuccess", "Login successful."),
          "success"
        );

        if (response.data.user.role === ROLES.ADMIN) {
          globalThis.DriveSchoolCommon.redirectWithLang(PAGE_ROUTES.ADMIN);
        } else {
          globalThis.DriveSchoolCommon.redirectWithLang(PAGE_ROUTES.EXAM_DASHBOARD);
        }
      } catch (error) {
        globalThis.DriveSchoolCommon.showToast(error.message, "danger");
      } finally {
        submitButton.disabled = false;
      }
    });
  }
})();
