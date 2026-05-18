# Driving School Platform

Website cho trung tam day lai xe, gom landing page gioi thieu dich vu, form dang ky tu van, trang dang nhap, khu vuc hoc vien, dashboard admin, he thong thi va theo doi ket qua. Du an duoc viet theo kieu don gian de de van hanh: frontend static + backend Express + luu du lieu bang mock mode hoac Google Sheets Apps Script.

README nay duoc viet theo huong dan tung buoc, muc tieu la nguoi khong biet code van co the:

1. Hieu website nay dang co nhung chuc nang gi
2. Chay duoc tren may tinh cua minh
3. Cau hinh bien moi truong
4. Noi voi Google Sheets de luu du lieu that
5. Deploy len Vercel
6. Gan domain rieng
7. Biet can kiem tra gi truoc khi public

## 1. Website nay dang co gi

He thong hien co cac nhom chuc nang sau:

- Landing page gioi thieu trung tam, khoa hoc, quy trinh hoc, FAQ, thong tin lien he
- Form dang ky tu van tren trang chu
- Login theo vai tro `admin` va `student`
- Dashboard admin:
  - Xem luot truy cap
  - Xem lead tu form dang ky
  - Xem danh sach hoc vien
  - Tao tai khoan hoc vien
  - Xem ket qua thi do hoc vien gui len
  - Xem bieu do tong quan
- Khu vuc hoc vien:
  - Xem thong tin khoa hoc cua minh
  - Mo link thi thu ben thu 3
  - Gui diem thi cho admin
  - Upload anh minh chung ket qua
  - Xem lich su gui ket qua
  - Xem bieu do tien do
- Thi ly thuyet noi bo
- Bai hoc va quiz theo tung lesson
- Thi mo phong
- Song ngu `VI/EN`
- SEO co ban:
  - meta title
  - meta description
  - canonical
  - Open Graph
  - sitemap
  - robots.txt
- Tich hop Google Sheets Apps Script de luu du lieu that
- Co mock mode de demo nhanh khi chua noi Google Sheets

## 2. Ai se dung he thong nay

Co 3 nhom nguoi dung chinh:

- Khach truy cap web:
  - Xem thong tin trung tam
  - Gui form dang ky tu van
- Hoc vien:
  - Dang nhap
  - Vao khu vuc hoc vien
  - Thi va gui ket qua
  - Theo doi lich su hoc
- Admin:
  - Dang nhap dashboard
  - Tao tai khoan hoc vien
  - Theo doi lead
  - Theo doi du lieu thi
  - Xem bieu do va thong ke

## 3. Cong nghe dang dung

- Frontend: HTML, CSS, Bootstrap, Vanilla JavaScript
- Backend: Node.js + Express
- Xac thuc: JWT + cookie `httpOnly`
- Luu tru:
  - Cach 1: mock data
  - Cach 2: Google Sheets Apps Script Web App
- Deploy khuyen nghi: Vercel

## 4. Cau truc thu muc

- `client/public`
  - Chua cac file HTML public nhu trang chu, login, admin, exam, result
- `client/src/css`
  - CSS chinh cua giao dien
- `client/src/js`
  - JavaScript cua frontend
- `client/src/i18n`
  - File da ngon ngu
- `server/src`
  - API backend, auth, route, service, middleware
- `apps-script`
  - Code Google Apps Script de luu du lieu vao Google Sheets
- `api/index.js`
  - Entry de deploy len Vercel
- `vercel.json`
  - Cau hinh rewrite va function cho Vercel
- `DEPLOY_VERCEL.md`
  - Huong dan deploy rieng tren Vercel
- `DEPLOY_FREE_RENDER.md`
  - Huong dan deploy tren Render

## 5. Cac trang quan trong

- `/`
  - Trang chu
- `/login.html`
  - Dang nhap
- `/admin.html`
  - Dashboard admin
- `/exam.html`
  - Khu vuc hoc vien de mo link thi ben thu 3 va gui ket qua
- `/result.html`
  - Xem ket qua
- `/registration.html`
  - Trang dang ky neu can dung rieng
- `/health`
  - Trang kiem tra server co dang chay hay khong

## 6. Chay tren may tinh cua ban

Phan nay dung cho truong hop ban muon mo thu website tren may tinh cua minh truoc khi dua len internet.

### Dieu kien can co

Ban can cai san:

- Node.js
- npm

Neu chua co Node.js:

1. Mo `https://nodejs.org`
2. Tai ban `LTS`
3. Cai dat theo mac dinh
4. Cai xong mo lai terminal

### Cac buoc chay local

1. Mo thu muc project nay
2. Tao file `server/.env`
3. Mo terminal tai thu muc goc project
4. Cai dependency
5. Chay server
6. Mo website tren trinh duyet

Lenh can dung:

```powershell
npm.cmd install
npm.cmd run dev
```

Sau do mo:

```text
http://localhost:5000
```

Neu trang mo duoc, nghia la website da chay local thanh cong.

## 7. Tao file `server/.env`

Day la file chua cac bien cau hinh. Ban tao file moi ten:

```text
server/.env
```

Noi dung mau nen dung:

```env
NODE_ENV=development
HOST=0.0.0.0
PORT=5000
JWT_SECRET=doi-thanh-mot-chuoi-rat-dai-va-bi-mat
USE_MOCK_DATA=true
ALLOWED_ORIGINS=http://localhost:5000,http://127.0.0.1:5000

APPS_SCRIPT_URL=
APPS_SCRIPT_SECRET=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_UPLOAD_FOLDER=drive-school/proof-images
```

## 8. Giai thich cac bien moi truong

- `NODE_ENV`
  - `development` khi chay tren may tinh
  - `production` khi dua len Vercel
- `HOST`
  - Thuong de `0.0.0.0`
- `PORT`
  - Chay local thi de `5000`
  - Tren Vercel khong can tu set
- `JWT_SECRET`
  - Khoa bao mat dung de tao phien dang nhap
  - Bat buoc phai la chuoi dai, kho doan
- `USE_MOCK_DATA`
  - `true`: dung du lieu demo, chua can Google Sheets
  - `false`: dung du lieu that tu Google Sheets
- `ALLOWED_ORIGINS`
  - Danh sach domain duoc phep goi API
  - Moi domain cach nhau bang dau phay
- `APPS_SCRIPT_URL`
  - URL Web App cua Google Apps Script
- `APPS_SCRIPT_SECRET`
  - Ma bi mat dung de backend noi voi Google Apps Script
- `CLOUDINARY_*`
  - Dung neu hoc vien upload anh minh chung

## 9. Cach de nhat de dung thu ngay

Neu ban chi muon mo len de xem nhanh website va cac chuc nang:

1. Dat `USE_MOCK_DATA=true`
2. Chay `npm.cmd install`
3. Chay `npm.cmd run dev`
4. Mo `http://localhost:5000`

Khi do:

- Trang chu se chay
- Form dang ky se luu vao mock
- Dang nhap demo se dung duoc
- Dashboard admin se co du lieu mau
- Khu hoc vien se hoat dong voi du lieu demo

## 10. Tai khoan demo

Chi dung khi:

```env
USE_MOCK_DATA=true
```

Tai khoan demo hien co:

- Admin: `admin@drivingschool.vn` / `Admin@123`
- Student: `student@drivingschool.vn` / `Student@123`

Luu y:

- Khong dung cac tai khoan nay khi public website that
- Khi deploy production, nen dung `USE_MOCK_DATA=false`

## 11. Khi nao nen dung mock mode

Nen dung mock mode khi:

- Ban moi setup lan dau
- Ban chua co Google Sheets
- Ban muon demo giao dien cho khach
- Ban muon test nhanh luong login va dashboard

Khong nen dung mock mode khi:

- Website da public that
- Ban can luu du lieu that
- Ban can admin xem lead va ket qua that

## 12. Setup Google Sheets de luu du lieu that

Neu ban muon du lieu duoc luu that, hay lam theo phan nay.

### Cach de hieu nhat

Ban se lam 3 viec:

1. Tao 1 Google Sheet moi
2. Gan Apps Script vao sheet do
3. Lay URL Web App va secret de dien vao `server/.env` hoac Vercel

### Buoc 1. Tao Google Sheet

1. Mo Google Drive
2. Tao 1 Google Sheet moi
3. Dat ten de nho, vi du:
   - `Driving School Data`

### Buoc 2. Mo Apps Script

1. Trong file Google Sheet vua tao
2. Bam `Extensions`
3. Chon `Apps Script`

### Buoc 3. Copy code Apps Script

Trong project Apps Script moi:

1. Copy noi dung file `apps-script/Code.gs`
2. Copy noi dung file `apps-script/Setup.gs`
3. Co the tham khao them:
   - `apps-script/sheet-config.json`
   - `apps-script/seed-data.json`

### Buoc 4. Sua shared secret

Trong code Apps Script, tim bien:

```text
SHARED_SECRET
```

Va doi thanh 1 chuoi bi mat cua rieng ban.

Vi du:

```text
hangha-secret-2026-rat-kho-doan
```

### Buoc 5. Tao cac sheet can thiet

Trong Apps Script:

1. Chay ham `setupDrivingSchoolSheets()`
2. Cap quyen neu Google hoi

Ham nay se tao cac tab du lieu can dung.

### Buoc 6. Nap du lieu demo neu muon

Neu ban muon co data mau de test:

1. Chay ham `seedDrivingSchoolDemoData()`

Neu ban khong muon du lieu demo, co the bo qua buoc nay.

### Buoc 7. Deploy thanh Web App

1. Bam `Deploy`
2. Chon `New deployment`
3. Chon loai `Web app`
4. Quyen truy cap thuong chon de app cua ban goi duoc
5. Bam deploy

Sau khi deploy xong, ban se co:

- URL Web App

Hay copy URL nay lai.

### Buoc 8. Dien vao file `.env`

Cap nhat:

```env
USE_MOCK_DATA=false
APPS_SCRIPT_URL=<URL_WEB_APP_APPS_SCRIPT>
APPS_SCRIPT_SECRET=<SHARED_SECRET_BAN_DA_DAT>
```

### Buoc 9. Chay lai project

Tat server cu va chay lai:

```powershell
npm.cmd run dev
```

Khi do website se dung Google Sheets thay vi mock mode.

## 13. Upload anh minh chung bang Cloudinary

Neu ban muon hoc vien upload anh chup man hinh ket qua thi:

1. Tao tai khoan Cloudinary
2. Lay cac thong tin:
   - `cloud name`
   - `api key`
   - `api secret`
3. Dien vao env:

```env
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLOUDINARY_UPLOAD_FOLDER=drive-school/proof-images
```

Neu khong cau hinh Cloudinary:

- Hoc vien van co the dung nhieu chuc nang khac
- Nhung upload anh minh chung se khong hoat dong day du

## 14. Deploy len Vercel

Day la cach khuyen nghi nhat.

### Tong quan

Ban se lam theo thu tu:

1. Day code len GitHub
2. Tao project tren Vercel
3. Them env
4. Deploy
5. Test website
6. Gan domain rieng neu can

### Buoc 1. Day code len GitHub

Tai thu muc goc project:

```powershell
git add .
git commit -m "update project"
git push
```

### Buoc 2. Tao project Vercel

1. Mo `https://vercel.com`
2. Dang nhap
3. Chon `Add New`
4. Chon `Project`
5. Ket noi repo GitHub chua project nay

### Buoc 3. Cau hinh project

Thuong chi can:

- Framework Preset: `Other`
- Root Directory: de trong
- Build Command: de Vercel tu doc tu `vercel.json`
- Output Directory: de trong

### Buoc 4. Them Environment Variables

Toi thieu nen them:

```env
NODE_ENV=production
JWT_SECRET=mot-chuoi-rat-dai-rat-kho-doan
USE_MOCK_DATA=true
ALLOWED_ORIGINS=https://ten-project.vercel.app
APPS_SCRIPT_URL=
APPS_SCRIPT_SECRET=
```

Neu dung Cloudinary:

```env
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLOUDINARY_UPLOAD_FOLDER=drive-school/proof-images
```

### Buoc 5. Deploy lan dau

Ban nen deploy lan dau voi:

```env
USE_MOCK_DATA=true
```

Ly do:

- De web len nhanh nhat
- Khong phu thuoc Google Sheets ngay tu dau
- De de test landing page, login, admin, hoc vien

### Buoc 6. Kiem tra sau khi deploy

Mo:

```text
https://<ten-project>.vercel.app/health
```

Neu thay:

```json
{"success":true,"message":"Server is running"}
```

thi deploy thanh cong.

Sau do test tiep:

1. Trang chu
2. Trang login
3. Dang nhap admin demo neu dang de mock mode
4. Form dang ky
5. Dashboard admin

### Buoc 7. Chuyen sang du lieu that

Sau khi website da len on:

1. Setup Google Sheets xong
2. Cap nhat env tren Vercel:

```env
USE_MOCK_DATA=false
APPS_SCRIPT_URL=<URL_THAT>
APPS_SCRIPT_SECRET=<SECRET_THAT>
```

3. Redeploy

## 15. Gan domain rieng

Neu ban da mua domain:

Vi du:

- `daotaolaixehangha.com`
- `www.daotaolaixehangha.com`

Lam nhu sau:

1. Vao project tren Vercel
2. Chon `Settings`
3. Chon `Domains`
4. Bam `Add Domain`
5. Nhap domain cua ban
6. Lam theo huong dan DNS cua Vercel

Sau do nho cap nhat env:

```env
ALLOWED_ORIGINS=https://daotaolaixehangha.com,https://www.daotaolaixehangha.com
```

Neu ban van giu ca domain Vercel va domain rieng, co the them ca 2 vao `ALLOWED_ORIGINS`.

## 16. Checklist danh cho nguoi khong biet code

Neu ban muon lam nhanh, hay di theo checklist nay:

1. Cai Node.js
2. Mo project
3. Tao file `server/.env`
4. Dan noi dung env mau vao
5. Dat `USE_MOCK_DATA=true`
6. Chay `npm.cmd install`
7. Chay `npm.cmd run dev`
8. Mo `http://localhost:5000`
9. Test dang nhap bang tai khoan demo
10. Tao repo GitHub
11. Day code len GitHub
12. Deploy Vercel
13. Test `.../health`
14. Sau do moi setup Google Sheets that
15. Chuyen `USE_MOCK_DATA=false`
16. Neu can, gan them domain rieng

## 17. Checklist truoc khi public website that

Day la phan rat quan trong.

Ban nen dam bao:

- Da doi `JWT_SECRET` thanh chuoi bi mat dai
- Khong de secret test qua de doan
- Da dat `NODE_ENV=production`
- Da dat `USE_MOCK_DATA=false` neu website da su dung that
- Da dien dung `ALLOWED_ORIGINS`
- Da setup Google Sheets that neu can luu du lieu
- Da setup Cloudinary neu can upload anh minh chung
- Da test login admin
- Da test login hoc vien
- Da test form dang ky
- Da test dashboard admin
- Da test submit ket qua cua hoc vien

## 18. Bao mat va cau hinh production

Tu ban cap nhat moi, backend da duoc siet bao mat hon. Tuy vay, khi public ban van can tu cau hinh dung.

### Ban bat buoc phai lam

- Dat `JWT_SECRET` moi, dai va bi mat
- Khong public file `.env`
- Khong de `USE_MOCK_DATA=true` neu website dang hoat dong that
- Dat `ALLOWED_ORIGINS` dung voi domain cua ban
- Chi cap quyen Apps Script cho dung muc dich

### Vi du env production

```env
NODE_ENV=production
JWT_SECRET=moc-chuoi-rat-dai-ngau-nhien-kho-doan-123456
USE_MOCK_DATA=false
ALLOWED_ORIGINS=https://daotaolaixehangha.com,https://www.daotaolaixehangha.com
APPS_SCRIPT_URL=https://script.google.com/macros/s/xxx/exec
APPS_SCRIPT_SECRET=mot-secret-rieng-cho-apps-script
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLOUDINARY_UPLOAD_FOLDER=drive-school/proof-images
```

## 19. Video demo va media

Hien tai thu muc:

```text
client/public/assets/videos
```

chua day du toan bo video thuc te.

README nay can nhac ban dieu sau:

- Neu trong bai hoc hoac bai mo phong co tham chieu den file video ma ban chua upload, video se khong phat duoc
- Neu ban muon public day du, hay bo dung cac file video that vao dung thu muc

## 20. Loi thuong gap va cach xu ly

### Mo web len ma khong vao duoc

Kiem tra:

- Da chay `npm.cmd install` chua
- Da chay `npm.cmd run dev` chua
- Dang mo dung `http://localhost:5000` chua

### Dang nhap that bai

Kiem tra:

- Neu dang test nhanh, co dang de `USE_MOCK_DATA=true` khong
- Co nhap dung email va mat khau demo khong
- Neu da dung Google Sheets, co seed dung user chua

### Form dang ky gui khong duoc

Kiem tra:

- Server con dang chay khong
- Neu dang dung Google Sheets, `APPS_SCRIPT_URL` co dung khong
- `APPS_SCRIPT_SECRET` co dung khong

### Deploy len Vercel ma loi

Kiem tra:

- Da set `JWT_SECRET` chua
- `NODE_ENV=production` chua
- Neu `USE_MOCK_DATA=false` thi `APPS_SCRIPT_URL` va `APPS_SCRIPT_SECRET` da co chua

### Co domain roi nhung login hoac API loi

Thuong la do:

- Chua them domain do vao `ALLOWED_ORIGINS`

Hay cap nhat lai, vi du:

```env
ALLOWED_ORIGINS=https://domaincuaban.com,https://www.domaincuaban.com
```

## 21. Lenh thuong dung

### Cai dependency

```powershell
npm.cmd install
```

### Chay local

```powershell
npm.cmd run dev
```

### Chay production local

```powershell
npm.cmd start
```

### Kiem tra server

```text
http://localhost:5000/health
```

## 22. File tai lieu lien quan

- Huong dan deploy Vercel chi tiet hon: [DEPLOY_VERCEL.md](/c:/Users/anandy/OneDrive%20-%20Cebu%20Pacific/Desktop/daotao/DEPLOY_VERCEL.md)
- Huong dan deploy Render: [DEPLOY_FREE_RENDER.md](/c:/Users/anandy/OneDrive%20-%20Cebu%20Pacific/Desktop/daotao/DEPLOY_FREE_RENDER.md)
- Cau hinh Google Sheets: [apps-script/sheet-config.json](/c:/Users/anandy/OneDrive%20-%20Cebu%20Pacific/Desktop/daotao/apps-script/sheet-config.json)
- Du lieu demo Google Sheets: [apps-script/seed-data.json](/c:/Users/anandy/OneDrive%20-%20Cebu%20Pacific/Desktop/daotao/apps-script/seed-data.json)
- Code Apps Script chinh: [apps-script/Code.gs](/c:/Users/anandy/OneDrive%20-%20Cebu%20Pacific/Desktop/daotao/apps-script/Code.gs)
- Script setup Apps Script: [apps-script/Setup.gs](/c:/Users/anandy/OneDrive%20-%20Cebu%20Pacific/Desktop/daotao/apps-script/Setup.gs)

## 23. Tom tat cach dung nhanh nhat

Neu ban chi muon website len nhanh:

1. Tao `server/.env`
2. Dat `USE_MOCK_DATA=true`
3. Chay `npm.cmd install`
4. Chay `npm.cmd run dev`
5. Test local
6. Day code len GitHub
7. Deploy Vercel
8. Sau khi on dinh moi noi Google Sheets va domain

Neu ban muon, buoc tiep theo minh co the lam tiep 1 trong 3 viec sau:

1. Tao luon file `server/.env.example` chuan theo README moi
2. Bo sung anh chup man hinh giao dien vao README cho de hieu hon
3. Viet them mot file `SETUP_NON_TECHNICAL.md` dang checklist cuc ky ngan gon cho nguoi van hanh
