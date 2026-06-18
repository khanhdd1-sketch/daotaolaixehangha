
/**
 * Copyright (c) 2026 Driving Training Center Hang Ha
 * (Trung tam dao tao lai xe Hang Ha)
 *
 * All rights reserved.
 */
/** @typedef {import('./types/domain.js').ApiResponse} ApiResponse */

const C = globalThis.DriveSchoolConstants || {};
const ROLES = C.ROLES || { ADMIN: "admin", STUDENT: "student" };
const HTTP_STATUS = C.HTTP_STATUS || { UNAUTHORIZED: 401 };
const SAFE_HTTP_METHODS = C.SAFE_HTTP_METHODS || ["GET", "HEAD", "OPTIONS"];
const CSRF_HEADER = C.CSRF_HEADER || "X-CSRF-Token";
const CSRF_COOKIE = C.CSRF_COOKIE || "csrf_token";
const PROTECTED_PAGE_ROUTES = C.PROTECTED_PAGE_ROUTES || [
  "/admin.html",
  "/exam.html",
  "/theory-exam.html",
  "/simulation-exam.html",
  "/result.html"
];
const API_PATHS = C.API_PATHS || {
  AUTH_LOGIN: "/api/auth/login",
  AUTH_LOGOUT: "/api/auth/logout",
  AUTH_ME: "/api/auth/me",
  TRACKING_VISIT: "/api/tracking/visit"
};
const PAGE_ROUTES = C.PAGE_ROUTES || { LOGIN: "/login.html" };

// Fill these IDs before running real marketing campaigns.
// Examples:
// gtmId: ""
// ga4MeasurementId: "G-XXXXXXXXXX"
// googleAdsId: "AW-123456789"
// googleAdsLeadLabel: "AbCdEfGhIjKlMnOpQr"
// googleAdsPhoneLabel: "ZyXwVuTsRqPoNmLkJi"
const trackingConfig = {
  // Keep empty when GTM snippet is already embedded in HTML pages.
  gtmId: "",
  ga4MeasurementId: "",
  googleAdsId: "",
  googleAdsLeadLabel: "",
  googleAdsPhoneLabel: "",
  debug: false
};

if (globalThis.__MARKETING_CONFIG__ && typeof globalThis.__MARKETING_CONFIG__ === "object") {
  Object.assign(trackingConfig, globalThis.__MARKETING_CONFIG__);
}

let trackingInitialized = false;
let cryptoModulePromise;

async function createEncryptedApiRequest(body) {
  if (!cryptoModulePromise) {
    cryptoModulePromise = import("./crypto.js");
  }

  const cryptoModule = await cryptoModulePromise;
  return cryptoModule.createEncryptedRequest(body);
}

/**
 * Ngôn ngữ hiện tại (URL ?lang= hoặc localStorage).
 * @returns {string}
 */
function getLang() {
  const params = new URLSearchParams(globalThis.location.search);
  return params.get("lang") || localStorage.getItem("site_lang") || "vi";
}

/**
 * Đổi ngôn ngữ và cập nhật URL.
 * @param {string} lang - Mã ngôn ngữ (vi, en, …)
 * @sideeffects Ghi localStorage, thay history
 */
function setLang(lang) {
  localStorage.setItem("site_lang", lang);
  const url = new URL(globalThis.location.href);
  url.searchParams.set("lang", lang);
  globalThis.history.replaceState({}, "", url);
}

/**
 * Gọi API JSON có cookie + CSRF.
 * @param {string} url - Đường dẫn API
 * @param {RequestInit} [options]
 * @returns {Promise<ApiResponse>}
 * @throws {Error} Khi HTTP lỗi
 */

async function apiFetch(url, options = {}) {
  const method = String(options.method || "GET").toUpperCase();
  const csrfHeaders = {};

  if (!SAFE_HTTP_METHODS.includes(method)) {
    const csrfToken = getCookie(CSRF_COOKIE);
    if (csrfToken) {
      csrfHeaders[CSRF_HEADER] = csrfToken;
    }
  }

  const headers = {
    "Content-Type": "application/json",
    ...csrfHeaders,
    ...(options.headers)
  };

  let body = options.body;
  let decryptResponse = async (payload) => payload;

  if (headers["Content-Type"] === "application/json" && String(url).startsWith("/api/")) {
    try {
      const parsedBody = body === undefined || body === null || body === ""
        ? undefined
        : typeof body === "string"
          ? JSON.parse(body)
          : body;
      const encryptedRequest = await createEncryptedApiRequest(parsedBody);
      decryptResponse = encryptedRequest.decryptResponse;
      Object.assign(headers, encryptedRequest.headers);
      body = encryptedRequest.body === undefined ? undefined : JSON.stringify(encryptedRequest.body);
    } catch (error) {
      console.warn("Encrypt request failed", error);
    }
  }

  const response = await fetch(url, {
    credentials: "include",
    ...options,
    headers,
    body
  });

  let data = await response.json().catch(() => ({}));

  if (data?.__encrypted && data?.iv && data?.data && data?.tag) {
    try {
      data = await decryptResponse(data);
    } catch (error) {
      console.error("Decrypt response failed", error);
      throw new Error("Invalid encrypted response");
    }
  }

  if (!response.ok) {
    if (
      response.status === HTTP_STATUS.UNAUTHORIZED &&
      !String(url).includes(API_PATHS.AUTH_LOGIN) &&
      !String(url).includes(API_PATHS.AUTH_ME)
    ) {
      const currentPath = globalThis.location.pathname;
      if (PROTECTED_PAGE_ROUTES.includes(currentPath)) {
        globalThis.setTimeout(() => redirectWithLang(PAGE_ROUTES.LOGIN), 0);
      }
    }
    throw new Error(data.message || "Request failed");
  }

  return data;
}

function showToast(message, variant = "success") {
  const container = document.getElementById("toastContainer");
  if (!container || !globalThis.bootstrap) return;
  const toastEl = document.createElement("div");
  toastEl.className = `toast align-items-center text-bg-${variant} border-0`;
  toastEl.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>
  `;
  container.appendChild(toastEl);
  const toast = new globalThis.bootstrap.Toast(toastEl, { delay: 3200 });
  toast.show();
  toastEl.addEventListener("hidden.bs.toast", () => toastEl.remove());
}

function createFloatingContactLink({ selector, href, className, ariaLabel, iconHtml = "" }) {
  if (document.querySelector(selector)) return;

  const link = document.createElement("a");
  link.href = href;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.className = className;
  link.setAttribute("aria-label", ariaLabel);

  if (iconHtml) {
    link.innerHTML = iconHtml;
  } else {
    link.textContent = ariaLabel;
  }

  document.body.appendChild(link);
}

function initZaloBubble() {
  createFloatingContactLink({
    selector: ".floating-facebook",
    href: "https://www.facebook.com/daotaolaixehangha",
    className: "floating-contact floating-facebook",
    ariaLabel: "Open Facebook page",
    iconHtml: '<i class="fa-brands fa-facebook-f" aria-hidden="true"></i>'
  });

  createFloatingContactLink({
    selector: ".floating-zalo",
    href: "https://zalo.me/0986082686",
    className: "floating-contact floating-zalo",
    ariaLabel: "Zalo"
  });
}

function initAOS() {
  if (globalThis.AOS) {
    const start = () => {
      globalThis.AOS.init({
        duration: 800,
        once: true,
        offset: 60,
        disable: () => window.innerWidth < 576
      });
    };

    if ("requestIdleCallback" in globalThis) {
      globalThis.requestIdleCallback(start, { timeout: 1500 });
    } else {
      globalThis.setTimeout(start, 500);
    }
  }
}

function loadScriptOnce(id, src, attributes = {}) {
  if (!src || document.getElementById(id)) {
    return;
  }

  const script = document.createElement("script");
  script.id = id;
  script.src = src;
  script.async = true;

  Object.entries(attributes).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      script.setAttribute(key, String(value));
    }
  });

  document.head.appendChild(script);
}

function getCookie(name) {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);

  const pattern = new RegExp(
    String.raw`(?:^|; )${escapedName}=([^;]*)`
  );

  const match = pattern.exec(document.cookie);
  return match ? decodeURIComponent(match[1]) : "";
}

function getTrackingContext() {
  return {
    page_location: globalThis.location.href,
    page_path: globalThis.location.pathname,
    page_title: document.title,
    page_lang: getLang()
  };
}

function pushDataLayer(eventName, params = {}) {
  globalThis.dataLayer = globalThis.dataLayer || [];
  globalThis.dataLayer.push({
    event: eventName,
    event_timestamp: Date.now(),
    ...getTrackingContext(),
    ...params
  });
}

function insertGtmNoscript(gtmId) {
  if (!gtmId || document.getElementById("gtm-noscript")) {
    return;
  }

  const noscript = document.createElement("noscript");
  noscript.id = "gtm-noscript";
  noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${escapeHtml(gtmId)}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
  document.body.prepend(noscript);
}

function bootTracking() {
  if (trackingInitialized) {
    return;
  }

  const { gtmId, ga4MeasurementId, googleAdsId } = trackingConfig;
  const shouldLoadGtag = Boolean(ga4MeasurementId || googleAdsId);

  globalThis.dataLayer = globalThis.dataLayer || [];
  globalThis.gtag = globalThis.gtag || function gtag() {
    globalThis.dataLayer.push(arguments);
  };

  if (gtmId) {
    globalThis.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
    loadScriptOnce("gtm-script", `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`);
    insertGtmNoscript(gtmId);
  }

  if (shouldLoadGtag) {
    loadScriptOnce("gtag-script", `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4MeasurementId || googleAdsId)}`);
    globalThis.gtag("js", new Date());

    if (ga4MeasurementId) {
      globalThis.gtag("config", ga4MeasurementId, {
        anonymize_ip: true,
        allow_google_signals: true
      });
    }

    if (googleAdsId) {
      globalThis.gtag("config", googleAdsId);
    }
  }

  pushDataLayer("marketing_tracking_ready", {
    has_ga4: Boolean(ga4MeasurementId),
    has_google_ads: Boolean(googleAdsId)
  });

  trackingInitialized = true;
}

function trackEvent(eventName, params = {}) {
  pushDataLayer(eventName, params);

  if (!globalThis.gtag) {
    return;
  }

  globalThis.gtag("event", eventName, params);
}

function trackLeadConversion(extraParams = {}) {
  const params = { ...extraParams };

  if (trackingConfig.googleAdsId && trackingConfig.googleAdsLeadLabel) {
    params.send_to = `${trackingConfig.googleAdsId}/${trackingConfig.googleAdsLeadLabel}`;
  }

  trackEvent("generate_lead", params);
}

function bindTrackingClicks() {
  document.addEventListener("click", (event) => {
    const customTrackNode = event.target.closest("[data-track-click]");
    if (customTrackNode) {
      trackEvent("marketing_click", {
        click_name: customTrackNode.dataset.trackClick || "",
        click_label: customTrackNode.dataset.trackLabel || customTrackNode.textContent.trim(),
        click_section: customTrackNode.dataset.trackSection || "",
        click_destination: customTrackNode.getAttribute("href") || customTrackNode.dataset.trackDestination || ""
      });
    }

    const telLink = event.target.closest("a[href^='tel:']");
    if (telLink) {
      const params = {
        link_url: telLink.href,
        link_text: telLink.textContent.trim(),
        contact_type: "phone"
      };

      if (trackingConfig.googleAdsId && trackingConfig.googleAdsPhoneLabel) {
        params.send_to = `${trackingConfig.googleAdsId}/${trackingConfig.googleAdsPhoneLabel}`;
      }

      trackEvent("contact_phone_click", params);
      return;
    }

    const contactLink = event.target.closest(".floating-facebook, .floating-zalo");
    if (contactLink) {
      trackEvent("contact_click", {
        method: contactLink.classList.contains("floating-zalo") ? "zalo" : "facebook",
        link_url: contactLink.href
      });
      return;
    }

    const mapButton = event.target.closest(".lazy-map-button");
    if (mapButton) {
      trackEvent("map_load_click", {
        click_name: "load_map",
        click_label: mapButton.textContent.trim()
      });
    }
  });
}

function createMapIframe({ src, title }) {
  const iframe = document.createElement("iframe");
  iframe.src = src;
  iframe.title = title || "Google Map";
  iframe.loading = "lazy";
  iframe.allowFullscreen = true;
  iframe.referrerPolicy = "no-referrer-when-downgrade";
  return iframe;
}

function initLazyMaps() {
  const lazyMaps = Array.from(document.querySelectorAll("[data-map-src]"));
  if (!lazyMaps.length) {
    return;
  }

  const hydrate = (node) => {
    if (!node || node.dataset.mapLoaded === "true") {
      return;
    }

    node.dataset.mapLoaded = "true";
    node.replaceChildren(createMapIframe({
      src: node.dataset.mapSrc,
      title: node.dataset.mapTitle
    }));
  };

  const observer = "IntersectionObserver" in globalThis
    ? new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          hydrate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "300px 0px" })
    : null;

  lazyMaps.forEach((node) => {
    const button = node.querySelector(".lazy-map-button");
    if (button) {
      button.addEventListener("click", () => hydrate(node), { once: true });
    }

    if (observer) {
      observer.observe(node);
    } else {
      hydrate(node);
    }
  });
}

function initDeferredScripts() {
  const nodes = Array.from(document.querySelectorAll("[data-deferred-script-src]"));
  if (!nodes.length) {
    return;
  }

  const loadDeferredScript = (node) => {
    if (!node || node.dataset.scriptLoaded === "true") {
      return;
    }

    node.dataset.scriptLoaded = "true";
    const script = document.createElement("script");
    script.src = node.dataset.deferredScriptSrc;
    script.async = true;

    Array.from(node.attributes).forEach((attribute) => {
      if (attribute.name.startsWith("data-") && attribute.name !== "data-deferred-script-src") {
        script.setAttribute(attribute.name, attribute.value);
      }
    });

    document.body.appendChild(script);
  };

  const triggerLoad = () => {
    nodes.forEach(loadDeferredScript);
    window.removeEventListener("scroll", triggerLoad);
    globalThis.removeEventListener("pointerdown", triggerLoad);
  };

  if ("requestIdleCallback" in globalThis) {
    globalThis.requestIdleCallback(triggerLoad, { timeout: 8000 });
  } else {
    globalThis.setTimeout(triggerLoad, 8000);
  }

  globalThis.addEventListener("scroll", triggerLoad, { once: true, passive: true });
  globalThis.addEventListener("pointerdown", triggerLoad, { once: true, passive: true });
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/service-worker.js").catch(() => {});
  }
}

/**
 * Ghi nhận lượt xem trang (analytics server).
 * @returns {Promise<void>}
 * @sideeffects POST /api/tracking/visit
 */
async function trackVisit() {
  try {
    await apiFetch(API_PATHS.TRACKING_VISIT, {
      method: "POST",
      body: JSON.stringify({
        page: globalThis.location.pathname,
        lang: getLang()
      })
    });
  } catch (error) {
    console.warn("Visit tracking failed", error.message);
  }
}

/**
 * Lấy user đang đăng nhập (hoặc null).
 * @returns {Promise<import('./types/domain.js').Student|null>}
 */
async function getCurrentUser() {
  try {
    const response = await apiFetch(API_PATHS.AUTH_ME);
    return response.data;
  } catch {
    return null;
  }
}

function redirectWithLang(path) {
  const url = new URL(path, globalThis.location.origin);
  url.searchParams.set("lang", getLang());
  globalThis.location.href = url.toString();
}

function withLangUrl(path) {
  const url = new URL(path, globalThis.location.origin);
  url.searchParams.set("lang", getLang());
  return `${url.pathname}${url.search}`;
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

/**
 * Đăng xuất và chuyển về trang login.
 * @returns {Promise<void>}
 */
async function logoutAndRedirect() {
  try {
    await apiFetch(API_PATHS.AUTH_LOGOUT, { method: "POST" });
  } catch (error) {
    console.warn("Logout failed", error.message);
  }
  redirectWithLang(PAGE_ROUTES.LOGIN);
}
/**
 * =============================
 * LESSON FUNCTIONS (STUDENT FLOW)
 * =============================
 */

/**
 * Chuyển tới trang học bài
 * @param {string} lessonId
 */
function goToLesson(lessonId) {
  if (!lessonId) return;
  globalThis.location.href = `/lesson.html?id=${encodeURIComponent(lessonId)}`;
}

/**
 * Mở bài học tab mới (admin preview)
 */
function previewLesson(lessonId) {
  if (!lessonId) return;
  globalThis.location.href = `/lesson.html?id=${encodeURIComponent(lessonId)}`;
}

/**
 * Lấy lessonId từ URL
 */
function getLessonIdFromUrl() {
  const params = new URLSearchParams(globalThis.location.search);
  return params.get("id");
}

/**
 * Kiểm tra bài học có mở không
 */
function isLessonUnlocked(lesson, allLessons, progressList = []) {
  if (!lesson) return false;

  if (lesson.order_no === 1) return true;

  const prevLesson = allLessons.find(
    l => l.order_no === lesson.order_no - 1
  );

  return progressList.some(
    p => p.lesson_id === prevLesson?.id && p.passed
  );
}

/**
 * Tính kết quả quiz
 */
function calculateLessonResult(questions, answers) {
  let correct = 0;

  for (const q of questions) {
    if (answers[q.id] === q.correct_answer) {
      correct++;
    }
  }

  return {
    correct,
    total: questions.length
  };
}

/**
 * Tìm bài tiếp theo
 */
function getNextLesson(currentLesson, lessons) {
  return lessons.find(
    l => l.order_no === currentLesson.order_no + 1
  );
}

/**
 * Submit progress học viên
 */
async function saveLessonProgress({ lessonId, score, passed }) {
  try {
    await apiFetch("/api/student-progress", {
      method: "POST",
      body: JSON.stringify({
        lesson_id: lessonId,
        score,
        passed
      })
    });
  } catch (error) {
    console.warn("Save progress failed:", error.message);
  }
}

globalThis.DriveSchoolCommon = {
  getLang,
  setLang,
  apiFetch,
  showToast,
  bootTracking,
  initZaloBubble,
  initAOS,
  initDeferredScripts,
  initLazyMaps,
  trackVisit,
  trackEvent,
  trackLeadConversion,
  getCurrentUser,
  redirectWithLang,
  withLangUrl,
  escapeHtml,
  formatDateTime,
  logoutAndRedirect,
  goToLesson,
  previewLesson,
  getLessonIdFromUrl,
  isLessonUnlocked,
  calculateLessonResult,
  getNextLesson,
  saveLessonProgress
};

document.addEventListener("DOMContentLoaded", () => {
  bootTracking();
  bindTrackingClicks();
  initLazyMaps();
  initDeferredScripts();
  registerServiceWorker();
  pushDataLayer("marketing_page_view");
});
