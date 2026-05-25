/**
 * Copyright (c) 2026 Driving Training Center Hang Ha
 * (Trung tam dao tao lai xe Hang Ha)
 *
 * All rights reserved.
 */
const { createId, nowIso } = require("../utils/helpers");
const { hashPassword } = require("./authService");
const { isProduction } = require("../config/security");

const mockStore = {
  registrations: [
    {
      id: createId("reg"),
      name: "Nguyen Thi Lan",
      phone: "0901234567",
      email: "lan@example.com",
      course_type: "B2",
      note: "Muon hoc cuoi tuan",
      created_at: nowIso()
    },
    {
      id: createId("reg"),
      name: "Tran Quoc Huy",
      phone: "0913456789",
      email: "huy@example.com",
      course_type: "A1",
      note: "Can tu van hoc phi",
      created_at: nowIso()
    }
  ],
  users: isProduction()
    ? []
    : [
        {
          id: "admin_001",
          name: "System Admin",
          email: "admin@drivingschool.vn",
          password_hash: hashPassword("Admin@123"),
          role: "admin",
          course_type: "",
          created_at: nowIso()
        },
        {
          id: "student_001",
          name: "Nguyen Minh Anh",
          email: "student@drivingschool.vn",
          password_hash: hashPassword("Student@123"),
          role: "student",
          course_type: "B2",
          created_at: nowIso()
        },
        {
          id: "student_002",
          name: "Tran Quoc Huy",
          email: "huy@drivingschool.vn",
          password_hash: hashPassword("Student@123"),
          role: "student",
          course_type: "A1",
          created_at: nowIso()
        },
        {
          id: "student_003",
          name: "Le Thu Ha",
          email: "ha@drivingschool.vn",
          password_hash: hashPassword("Student@123"),
          role: "student",
          course_type: "C1",
          created_at: nowIso()
        }
      ],
  exams: [
    {
      id: "exam_a1_001",
      course_type: "A1",
      title: "De A1 Co Ban 01",
      pass_score: 21,
      total_questions: 25,
      duration_minutes: 18,
      active: true
    },
    {
      id: "exam_b2_001",
      course_type: "B2",
      title: "B2 Mock Test 01",
      pass_score: 3,
      total_questions: 4,
      duration_minutes: 20,
      active: true
    },
    {
      id: "exam_b2_002",
      course_type: "B2",
      title: "B2 Mock Test 02",
      pass_score: 2,
      total_questions: 3,
      duration_minutes: 20,
      active: true
    },
    {
      id: "exam_c1_001",
      course_type: "C1",
      title: "De C1 Tinh Huong 01",
      pass_score: 2,
      total_questions: 3,
      duration_minutes: 22,
      active: true
    }
  ],
  lessons: [
    {
      id: "lesson_b2_001",
      course_type: "B2",
      title: "Bai 1: Sa hinh co ban",
      description: "Lam quen voi thao tac sa hinh, dung dung vi tri va can chuan toc do.",
      order_no: 1,
      video_url: "/assets/videos/video1.mp4",
      pass_score: 2,
      active: true
    },
    {
      id: "lesson_b2_002",
      course_type: "B2",
      title: "Bai 2: Xu ly duong truong",
      description: "Quan sat bien bao, giu khoang cach va thao tac vuot an toan.",
      order_no: 2,
      video_url: "/assets/videos/video1.mp4",
      pass_score: 2,
      active: true
    },
    {
      id: "lesson_b2_003",
      course_type: "B2",
      title: "Bai 3: Tinh huong nguy hiem",
      description: "Mo phong cac tinh huong khan cap va cach xu ly de tranh tai nan.",
      order_no: 3,
      video_url: "/assets/videos/video1.mp4",
      pass_score: 2,
      active: true
    }
  ],
  simulation_exams: [
    {
      id: "sim_b2_001",
      course_type: "B2",
      title: "De thi mo phong B2 - Co ban",
      description: "Mo phong tinh huong giao thong, nhan Space dung thoi diem nguy hiem.",
      pass_score: 9,
      total_clips: 3,
      active: true
    }
  ],
  simulation_clips: [
    {
      id: "sim_clip_001",
      exam_id: "sim_b2_001",
      title: "Tinh huong 1: Xe cat ngang",
      video_url: "/assets/videos/video1.mp4",
      order_no: 1,
      trigger_start_sec: 3.5,
      trigger_end_sec: 5.2,
      active: true
    },
    {
      id: "sim_clip_002",
      exam_id: "sim_b2_001",
      title: "Tinh huong 2: Nguoi di bo bang qua",
      video_url: "/assets/videos/video1.mp4",
      order_no: 2,
      trigger_start_sec: 4.2,
      trigger_end_sec: 6,
      active: true
    },
    {
      id: "sim_clip_003",
      exam_id: "sim_b2_001",
      title: "Tinh huong 3: Xe truoc phanh gap",
      video_url: "/assets/videos/video1.mp4",
      order_no: 3,
      trigger_start_sec: 2.8,
      trigger_end_sec: 4,
      active: true
    }
  ],
  simulation_attempts: [
    {
      id: createId("sim_attempt"),
      user_id: "student_001",
      exam_id: "sim_b2_001",
      attempt_no: 1,
      score: 11,
      passed: true,
      submitted_at: nowIso(),
      answers_json: JSON.stringify({
        sim_clip_001: 4.1,
        sim_clip_002: 5.1
      }),
      details_json: JSON.stringify([])
    }
  ],
  lesson_questions: [
    {
      id: createId("lesson_q"),
      lesson_id: "lesson_b2_001",
      question: "Truoc khi de-pa trong bai sa hinh, ban can uu tien thao tac nao?",
      option_a: "Nhan ga manh",
      option_b: "Kiem tra guong, that day an toan va quan sat",
      option_c: "Tat den xe",
      option_d: "Bam coi lien tuc",
      correct_answer: "B",
      explanation: "Kiem tra guong va day an toan la bat buoc truoc khi khoi hanh."
    },
    {
      id: createId("lesson_q"),
      lesson_id: "lesson_b2_001",
      question: "Loi pho bien trong bai ghep doc la gi?",
      option_a: "Danh lai sai thoi diem",
      option_b: "Di so 1",
      option_c: "Nhin guong",
      option_d: "Di cham",
      correct_answer: "A",
      explanation: "Danh lai qua som hoac qua muon de cham vach va truot bai."
    },
    {
      id: createId("lesson_q"),
      lesson_id: "lesson_b2_002",
      question: "Gap xe phanh gap phia truoc, ban nen lam gi?",
      option_a: "Nhan ga",
      option_b: "Phanh giam toc va giu khoang cach",
      option_c: "Re gap",
      option_d: "Tat den",
      correct_answer: "B",
      explanation: "Phanh co kiem soat va giu khoang cach giup tranh va cham."
    },
    {
      id: createId("lesson_q"),
      lesson_id: "lesson_b2_002",
      question: "Khi troi mua lon, dieu chinh dung la?",
      option_a: "Tang toc",
      option_b: "Bat den, giam toc va tang khoang cach",
      option_c: "Tat den",
      option_d: "Chi dung ga",
      correct_answer: "B",
      explanation: "Tam nhin giam va duong truot nen can giam toc, giu khoang cach."
    },
    {
      id: createId("lesson_q"),
      lesson_id: "lesson_b2_003",
      question: "Xe may cat ngang dot ngot truoc dau xe, xu ly dung la?",
      option_a: "Danh lai gap",
      option_b: "Phanh co kiem soat va giu huong",
      option_c: "Nhan ga",
      option_d: "Nham mat",
      correct_answer: "B",
      explanation: "Phanh co kiem soat giup xe on dinh va han che mat lai."
    },
    {
      id: createId("lesson_q"),
      lesson_id: "lesson_b2_003",
      question: "Muc tieu uu tien khi xu ly nguy hiem la?",
      option_a: "Bao ve xe",
      option_b: "Bao dam an toan tinh mang nguoi",
      option_c: "Tranh truot diem",
      option_d: "Tang toc",
      correct_answer: "B",
      explanation: "An toan con nguoi luon la muc tieu uu tien cao nhat."
    }
  ],
  questions: [
    {
      id: "q_a1_001",
      exam_id: "exam_a1_001",
      question: "Nguoi dieu khien xe mo to gap den do phai lam gi?",
      option_a: "Dung truoc vach dung",
      option_b: "Tang ga de vuot nhanh",
      option_c: "Bam coi lien tuc",
      option_d: "Re phai khong quan sat",
      correct_answer: "A",
      is_critical: true,
      explanation: "Den do bat buoc dung truoc vach dung de bao dam an toan."
    },
    {
      id: "q_a1_002",
      exam_id: "exam_a1_001",
      question: "Khi chuyen huong xe may, nguoi lai xe can?",
      option_a: "Bat tin hieu bao huong",
      option_b: "Tang toc manh",
      option_c: "Chi nhin phia truoc",
      option_d: "Khong can xi nhan",
      correct_answer: "A",
      is_critical: false,
      explanation: "Bat tin hieu bao huong giup cac phuong tien khac nhan biet."
    },
    {
      id: "q_b2_001",
      exam_id: "exam_b2_001",
      question: "What should a driver do when a red traffic light appears?",
      option_a: "Proceed if the road is clear",
      option_b: "Stop behind the line",
      option_c: "Honk and continue",
      option_d: "Slow down only",
      correct_answer: "B",
      is_critical: true,
      explanation: "At a red light, the driver must stop behind the stop line and wait for the next signal."
    },
    {
      id: "q_b2_002",
      exam_id: "exam_b2_001",
      question: "What is a safe action before changing lanes?",
      option_a: "Check mirrors and blind spots",
      option_b: "Accelerate immediately",
      option_c: "Turn without signaling",
      option_d: "Only look forward",
      correct_answer: "A",
      is_critical: false,
      explanation: "Before changing lanes, the driver should check mirrors and blind spots to avoid collisions."
    },
    {
      id: "q_b2_003",
      exam_id: "exam_b2_001",
      question: "Which document should be carried while driving?",
      option_a: "Driving license and vehicle papers",
      option_b: "Library card",
      option_c: "Only identity card",
      option_d: "No documents are needed",
      correct_answer: "A",
      is_critical: false,
      explanation: "Drivers should carry their driving license and relevant vehicle papers."
    },
    {
      id: "q_b2_004",
      exam_id: "exam_b2_001",
      question: "What must you do at a pedestrian crossing with people waiting?",
      option_a: "Speed up",
      option_b: "Yield and stop when needed",
      option_c: "Ignore if there is no traffic police",
      option_d: "Use high beam",
      correct_answer: "B",
      is_critical: true,
      explanation: "Pedestrians have priority at the crossing."
    },
    {
      id: "q_b2x_001",
      exam_id: "exam_b2_002",
      question: "Khi lai xe trong mua lon, thao tac nao dung?",
      option_a: "Tang toc de qua vung mua nhanh",
      option_b: "Bat den, giam toc, tang khoang cach",
      option_c: "Tat den chieu gan",
      option_d: "Chi dung phanh tay",
      correct_answer: "B",
      is_critical: false,
      explanation: "Giam toc do va tang khoang cach giup xe an toan hon."
    },
    {
      id: "q_b2x_002",
      exam_id: "exam_b2_002",
      question: "Gap bien cam quay dau, lai xe phai?",
      option_a: "Quay dau neu duong vang",
      option_b: "Tiep tuc di va tuan thu bien bao",
      option_c: "Quay dau khi khong co CSGT",
      option_d: "Bat den khan cap va quay dau",
      correct_answer: "B",
      is_critical: true,
      explanation: "Bien cam quay dau co hieu luc bat buoc nguoi lai xe phai chap hanh."
    },
    {
      id: "q_b2x_003",
      exam_id: "exam_b2_002",
      question: "Khi vuot xe, tai xe can?",
      option_a: "Bam coi, xi nhan va vuot khi an toan",
      option_b: "Vuot o moi noi",
      option_c: "Vuot tai duong cong bi che khuat",
      option_d: "Vuot khi xe doi dien dang den gan",
      correct_answer: "A",
      is_critical: false,
      explanation: "Chi vuot khi du dieu kien an toan va co bao hieu ro rang."
    },
    {
      id: "q_c1_001",
      exam_id: "exam_c1_001",
      question: "Xe tai C1 khi xuong doc dai can uu tien thao tac nao?",
      option_a: "Ve so thap va phanh dong co",
      option_b: "Tat may troi doc",
      option_c: "Ve so 0",
      option_d: "Chi dap phanh lien tuc",
      correct_answer: "A",
      is_critical: true,
      explanation: "Xe tai khi xuong doc dai can su dung so thap va phanh dong co."
    },
    {
      id: "q_c1_002",
      exam_id: "exam_c1_001",
      question: "Truoc khi xep hang len xe tai, can kiem tra?",
      option_a: "Tai trong cho phep",
      option_b: "Chi mau son cua xe",
      option_c: "So ghe tren cabin",
      option_d: "Den trong xe",
      correct_answer: "A",
      is_critical: false,
      explanation: "Tai trong cho phep la yeu to an toan va phap ly quan trong."
    }
  ],
  lesson_watches: [],
  lesson_attempts: [],
  third_party_attempts: [
    {
      id: createId("tp_attempt"),
      user_id: "student_001",
      course_type: "B2",
      exam_type: "Thi ly thuyet",
      platform_name: "ThiThuLaiXe",
      exam_url: "https://thithulaixe.com/",
      score: 28,
      passed: true,
      note: "Lam tot phan bien bao",
      proof_url: "",
      submitted_at: nowIso()
    },
    {
      id: createId("tp_attempt"),
      user_id: "student_002",
      course_type: "A1",
      exam_type: "Thi 600 cau",
      platform_name: "ThiThuLaiXeVN",
      exam_url: "https://thithulaixe.vn/",
      score: 19,
      passed: false,
      note: "Sai nhom cau diem liet",
      proof_url: "",
      submitted_at: nowIso()
    }
  ],
  exam_results: [
    {
      id: createId("result"),
      user_id: "student_001",
      exam_id: "exam_b2_001",
      attempt_no: 1,
      score: 3,
      passed: true,
      failed_due_critical: false,
      submitted_at: nowIso(),
      answers_json: JSON.stringify({
        q_b2_001: "B",
        q_b2_002: "A",
        q_b2_003: "A",
        q_b2_004: "B"
      })
    },
    {
      id: createId("result"),
      user_id: "student_001",
      exam_id: "exam_b2_002",
      attempt_no: 1,
      score: 1,
      passed: false,
      failed_due_critical: true,
      submitted_at: nowIso(),
      answers_json: JSON.stringify({
        q_b2x_001: "B",
        q_b2x_002: "A",
        q_b2x_003: "D"
      })
    }
  ],
  visits: [
    {
      id: createId("visit"),
      ip: "127.0.0.1",
      page: "/index.html",
      lang: "vi",
      visited_at: nowIso()
    },
    {
      id: createId("visit"),
      ip: "127.0.0.1",
      page: "/login.html",
      lang: "vi",
      visited_at: nowIso()
    }
  ]
};

module.exports = {
  mockStore
};
