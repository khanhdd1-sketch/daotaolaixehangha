# Deploy Free Tren Render

Tai lieu nay dung cho repo hien tai, trong do backend Express dang phuc vu luon frontend static. Cach de nhat va it loi nhat la deploy 1 service duy nhat, khong tach FE/BE.

## 1. Kiem tra nhanh truoc khi deploy

- App hien tai chay duoc bang lenh `npm start` o thu muc goc.
- Backend phuc vu frontend tai `client/public` va `client/src`, nen khong can build FE rieng.
- Bien moi truong mau nam o `server/.env.example`.
- Neu de `USE_MOCK_DATA=true` thi web van chay va dang nhap duoc bang tai khoan demo.

Tai khoan demo khi dung mock:

- Admin: `admin@drivingschool.vn` / `Admin@123`
- Student: `student@drivingschool.vn` / `Student@123`

## 2. Cach deploy free de vao duoc ngay

Phuong an khuyen nghi:

- Tao 1 repo GitHub cho project nay
- Deploy len Render dang `Web Service`
- Dat ten service la `daotaolaixehangha`
- URL free se co dang `https://daotaolaixehangha.onrender.com`

Nhu vay ban da co FE + BE chung 1 domain, co HTTPS san, cookie login va API se de chay hon rat nhieu so voi cach tach 2 noi.

## 3. Day code len GitHub

Tu thu muc goc project:

```powershell
git init
git add .
git commit -m "init deploy"
```

Sau do tao repo tren GitHub, roi chay:

```powershell
git remote add origin <URL_REPO_GITHUB>
git branch -M main
git push -u origin main
```

## 4. Tao service tren Render

1. Vao `https://render.com`
2. Dang nhap
3. Chon `New +`
4. Chon `Web Service`
5. Ket noi repo GitHub vua push
6. Chon repo `course-platform`
7. Dien cau hinh:

- Name: `daotaolaixehangha`
- Root Directory: de trong
- Environment: `Node`
- Region: chon gan nguoi dung nhat
- Branch: `main`
- Build Command: `npm install`
- Start Command: `npm start`

## 5. Bien moi truong can set tren Render

Tao cac env var sau trong Render:

```env
PORT=10000
JWT_SECRET=mot-chuoi-rat-dai-va-kho-doan
USE_MOCK_DATA=true
APPS_SCRIPT_URL=
APPS_SCRIPT_SECRET=
```

Giai thich:

- `PORT`: Render tu cap port runtime, nhung set `10000` van an toan cho local tham chieu.
- `JWT_SECRET`: bat buoc doi sang chuoi bi mat moi.
- `USE_MOCK_DATA=true`: cach nhanh nhat de web len duoc ngay.
- `APPS_SCRIPT_URL` va `APPS_SCRIPT_SECRET`: bo trong neu chua noi Google Sheets.

## 6. Deploy lan dau

1. Bam `Create Web Service`
2. Doi Render build va start xong
3. Mo:

```text
https://daotaolaixehangha.onrender.com/health
```

Neu thay JSON:

```json
{"success":true,"message":"Server is running"}
```

thi app da len thanh cong.

Sau do vao:

```text
https://daotaolaixehangha.onrender.com
```

## 7. Dang nhap va dung free ngay

Neu `USE_MOCK_DATA=true`:

- Web vao duoc ngay
- Form dang ky hoat dong
- Dang nhap admin/student demo hoat dong
- Thi trac nghiem va dashboard co du lieu demo

Tai khoan:

- Admin: `admin@drivingschool.vn` / `Admin@123`
- Student: `student@drivingschool.vn` / `Student@123`

## 8. Neu muon luu du lieu that bang Google Sheets

Khi can bo mock mode:

1. Tao 1 Google Sheet moi
2. Vao `Extensions -> Apps Script`
3. Copy noi dung tu:

- `apps-script/Code.gs`
- `apps-script/Setup.gs`

4. Thay `SHARED_SECRET`
5. Chay `setupDrivingSchoolSheets()`
6. Neu muon co data demo thi chay `seedDrivingSchoolDemoData()`
7. Deploy `Web app`
8. Lay URL web app
9. Quay lai Render va doi env:

```env
USE_MOCK_DATA=false
APPS_SCRIPT_URL=<URL_WEB_APP_APPS_SCRIPT>
APPS_SCRIPT_SECRET=<SHARED_SECRET_BAN_VUA_DAT>
```

10. Redeploy service

## 9. Domain ten rieng

Co 2 cach:

### Cach mien phi hoan toan

Dung luon subdomain Render:

- `https://daotaolaixehangha.onrender.com`

Khong ton phi, vao duoc ngay, co HTTPS san.

### Cach mua domain rieng

Neu ban mua domain nhu:

- `daotaolaixehangha.site`
- `daotaolaixehangha.online`
- `daotaolaixehangha.net`

thi vao Render:

1. `Settings`
2. `Custom Domains`
3. `Add Custom Domain`
4. Nhap domain vua mua
5. Tao DNS record theo Render huong dan
6. Cho SSL cap phat xong

Luu y:

- Domain rieng thuong khong mien phi.
- Neu chi can web vao duoc va de share cho moi nguoi, dung `onrender.com` la nhanh nhat.

## 10. Khong khuyen nghi tach FE va BE cho repo nay

Ly do:

- Frontend dang goi API bang duong dan tuong doi `/api/...`
- Dang nhap dung cookie `httpOnly`
- Tach FE va BE sang 2 domain khac nhau se can sua them CORS, cookie `secure`, `sameSite`, va co the phai doi ca luong login

Neu chua bat buoc tach, hay deploy chung 1 service.

## 11. Luu y quan trong truoc khi public

- Hien tai thu muc `client/public/assets/videos` moi co `video1.mp4`.
- Cac duong dan demo dang tham chieu toi cac file sau:
  - `b2-lesson-01.mp4`
  - `b2-lesson-02.mp4`
  - `b2-lesson-03.mp4`
  - `sim-b2-01.mp4`
  - `sim-b2-02.mp4`
  - `sim-b2-03.mp4`

Neu khong upload them cac file nay vao `client/public/assets/videos`, cac bai hoc video va bai mo phong se mo trang nhung video khong phat duoc.

## 12. Checklist nhanh

1. Push code len GitHub
2. Tao `Web Service` tren Render
3. Name: `daotaolaixehangha`
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Set `JWT_SECRET`
7. De `USE_MOCK_DATA=true` de len ngay
8. Test `https://daotaolaixehangha.onrender.com/health`
9. Test trang chu va dang nhap
10. Neu can du lieu that thi noi them Google Sheets
