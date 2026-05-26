# Admin refactor (phase 4 — HOÀN THÀNH)

## Cấu trúc đã triển khai

```
modules/admin/
  state/
    adminState.js
  services/
    adminApiService.js
  utils/
    adminFormUtils.js
    resultsUtils.js
  views/
    dashboardOverviewView.js
    studentsView.js
    theoryView.js
    simulationView.js
    lessonsView.js
    resultsView.js
  controllers/
    adminController.js
```

Entry: `client/src/js/entries/admin-dashboard.js`  
Trang: `client/public/admin.html` (một trang, tab điều hướng)

## Section / hash

| Tab | Hash | Nội dung |
|-----|------|----------|
| Tổng quan | `#section-overview` | Stats, biểu đồ, bộ lọc ngày/bằng |
| Học viên | `#section-students` | Tạo HV, bảng HV, lead đăng ký |
| Lý thuyết | `#section-theory` | Đề LT + ngân hàng câu hỏi |
| Mô phỏng | `#section-simulation` | Đề MP + clip |
| Bài học | `#section-lessons` | Bài học video + quiz (mới trên UI) |
| Kết quả | `#section-results` | Kết quả LT / MP / 3rd-party |

API backend giữ nguyên (`/api/admin/*`).
