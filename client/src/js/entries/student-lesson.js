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

  renderLessonList();
  renderProgress(res.data);
  renderLesson();
  renderQuiz();
  setupPrevNext(lessons, lessonId);
}

function renderLesson() {
  document.getElementById("lessonTitle").innerText = state.lesson.title;

  const videoUrl = convertYoutube(state.lesson.video_url);

  document.getElementById("lessonVideo").src = videoUrl;
}

function convertYoutube(url) {
  if (!url) return "";

  const match = url.match(/v=([^&]+)/);
  return match
    ? `https://www.youtube.com/embed/${match[1]}`
    : url;
}

function renderQuiz() {
  const el = document.getElementById("quizForm");

  if (!state.questions.length) {
    el.innerHTML = "<p>Không có câu hỏi</p>";
    return;
  }

  el.innerHTML = state.questions.map((q, i) => `
    <div class="mb-3">
      <p><b>${i + 1}. ${q.question}</b></p>

      ${["A","B","C","D"].map(opt => `
        <div>        
            <input 
            type="radio" 
            name="q${q.id}" 
            value="${opt}"
            onchange="saveAnswer('${q.id}','${opt}')"
            ${state.answers[q.id] === opt ? "checked" : ""}
            >
          ${opt}: ${q[`option_${opt.toLowerCase()}`]}
        </div>
      `).join("")}
    </div>
  `).join("");
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
document.querySelectorAll("#quizForm input").forEach(i => i.disabled = true);
  e.preventDefault();

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
            body: JSON.stringify({
            answers
            })
        }
    );
    const result = res.data;
    
    result.details.forEach((d, i) => {
    const div = document.querySelectorAll("#quizForm > div")[i];

    div.style.border = d.is_correct
        ? "2px solid green"
        : "2px solid red";

    div.innerHTML += `
        <div class="mt-2 small ${d.is_correct ? "text-success" : "text-danger"}">
        ${d.is_correct ? "✅ Đúng" : "❌ Sai"}
        </div>
        <div class="small text-muted">
        👉 ${d.explanation || ""}
        </div>
    `;
    });

    
const modalEl = document.getElementById("resultModal");
const modal = new bootstrap.Modal(modalEl);

document.getElementById("resultStatus").innerHTML =
  result.passed
    ? `<span class="text-success">✅ Qua bài</span>`
    : `<span class="text-danger">❌ Chưa đạt</span>`;

    document.getElementById("resultScore").innerText =
    `Bạn đúng ${result.score}/${result.total}`;

    // ✅ render chi tiết
    document.getElementById("resultDetails").innerHTML =
    result.details.map((d, i) => `
        <div class="mb-2">
        <b>Câu ${i + 1}</b>: ${d.question}
        <br>
        <span class="${d.is_correct ? "text-success" : "text-danger"}">
            ${d.is_correct ? "✅ Đúng" : "❌ Sai"}
        </span>
        <br>
        <span class="text-muted">👉 ${d.explanation || ""}</span>
        </div>
    `).join("");

    // ✅ gắn event nút
    document.getElementById("retryBtn").onclick = () => {
    globalThis.location.reload();
    };

    document.getElementById("backBtn").onclick = () => {
    globalThis.location.href = "/dashboard.html";
    };

    modal.show();

const nextBtn = document.getElementById("nextLessonBtn");

// lấy lesson list
const lessons = getDashboardState().learningWorkspace.lessons;
const index = lessons.findIndex(l => l.id === state.lesson.id);
const next = lessons[index + 1];

if (result.passed && next && next.unlocked) {
  // ✅ hiện nút bài tiếp
  nextBtn.classList.remove("d-none");

  nextBtn.onclick = () => {
    globalThis.location.href = `/lesson.html?id=${next.id}`;
  };

} else {
  // ❌ fail hoặc không có bài tiếp
  nextBtn.classList.add("d-none");
}


  } catch (err) {
    console.error(err);
    alert("Lỗi nộp bài");
  }
}

function renderProgress(workspace) {
  const completed = workspace.completed_count || 0;
  const total = workspace.total_count || 0;

  const percent = total ? Math.round((completed / total) * 100) : 0;

  document.getElementById("progressBar").style.width = percent + "%";
  document.getElementById("progressText").innerText =
    `${percent}% (${completed}/${total})`;
}
function setupPrevNext(lessons, lessonId) {
  const index = lessons.findIndex(l => l.id === lessonId);

  const prev = lessons[index - 1];
  const next = lessons[index + 1];

  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
    
prevBtn.classList.toggle("opacity-50", !prev);
nextBtn.classList.toggle("opacity-50", !next || !next.unlocked);

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
