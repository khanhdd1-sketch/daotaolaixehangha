import { API_PATHS } from "../constants/apiPaths.js";

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

  const lessons = res.data?.lessons || [];

  const lesson = lessons.find(l => l.id === lessonId);

  if (!lesson) {
    throw new Error("Không tìm thấy bài học");
  }

  state.lesson = lesson;
  state.questions = lesson.questions || [];

  renderLesson();
  renderQuiz();
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
          <input type="radio" name="q${q.id}" value="${opt}">
          ${opt}: ${q[`option_${opt.toLowerCase()}`]}
        </div>
      `).join("")}
    </div>
  `).join("");
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

    alert(`Bạn đúng ${result.score}/${result.total}`);

    if (result.passed) {
      alert("✅ Qua bài");
    } else {
      alert("❌ Chưa đạt");
    }

  } catch (err) {
    console.error(err);
    alert("Lỗi nộp bài");
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
