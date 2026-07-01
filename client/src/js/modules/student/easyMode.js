const EASY_MODE_KEY = "student_easy_mode";

const PAGE_HELP = {
  "/exam.html": {
    title: "Chế độ dễ cho người lớn tuổi",
    text: "Màn hình này chia việc học thành từng bước nhỏ: học bài, luyện câu hỏi, rồi vào thi. Hãy bấm nút lớn màu cam ở phần Bước tiếp theo."
  },
  "/lesson.html": {
    title: "Học từng bước",
    text: "Xem video trước, bấm Đã xem xong, sau đó làm trắc nghiệm. Mỗi câu chỉ cần chọn một đáp án."
  },
  "/theory-exam.html": {
    title: "Thi lý thuyết dễ hiểu",
    text: "Đọc chậm từng câu, bấm Nghe nếu muốn máy đọc câu hỏi. Câu điểm liệt cần làm thật chắc trước khi nộp bài."
  },
  "/simulation-exam.html": {
    title: "Thi mô phỏng dễ hiểu",
    text: "Xem video, khi thấy tình huống nguy hiểm thì bấm Ghi nhận nguy hiểm. Có thể nghe hướng dẫn trước khi làm."
  }
};

export function initStudentEasyMode(options = {}) {
  const enabled = getEasyMode();
  applyEasyMode(enabled);
  injectEasyModeButton(options.mount || findMount());
  injectEasyModeCoach(options.help || PAGE_HELP[globalThis.location.pathname]);
  bindEasyModeEvents();
}

export function getEasyMode() {
  return globalThis.localStorage?.getItem(EASY_MODE_KEY) === "1";
}

export function applyEasyMode(enabled) {
  document.body.classList.toggle("student-easy-mode", enabled);
  document.documentElement.classList.toggle("student-easy-mode-root", enabled);
  document.querySelectorAll("[data-easy-mode-toggle]").forEach((button) => {
    button.setAttribute("aria-pressed", String(enabled));
    button.innerHTML = enabled
      ? '<i class="fa-solid fa-person-cane"></i><span>Đang ở Chế độ dễ</span>'
      : '<i class="fa-solid fa-person-cane"></i><span>Chế độ dễ</span>';
  });
}

export function speakText(text) {
  if (!("speechSynthesis" in globalThis)) {
    globalThis.DriveSchoolCommon?.showToast?.("Trình duyệt chưa hỗ trợ đọc giọng nói.", "warning");
    return;
  }

  const cleanText = String(text || "").replace(/\s+/g, " ").trim();
  if (!cleanText) return;

  globalThis.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = "vi-VN";
  utterance.rate = 0.82;
  utterance.pitch = 1;
  globalThis.speechSynthesis.speak(utterance);
}

function findMount() {
  return document.querySelector(".student-top-actions") || document.querySelector(".lesson-top-actions");
}

function injectEasyModeButton(mount) {
  if (!mount || document.querySelector("[data-easy-mode-toggle]")) return;

  const button = document.createElement("button");
  button.className = "btn btn-warning easy-mode-toggle";
  button.type = "button";
  button.dataset.easyModeToggle = "true";
  button.setAttribute("aria-pressed", "false");
  mount.prepend(button);
  applyEasyMode(getEasyMode());
}

function injectEasyModeCoach(help) {
  const host = document.querySelector(".student-shell") || document.querySelector(".lesson-main-header");
  if (!host || !help || document.getElementById("easyModeCoach")) return;

  const coach = document.createElement("div");
  coach.id = "easyModeCoach";
  coach.className = "easy-mode-coach";
  coach.innerHTML = `
    <div class="easy-mode-coach-icon"><i class="fa-solid fa-volume-high"></i></div>
    <div>
      <div class="fw-bold">${escapeHtml(help.title)}</div>
      <p class="mb-0">${escapeHtml(help.text)}</p>
    </div>
    <button class="btn btn-outline-primary btn-sm" type="button" data-easy-speak="${escapeHtml(`${help.title}. ${help.text}`)}">
      Nghe hướng dẫn
    </button>
  `;
  host.appendChild(coach);
}

function bindEasyModeEvents() {
  document.addEventListener("click", (event) => {
    const toggle = event.target.closest("[data-easy-mode-toggle]");
    if (toggle) {
      const next = !getEasyMode();
      globalThis.localStorage?.setItem(EASY_MODE_KEY, next ? "1" : "0");
      applyEasyMode(next);
      if (next) speakText("Đã bật chế độ dễ. Chữ và nút đã lớn hơn. Bạn có thể bấm Nghe hướng dẫn để máy đọc nội dung.");
      return;
    }

    const speakButton = event.target.closest("[data-easy-speak]");
    if (speakButton) {
      speakText(speakButton.dataset.easySpeak || speakButton.closest(".question-card, .quiz-question, section")?.textContent);
    }
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
