
/**
 * Copyright (c) 2026 Driving Training Center Hang Ha
 * (Trung tâm đào tạo lái xe Hằng Hà)
 *
 * All rights reserved.
 */
document.addEventListener("DOMContentLoaded", async () => {
  await globalThis.DriveSchoolI18n.loadTranslations();
  globalThis.DriveSchoolCommon.initAOS();
  globalThis.DriveSchoolCommon.initZaloBubble();
  initBlogDropdown();
  initPackageCards();
  initRegistrationForm();
  initCounters();
  globalThis.setTimeout(() => {
    globalThis.DriveSchoolCommon.trackVisit();
  }, 1200);
});

function t(key, fallback = "") {
  return globalThis.DriveSchoolI18n.t(key, fallback);
}

function initPackageCards() {
  document.querySelectorAll(".package-card input[type='radio']").forEach((input) => {
    input.addEventListener("change", () => {
      document.querySelectorAll(".package-card").forEach((card) => card.classList.remove("active"));
      input.closest(".package-card").classList.add("active");
      const field = document.getElementById("courseType");
      if (field) {
        field.value = input.value;
      }
    });
  });
}

function initCounters() {
  const elements = Array.from(document.querySelectorAll("[data-counter-target]"));
  if (!elements.length) return;

  const animateCounter = (element) => {
    if (element.dataset.counterAnimated === "true") {
      return;
    }

    element.dataset.counterAnimated = "true";
    const target = Number(element.dataset.counterTarget || 0);
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 60));
    const interval = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(interval);
      }
      element.textContent = current.toLocaleString();
    }, 30);
  };

  if (!("IntersectionObserver" in globalThis)) {
    elements.forEach(animateCounter);
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.35 });

  elements.forEach((element) => observer.observe(element));
}

function initRegistrationForm() {
  const form = document.getElementById("registrationForm");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(form).entries());
    const submitButton = form.querySelector("button[type='submit']");

    if (!payload.name || !payload.phone || !payload.email || !payload.course_type) {
      globalThis.DriveSchoolCommon.trackEvent("lead_form_submit_error", {
        form_name: "registration_form",
        error_type: "missing_required_fields"
      });
      globalThis.DriveSchoolCommon.showToast(t("home.toastMissingFields", "Please complete all required fields."), "danger");
      return;
    }

    globalThis.DriveSchoolCommon.trackEvent("lead_form_submit_attempt", {
      form_name: "registration_form",
      course_type: payload.course_type
    });

    submitButton.disabled = true;
    try {
      await globalThis.DriveSchoolCommon.apiFetch("/api/registrations", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      globalThis.DriveSchoolCommon.trackLeadConversion({
        form_name: "registration_form",
        page_location: globalThis.location.href,
        course_type: payload.course_type,
        lead_source: "landing_page"
      });
      globalThis.DriveSchoolCommon.trackEvent("lead_form_submit_success", {
        form_name: "registration_form",
        course_type: payload.course_type,
        lead_source: "landing_page"
      });
      globalThis.DriveSchoolCommon.showToast(t("home.toastRegistrationSuccess", "Registration submitted successfully."), "success");
      form.reset();
    } catch (error) {
      globalThis.DriveSchoolCommon.trackEvent("lead_form_submit_error", {
        form_name: "registration_form",
        course_type: payload.course_type,
        error_message: error.message
      });
      globalThis.DriveSchoolCommon.showToast(error.message, "danger");
    } finally {
      submitButton.disabled = false;
    }
  });
}

function initBlogDropdown() {
  const dropdowns = document.querySelectorAll(".js-blog-dropdown");
  if (!dropdowns.length || !globalThis.bootstrap) return;

  dropdowns.forEach((dropdownElement) => {
    const toggle = dropdownElement.querySelector("[data-bs-toggle='dropdown']");
    if (!toggle) return;

    const instance = globalThis.bootstrap.Dropdown.getOrCreateInstance(toggle);

    dropdownElement.addEventListener("mouseenter", () => {
      if (globalThis.innerWidth >= 992) {
        instance.show();
      }
    });

    dropdownElement.addEventListener("mouseleave", () => {
      if (window.innerWidth >= 992) {
        instance.hide();
      }
    });
  });
}
