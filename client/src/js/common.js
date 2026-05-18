/**
 * Copyright (c) 2026 Driving Training Center Hang Ha
 * (Trung tam dao tao lai xe Hang Ha)
 *
 * All rights reserved.
 */
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

function getLang() {
  const params = new URLSearchParams(globalThis.location.search);
  return params.get("lang") || localStorage.getItem("site_lang") || "vi";
}

function setLang(lang) {
  localStorage.setItem("site_lang", lang);
  const url = new URL(globalThis.location.href);
  url.searchParams.set("lang", lang);
  globalThis.history.replaceState({}, "", url);
}

async function apiFetch(url, options = {}) {
  const method = String(options.method || "GET").toUpperCase();
  const csrfHeaders = {};

  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    const csrfToken = getCookie("csrf_token");
    if (csrfToken) {
      csrfHeaders["X-CSRF-Token"] = csrfToken;
    }
  }

  const response = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...csrfHeaders,
      ...(options.headers)
    },
    ...options
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
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
  const pattern = new RegExp(`(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;]*)`);
  const match = document.cookie.RegExp.exec(pattern);
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

async function trackVisit() {
  try {
    await apiFetch("/api/tracking/visit", {
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

async function getCurrentUser() {
  try {
    const response = await apiFetch("/api/auth/me");
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
    .replaceAll(/&/g, "&amp;")
    .replaceAll(/</g, "&lt;")
    .replaceAll(/>/g, "&gt;")
    .replaceAll(/"/g, "&quot;")
    .replaceAll(/'/g, "&#039;");
}

function formatDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

async function logoutAndRedirect() {
  try {
    await apiFetch("/api/auth/logout", { method: "POST" });
  } catch (error) {
    console.warn("Logout failed", error.message);
  }
  redirectWithLang("/login.html");
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
  logoutAndRedirect
};

document.addEventListener("DOMContentLoaded", () => {
  bootTracking();
  bindTrackingClicks();
  initLazyMaps();
  initDeferredScripts();
  pushDataLayer("marketing_page_view");
});
