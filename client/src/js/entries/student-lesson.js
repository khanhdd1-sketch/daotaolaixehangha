import { API_PATHS } from "../constants/apiPaths.js";
import { initStudentEasyMode, speakText } from "../modules/student/easyMode.js";
import { renderLessonList } from "../modules/student/views/dashboardView.js";
import { getDashboardState } from "../modules/student/state/dashboardState.js";

const state = {
  lesson: null,
  questions: [],
  shuffledQuestions: [], // ✅ ADD
  answers: {},
  submitted: false // ✅ ADD
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
  // preloadImages(state.questions);

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

  const lessonIntro = document.getElementById("lessonEasyIntro");
  if (lessonIntro) {
    lessonIntro.dataset.easySpeak = `Bài học ${state.lesson.title}. Xem video trước. Khi xem xong hãy bấm Đã xem xong để mở phần trắc nghiệm.`;
  }
}

function convertYoutube(url) {
  try {
    const parsed = new URL(url);

    if (!["http:", "https:"].includes(parsed.protocol)) {
      return "";
    }

    let videoId = "";

    // youtube.com/watch?v=
    if (
      parsed.hostname.includes("youtube.com") &&
      parsed.searchParams.has("v")
    ) {
      videoId = parsed.searchParams.get("v");
    }

    // youtu.be/xxxx
    else if (parsed.hostname.includes("youtu.be")) {
      videoId = parsed.pathname.slice(1);
    }

    // youtube.com/embed/xxxx
    else if (parsed.pathname.startsWith("/embed/")) {
      videoId = parsed.pathname.split("/embed/")[1];
    }

    return videoId
      ? `https://www.youtube.com/embed/${videoId}`
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

  // ✅ nếu đã submit thì không clear nữa
  if (!state.submitted) {
    el.innerHTML = "";
  }
  if (!state.questions.length) {
    const p = document.createElement("p");
    p.textContent = "Không có câu hỏi";
    el.appendChild(p);
    return;
  }

  // ✅ chỉ shuffle nếu chưa submit
  if (!state.submitted) {
    state.shuffledQuestions = shuffleArray(state.questions);
  }

  state.shuffledQuestions.forEach((q, i) => {
    const wrapper = document.createElement("div");
    wrapper.dataset.question = q.question;
    wrapper.className = "mb-3";
    wrapper.classList.add("quiz-question");
    // ✅ add dòng này
    wrapper.dataset.id = String(q.id); // ✅ ensure giống backend key
    
    const title = document.createElement("p");
    const b = document.createElement("b");
    b.textContent = `${i + 1}. ${q.question}`;
    title.appendChild(b);
    wrapper.appendChild(title);

    const speakButton = document.createElement("button");
    speakButton.type = "button";
    speakButton.className = "btn btn-outline-primary btn-sm mb-2";
    speakButton.innerHTML = '<i class="fa-solid fa-volume-high me-1"></i>Nghe câu hỏi';
    speakButton.onclick = () => speakText(buildQuestionSpeech(q, i));
    wrapper.appendChild(speakButton);
    // ✅ HIỂN THỊ ẢNH NẾU CÓ
    if (q.image_url) {
      const imgWrap = document.createElement("div");
      imgWrap.className = "question-img-wrap text-center";

      const img = document.createElement("img");

      img.dataset.src = q.image_url; // ✅ lazy load
      img.className = "question-img img-fluid mb-2 rounded d-block mx-auto";
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
      imgWrap.appendChild(img);
      // caption nhỏ (gợi UX tốt hơn)
      const caption = document.createElement("div");
      caption.className = "small text-muted";
      caption.textContent = "Bấm vào ảnh để phóng to";

      imgWrap.appendChild(caption);

      wrapper.appendChild(imgWrap);
    }

    ["A", "B", "C", "D"].forEach(opt => {
      const div = document.createElement("div");
      div.className = "option-item";
      const input = document.createElement("input");
      input.type = "radio";
      input.name = `q${q.id}`;
      input.value = opt;

      if (state.answers[q.id] === opt) {
        input.checked = true;
        div.classList.add("selected-option"); // ✅ ADD
      }

      // ✅ CLICK CẢ DIV
      div.onclick = () => {
        input.checked = true;

        saveAnswer(q.id, opt);

        wrapper.querySelectorAll(".option-item").forEach(el => {
          el.classList.remove("selected");
        });

        wrapper.querySelectorAll("div").forEach(el => {
          el.classList.remove("selected-option");
        });

        div.classList.add("selected-option");

        wrapper.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
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
  updateQuizProgress();
  checkAllAnswered(); // ✅ ADD
}

function bindEvents() {
  document.getElementById("backDashboard").onclick = () => {
    location.href = "/exam.html?lang=vi";
  };
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
  const retryBtn = document.getElementById("retryBtn");
  const nextLessonBtn = document.getElementById("nextLesson");

  submitBtn.disabled = true;
  submitBtn.innerText = "⏳ Đang chấm bài...";

  const inputs = document.querySelectorAll("#quizForm input");
  inputs.forEach(i => i.disabled = true);

  const answers = {};

  state.shuffledQuestions.forEach(q => {
    const checked = document.querySelector(`input[name="q${q.id}"]:checked`);
    if (checked) {
      answers[q.id] = checked.value;
    }
  });

  // ✅ ADD ĐOẠN NÀY
  if (Object.keys(answers).length < state.shuffledQuestions.length) {
    alert("⚠️ Bạn cần trả lời tất cả câu hỏi!");
    submitBtn.disabled = false;
    submitBtn.innerText = "✅ Nộp bài";
    return;
  }

  try {
    const res = await DriveSchoolCommon.apiFetch(
      API_PATHS.SUBMIT_LESSON(state.lesson.id),
      {
        method: "POST",
        body: JSON.stringify({ answers })
      }
    );

    const result = res.data;
    state.submitted = true; // ✅ ADD
    // ✅ xử lý sau khi có kết quả
    if (!result.passed) {
      // showResultModal(result);
      const questionDivs = document.querySelectorAll("#quizForm .quiz-question");
      const firstWrong = result.details.find(d => !d.is_correct);
      if (firstWrong) {
        const target = Array.from(questionDivs).find(el =>
          el.dataset.question === firstWrong.question
        );

        // const el = document.querySelector(
        //   `#quizForm > div[data-id="${qid}"]`
        // );

        if (target) {
          target.scrollIntoView({
            behavior: "smooth",
            block: "center"
          });
        }
      }

      submitBtn.classList.add("d-none");
      retryBtn.classList.remove("d-none");
      nextLessonBtn.classList.add("d-none");
      retryBtn.onclick = () => {
        // reset answers
        state.answers = {};
        state.submitted = false; // ✅ ADD
        localStorage.removeItem("lesson_answers_" + state.lesson.id);

        // render lại quiz
        renderQuiz();
        setupLazyImages(); // ✅ THÊM DÒNG NÀY

        // reset UI
        submitBtn.classList.remove("d-none");
        retryBtn.classList.add("d-none");
        submitBtn.disabled = false;
        submitBtn.innerText = "✅ Nộp bài";

        // enable lại input
        const inputs = document.querySelectorAll("#quizForm input");
        inputs.forEach(i => i.disabled = false);

        // reset progress
        document.getElementById("quizProgressBar").style.width = "0%";

        window.scrollTo({ top: 0, behavior: "smooth" });
      };
    }

    if (result.passed) {
      submitBtn.classList.add("d-none");
      nextLessonBtn.classList.remove("d-none");

      const lessons = getDashboardState().learningWorkspace.lessons;
      const index = lessons.findIndex(l => l.id === state.lesson.id);
      const next = lessons[index + 1];

      if (next) {
        nextLessonBtn.onclick = () => {
          location.href = `/lesson.html?id=${next.id}`;
        };
      }
    }
    
    const questionDivs = document.querySelectorAll("#quizForm .quiz-question");

    result.details.forEach((d, i) => {
      
      const normalize = (str) =>
        str?.trim().replace(/\s+/g, " ");
      // const qid = d.question_id ?? d.id;
      const div = Array.from(questionDivs).find(el =>
        normalize(el.dataset.question) === normalize(d.question)
      );


      if (!div) return;

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
    // alert("Lỗi nộp bài");
  }
}

function showResultModal(result) {
  const modalEl = document.getElementById("resultModal");
  const modal = new bootstrap.Modal(modalEl);
  const retryBtn = document.getElementById("retryModalBtn");
  const statusEl = document.getElementById("resultStatus");
  const scoreEl = document.getElementById("resultScore");
  const detailsEl = document.getElementById("resultDetails");
  
  // ✅ luôn hiện sau khi chấm bài xong
  retryBtn.classList.remove("d-none");

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

  document.getElementById("nextLesson").onclick = () => {
    const lessons = getDashboardState().learningWorkspace.lessons;
    const index = lessons.findIndex(l => l.id === state.lesson.id);
    const next = lessons[index + 1];

    if (next) {
      location.href = `/lesson.html?id=${next.id}`;
    } else {
      alert("Không có bài tiếp theo");
    }
  };

  document.getElementById("backBtn").onclick = () => {
    location.href = "/exam.html?lang=vi";
  };

  const nextBtn = document.getElementById("nextLessonBtn");

  const lessons = getDashboardState().learningWorkspace.lessons;
  const index = lessons.findIndex(l => l.id === state.lesson.id);
  const next = lessons[index + 1];

  if (result.passed && next) {
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

function updateQuizProgress() {
  const total = state.shuffledQuestions.length;
  const answered = Object.keys(state.answers).length;

  const percent = Math.round((answered / total) * 100);

  document.getElementById("quizProgressBar").style.width = percent + "%";
}

function checkAllAnswered() {
  const total = state.shuffledQuestions.length;
  const answered = Object.keys(state.answers).length;

  document.getElementById("submitQuizBtn").disabled = answered < total;
}

function shuffleArray(arr) {
  const newArr = [...arr]; // copy tránh phá state gốc
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

/**
 * Tạo nội dung đọc cho câu hỏi.
 * @param   {object} question
 * @param   {number} index
 * @returns {string}
 */
function buildQuestionSpeech(question, index) {
  const parts = [
    `Câu hỏi số ${index + 1}.`,
    question.question
  ];

  ["A", "B", "C", "D"].forEach(option => {
    const value = question[`option_${option.toLowerCase()}`];

    if (value) {
      parts.push(
        `Đáp án ${option}. ${value}`
      );
    }
  });

  parts.push("Vui lòng chọn đáp án của bạn.");

  return parts.join(" ");
}

async function init() {
    try {
        const params = new URLSearchParams(globalThis.location.search);
        const lessonId = params.get("id");

        await loadLesson(lessonId);
        bindEvents();

        // ✅ ADD đoạn này ở đây
        document.getElementById("retryModalBtn").onclick = () => {
          location.reload();
        };
    } catch (err) {
        console.error(err);
        alert("Lỗi load bài học");
    }
}
