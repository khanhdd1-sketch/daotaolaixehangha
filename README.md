🚗 Driving School Platform
Last updated: 2026-05-26
Website quản lý trung tâm dạy lái xe — thiết kế theo hướng đơn giản, dễ vận hành, dễ deploy, không cần database phức tạp.

Frontend: Static (HTML + Bootstrap + JS)
Backend: Node.js + Express
Storage:

Mock mode (demo nhanh)
Google Sheets (production)


Deploy: Vercel (khuyến nghị)


📌 1. Tổng quan hệ thống
Hệ thống gồm 3 nhóm người dùng:
👤 Khách truy cập (Guest)

Xem landing page
Xem thông tin khóa học
Gửi form đăng ký tư vấn

🎓 Học viên (Student)

Đăng nhập
Xem thông tin khóa học
Làm bài thi:

Lý thuyết
Mô phỏng
Link thi bên thứ 3


Gửi kết quả thi
Upload ảnh minh chứng
Xem lịch sử và tiến độ
✅ Đánh dấu bài học đã xem

🛠 Admin

Dashboard tổng quan
Quản lý học viên
Quản lý bài học
Quản lý đề thi
Xem kết quả
Theo dõi lead khách hàng
✅ Phân trang dữ liệu lớn (server-side)


🆕 2. Update lớn (Refactor 2026)
✅ 2.1 Tách admin thành nhiều trang
Trước:

1 file admin lớn

Sau:

6 page riêng:

admin.html              → Dashboard
admin-students.html     → Học viên
admin-results.html      → Kết quả
admin-theory.html       → Lý thuyết
admin-simulation.html   → Mô phỏng
admin-lessons.html      → Bài học

👉 Dễ bảo trì + dễ mở rộng

✅ 2.2 Frontend module hóa
client/src/js/
  entries/     → entry từng page
  modules/     → logic chia nhỏ


shared → dùng chung
admin → logic admin
student → logic học viên

👉 Code sạch, scale tốt

✅ 2.3 Phân trang server-side (Admin Results)
API mới:
GET /api/admin/result-rows?page=1&limit=20

Response:
JSON{  "data": [],  "total": 100,  "page": 1,  "limit": 20,  "totalPages": 5}Show more lines
👉 Load nhanh khi data lớn

✅ 2.4 UI cải tiến

❌ bỏ confirm()
✅ dùng Bootstrap modal (confirmModalView.js)


✅ 2.5 Testing đầy đủ
Shellnpm run test:clientnpm run test:servernpm run test:e2eShow more lines

Unit test
Integration
Playwright E2E


✅ 2.6 Service Worker (Offline + Cache)
Shellnpm run build:sw-manifestShow more lines
👉 Web load nhanh, hỗ trợ offline cơ bản

✅ 2.7 Học viên mark bài học
POST /api/learning/lessons/:id/watched


🗂 3. Cấu trúc project
client/
  public/
  src/
    css/
    js/
    i18n/

server/
  src/

apps-script/

api/
vercel.json


🌐 4. Các trang chính

































URLMô tả/Trang chủ/login.htmlLogin/admin.htmlDashboard admin/exam.htmlThi/result.htmlKết quả/healthCheck server

⚙️ 5. Chạy local (NHANH NHẤT)
5.1 Tạo file env
server/.env

Plain Textenv isn’t fully supported. Syntax highlighting is based on Plain Text.NODE_ENV=developmentPORT=5000JWT_SECRET=dev-secretUSE_MOCK_DATA=trueALLOWED_ORIGINS=http://localhost:5000Show more lines

5.2 Chạy project
Shellnpm.cmd installnpm.cmd run devShow more lines

5.3 Mở web
http://localhost:5000


👤 6. Tài khoản demo
Khi:
USE_MOCK_DATA=true


Admin: admin@drivingschool.vn / Admin@123
Student: student@drivingschool.vn / Student@123


🧪 7. Mock mode
✅ Dùng khi:

Test nhanh
Demo cho khách
Không cần lưu data

❌ Không dùng khi:

Website production
Cần lưu dữ liệu thật


📊 8. Setup Google Sheets (Production)
Bạn cần làm:

Tạo Google Sheet
Gắn Apps Script
Deploy Web App
Lấy URL + Secret


ENV:
Plain Textenv isn’t fully supported. Syntax highlighting is based on Plain Text.USE_MOCK_DATA=falseAPPS_SCRIPT_URL=...APPS_SCRIPT_SECRET=...Show more lines

☁️ 9. Upload ảnh (Cloudinary)
Plain Textenv isn’t fully supported. Syntax highlighting is based on Plain Text.CLOUDINARY_CLOUD_NAME=CLOUDINARY_API_KEY=CLOUDINARY_API_SECRET=Show more lines

🚀 10. Deploy Vercel
Quy trình

Push GitHub
Import vào Vercel
Set env
Deploy


ENV cơ bản:
Plain Textenv isn’t fully supported. Syntax highlighting is based on Plain Text.NODE_ENV=productionJWT_SECRET=your-secretUSE_MOCK_DATA=trueALLOWED_ORIGINS=https://project.vercel.appShow more lines

Test deploy
/health

✅ Kết quả:
JSON{"success":true}``Show more lines

🌍 11. Domain riêng

Vercel → Settings → Domains

ENV:
Plain Textenv isn’t fully supported. Syntax highlighting is based on Plain Text.ALLOWED_ORIGINS=https://domain.com``Show more lines

✅ 12. Checklist trước khi public
BẮT BUỘC:

✅ Đổi JWT_SECRET
✅ NODE_ENV=production
✅ USE_MOCK_DATA=false (nếu dùng thật)
✅ Config Google Sheets
✅ Test login admin
✅ Test học viên
✅ Test form đăng ký


🧰 13. Commands quan trọng
Shellnpm run devnpm run startnpm run test:clientnpm run test:servernpm run test:e2enpm run build:sw-manifestnpm run typecheck:client``Show more lines

❗ 14. Lỗi thường gặp
Không chạy được web
→ chưa npm run dev
Login fail
→ sai account / sai mode
API lỗi trên Vercel
→ thiếu ALLOWED_ORIGINS
Không lưu data
→ sai Apps Script URL hoặc secret

🧱 15. Kiến trúc frontend (QUAN TRỌNG)
client/public/
client/src/js/
  entries/
  modules/

👉 Đây là core refactor

🎯 16. Tổng kết
Phiên bản hiện tại:

✅ Admin multi-page
✅ Frontend modular
✅ Server-side pagination
✅ Test đầy đủ
✅ Service Worker
✅ UX cải thiện


📌 17. Gợi ý bước tiếp theo
Bạn có thể làm thêm:

📷 Thêm screenshot UI vào từng section
📄 Tạo server/.env.example
📘 Viết SETUP_NON_TECHNICAL.md
🔐 Thêm auth nâng cao (2FA)
📊 Analytics


💡 Quick Start (1 phút)
Shellnpm run dev``Show more lines
➡️ Mở:
http://localhost:5000