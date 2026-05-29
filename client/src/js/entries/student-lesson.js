import { API_PATHS } from "../constants/apiPaths.js";
import { renderLessonList } from "../modules/student/views/dashboardView.js";
import { getDashboardState } from "../modules/student/state/dashboardState.js";

const state = {
  lesson: null,
  questions: [],
  answers: {}
};

document.addEventListener("DOMContentLoaded", init);

async function loadLesson(lessonId) {
  const res = await globalThis.DriveSchoolCommon.apiFetch(
    API_PATHS.LEARNING_WORKSPACE
  );

const dashboardState = getDashboardState();

dashboardState.learningWorkspace = {
  ...(res.data || {}),
  currentLessonId: lessonId
};

  const lessons = res.data?.lessons || [];
  const lesson = lessons.find(l => l.id === lessonId);

    const saved = localStorage.getItem("lesson_answers_" + lessonId);
    if (saved) {
    state.answers = JSON.parse(saved);
    }

  if (!lesson) {
    throw new Error("Không tìm thấy bài học");
  }
  if (lesson.watched) {
    document.getElementById("quizSection").classList.remove("d-none");
  }

  state.lesson = lesson;
  state.questions = lesson.questions || [];

  // ✅ preload ảnh trước khi render để tránh nhấp nháy khi hiển thị quiz
  preloadImages(state.questions);

  renderLessonList();
  renderProgress(res.data);
  renderLesson();
  renderQuiz();
  setupLazyImages();
  setupPrevNext(lessons, lessonId);
}

function renderLesson() {
  document.getElementById("lessonTitle").innerText = state.lesson.title;

  const videoUrl = convertYoutube(state.lesson.video_url);

  document.getElementById("lessonVideo").src = videoUrl;
}

function convertYoutube(url) {
  try {
    const parsed = new URL(url);

    if (!["http:", "https:"].includes(parsed.protocol)) return "";

    const match = url.match(/v=([^&]+)/);
    return match
      ? `https://www.youtube.com/embed/${match[1]}`
      : "";
  } catch {
    return "";
  }
}

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderQuiz() {
  const el = document.getElementById("quizForm");
  el.innerHTML = "";

  if (!state.questions.length) {
    const p = document.createElement("p");
    p.textContent = "Không có câu hỏi";
    el.appendChild(p);
    return;
  }

  state.questions.forEach((q, i) => {
    const wrapper = document.createElement("div");
    wrapper.className = "mb-3";
    const title = document.createElement("p");
    const b = document.createElement("b");
    b.textContent = `${i + 1}. ${q.question}`;
    title.appendChild(b);
    wrapper.appendChild(title);
    // ✅ HIỂN THỊ ẢNH NẾU CÓ
    if (q.image_url) {
      const img = document.createElement("img");

      img.dataset.src = q.image_url; // ✅ lazy load
      img.className = "img-fluid mb-2 rounded d-block mx-auto";
      img.style.maxHeight = "250px";
      img.style.cursor = "pointer";
      img.alt = "Ảnh câu hỏi";
  
      img.onmouseover = () => img.style.transform = "scale(1.02)";
      img.onmouseout = () => img.style.transform = "scale(1)";
      img.style.transition = "0.2s";

      // ✅ chỉ load khi cần (lazy)
      img.loading = "lazy";

      // ✅ zoom modal
      img.onclick = () => {
        const modalEl = document.getElementById("imagePreviewModal");
        const previewImg = document.getElementById("previewImage");

        previewImg.src = q.image_url;

        const modal = new bootstrap.Modal(modalEl);
        modal.show();
      };

      wrapper.appendChild(img);
    }

    ["A", "B", "C", "D"].forEach(opt => {
      const div = document.createElement("div");

      const input = document.createElement("input");
      input.type = "radio";
      input.name = `q${q.id}`;
      input.value = opt;

      if (state.answers[q.id] === opt) {
        input.checked = true;
      }

      input.onchange = () => {
        saveAnswer(q.id, opt);

        // remove highlight các option khác
        div.parentElement.querySelectorAll("div").forEach(el => {
          el.classList.remove("selected-option");
        });

        div.classList.add("selected-option");
      };

      const label = document.createElement("label");
      label.textContent = `${opt}: ${escapeHTML(q[`option_${opt.toLowerCase()}`])}`;

      div.appendChild(input);
      div.appendChild(label);

      wrapper.appendChild(div);
    });

    el.appendChild(wrapper);
  });
}

function saveAnswer(qid, val) {
  state.answers[qid] = val;

  localStorage.setItem(
    "lesson_answers_" + state.lesson.id,
    JSON.stringify(state.answers)
  );
}

function bindEvents() {
  document
    .getElementById("markCompleteBtn")
    .addEventListener("click", async () => {
      try {
        // ✅ GỌI API MARK WATCHED
        await DriveSchoolCommon.apiFetch(
          API_PATHS.LEARNING_LESSON_WATCHED(state.lesson.id),
          {
            method: "POST"
          }
        );

        // ✅ Cập nhật state local
        state.lesson.watched = true;

        // ✅ Hiện quiz
        document.getElementById("quizSection").classList.remove("d-none");

        // ✅ Disable nút cho đẹp UX
        const btn = document.getElementById("markCompleteBtn");
        btn.disabled = true;
        btn.innerText = "✅ Đã đánh dấu";

      } catch (err) {
        console.error(err);
        alert("Không thể đánh dấu đã xem");
      }
    });

  document
    .getElementById("submitQuizBtn")
    .addEventListener("click", submitQuiz);
}

async function submitQuiz(e) {
  e.preventDefault();
  const submitBtn = document.getElementById("submitQuizBtn");
  submitBtn.disabled = true;
  submitBtn.innerText = "⏳ Đang chấm bài...";

  const inputs = document.querySelectorAll("#quizForm input");
  inputs.forEach(i => i.disabled = true);

  const answers = {};

  state.questions.forEach(q => {
    const checked = document.querySelector(`input[name="q${q.id}"]:checked`);
    if (checked) {
      answers[q.id] = checked.value;
    }
  });

  try {
    const res = await DriveSchoolCommon.apiFetch(
      API_PATHS.SUBMIT_LESSON(state.lesson.id),
      {
        method: "POST",
        body: JSON.stringify({ answers })
      }
    );

    const result = res.data;

    const questionDivs = document.querySelectorAll("#quizForm > div");

    result.details.forEach((d, i) => {
      const div = questionDivs[i];
      div.classList.add(d.is_correct ? "correct" : "wrong");
      // ✅ border màu
      div.style.border = d.is_correct
        ? "2px solid #28a745"
        : "2px solid #dc3545";

      // ✅ tạo element thay vì innerHTML
      const status = document.createElement("div");
      status.className = `mt-2 small ${
        d.is_correct ? "text-success" : "text-danger"
      }`;
      status.textContent = d.is_correct ? "✅ Đúng" : "❌ Sai";

      const explain = document.createElement("div");
      explain.className = "small text-muted";
      explain.textContent = "👉 " + (d.explanation || "");

      div.appendChild(status);
      div.appendChild(explain);
    });

    showResultModal(result);

  } catch (err) {
    console.error(err);
    alert("Lỗi nộp bài");
  }
}

function showResultModal(result) {
  const modalEl = document.getElementById("resultModal");
  const modal = new bootstrap.Modal(modalEl);

  const statusEl = document.getElementById("resultStatus");
  const scoreEl = document.getElementById("resultScore");
  const detailsEl = document.getElementById("resultDetails");

  // ✅ clear
  detailsEl.innerHTML = "";

  // ✅ status (KHÔNG dùng innerHTML dynamic)
  statusEl.textContent = result.passed ? "✅ Qua bài" : "❌ Chưa đạt";
  statusEl.className = result.passed ? "text-success" : "text-danger";

  scoreEl.textContent = `Bạn đúng ${result.score}/${result.total}`;

  // ✅ render details safely
  result.details.forEach((d, i) => {
    const div = document.createElement("div");
    div.className = "mb-2";

    const title = document.createElement("b");
    title.textContent = `Câu ${i + 1}`;

    const status = document.createElement("div");
    status.className = d.is_correct ? "text-success" : "text-danger";
    status.textContent = d.is_correct ? "✅ Đúng" : "❌ Sai";

    const explain = document.createElement("div");
    explain.className = "text-muted small";
    explain.textContent = "👉 " + (d.explanation || "");

    div.appendChild(title);
    div.appendChild(status);
    div.appendChild(explain);

    detailsEl.appendChild(div);
  });

  // ✅ buttons
  document.getElementById("retryBtn").onclick = () => {
    location.reload();
  };

  document.getElementById("backBtn").onclick = () => {
    location.href = "/dashboard.html";
  };

  const nextBtn = document.getElementById("nextLessonBtn");

  const lessons = getDashboardState().learningWorkspace.lessons;
  const index = lessons.findIndex(l => l.id === state.lesson.id);
  const next = lessons[index + 1];

  if (result.passed && next && next.unlocked) {
    nextBtn.classList.remove("d-none");
    nextBtn.onclick = () => {
      location.href = `/lesson.html?id=${next.id}`;
    };
  } else {
    nextBtn.classList.add("d-none");
  }

  modal.show();
  
  setTimeout(() => {
    modalEl.querySelector(".modal-content")
      ?.classList.add("animate-modal");
  }, 50);
}

function renderProgress(workspace) {
  const completed = workspace.completed_count || 0;
  const total = workspace.total_count || 0;

  const percent = total ? Math.round((completed / total) * 100) : 0;
  const bar = document.getElementById("progressBar");
  bar.style.transition = "width 0.6s ease";
  bar.style.width = percent + "%";

  document.getElementById("progressText").innerText =
    `${percent}% (${completed}/${total})`;
}
function setupPrevNext(lessons, lessonId) {
  const index = lessons.findIndex(l => l.id === lessonId);

  const prev = lessons[index - 1];
  const next = lessons[index + 1];

  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
    
// prevBtn.classList.toggle("opacity-50", !prev);
// nextBtn.classList.toggle("opacity-50", !next || !next.unlocked);

  if (prevBtn) {
    prevBtn.disabled = !prev;
    if (prev) {
      prevBtn.onclick = () =>
        globalThis.location.href = `/lesson.html?id=${prev.id}`;
    }
  }

  if (nextBtn) {
    nextBtn.disabled = !next || !next.unlocked;

    if (next && next.unlocked) {
      nextBtn.onclick = () =>
        globalThis.location.href = `/lesson.html?id=${next.id}`;
    }
  }
}

function preloadImages(questions) {
  questions.forEach(q => {
    if (q.image_url) {
      const img = new Image();
      img.src = q.image_url;
    }
  });
}

function setupLazyImages() {
  const imgs = document.querySelectorAll("img[data-src]");

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;

        obs.unobserve(img);
      }
    });
  });

  imgs.forEach(img => observer.observe(img));
}

async function init() {
    try {
        const params = new URLSearchParams(globalThis.location.search);
        const lessonId = params.get("id");

        await loadLesson(lessonId);
        bindEvents();
    } catch (err) {
        console.error(err);
        alert("Lỗi load bài học");
    }
}
