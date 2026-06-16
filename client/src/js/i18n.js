
/**
 * Copyright (c) 2026 Driving Training Center Hang Ha
 * (Trung tâm đào tạo lái xe Hiếu Khánh)
 *
 * All rights reserved.
 */
(function () {
  let dictionary = {};

  function getByKey(source, key) {
    return key.split(".").reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : null), source);
  }

  function isPlainObject(value) {
    return Object.prototype.toString.call(value) === "[object Object]";
  }

  function mergeDeep(target, source) {
    const output = { ...target };
    Object.keys(source || {}).forEach((key) => {
      const sourceValue = source[key];
      const targetValue = output[key];

      if (isPlainObject(targetValue) && isPlainObject(sourceValue)) {
        output[key] = mergeDeep(targetValue, sourceValue);
      } else {
        output[key] = sourceValue;
      }
    });
    return output;
  }

  async function loadTranslations() {
    const lang = window.DriveSchoolCommon.getLang();
    const sources = await Promise.all([
      fetch(`/src/i18n/${lang}.json`).then((response) => response.json()),
      fetch(`/src/i18n/blog.${lang}.json`)
        .then((response) => (response.ok ? response.json() : {}))
        .catch(() => ({}))
    ]);

    dictionary = sources.reduce((accumulator, source) => mergeDeep(accumulator, source), {});
    applyTranslations();
    initSwitcher();
    return dictionary;
  }

  function t(key, fallback = "") {
    return getByKey(dictionary, key) ?? fallback;
  }

  function applyTranslations() {
    document.documentElement.lang = window.DriveSchoolCommon.getLang();

    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const value = t(element.dataset.i18n, element.textContent);
      element.textContent = value;
    });

    document.querySelectorAll("[data-i18n-html]").forEach((element) => {
      const value = t(element.dataset.i18nHtml, element.innerHTML);
      element.innerHTML = value;
    });

    document.querySelectorAll("[data-i18n-meta]").forEach((element) => {
      const value = t(element.dataset.i18nMeta, element.getAttribute("content") || "");
      element.setAttribute("content", value);
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
      const value = t(element.dataset.i18nPlaceholder, element.getAttribute("placeholder") || "");
      element.setAttribute("placeholder", value);
    });

    const titleKey = document.body.dataset.pageTitle;
    if (titleKey) {
      document.title = t(titleKey, document.title);
    }
  }

  function initSwitcher() {
    document.querySelectorAll("[data-lang-switch]").forEach((button) => {
      const active = button.dataset.langSwitch === window.DriveSchoolCommon.getLang();
      const inactiveClass = button.classList.contains("btn-outline-light") ? "btn-outline-light" : "btn-outline-secondary";
      button.classList.toggle("btn-primary", active);
      button.classList.toggle("btn-outline-secondary", false);
      button.classList.toggle("btn-outline-light", false);
      button.classList.toggle(inactiveClass, !active);
      button.onclick = () => {
        window.DriveSchoolCommon.setLang(button.dataset.langSwitch);
        window.location.reload();
      };
    });
  }

  window.DriveSchoolI18n = {
    loadTranslations,
    t
  };
})();
