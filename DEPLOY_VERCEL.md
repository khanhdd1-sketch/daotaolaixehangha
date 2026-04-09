# Deploy Tren Vercel

Tai lieu nay dung cho truong hop Render free bi timeout hoac khong du tai nguyen. Repo da duoc chuan bi san de deploy len Vercel.

## Vi sao chon Vercel cho repo nay

- Vercel Hobby hien tai cho Node Functions mac dinh `2 GB` RAM va `1 vCPU`.
- Repo nay co backend Express va frontend static, nen co the dua Express len Vercel va phuc vu file static tu thu muc `public/`.
- Da co san:
  - `api/index.js`
  - `vercel.json`
  - `scripts/prepare-vercel.js`

## 1. Day code len GitHub

```powershell
git add .
git commit -m "prepare vercel deploy"
git push
```

## 2. Tao project tren Vercel

1. Vao `https://vercel.com`
2. Dang nhap
3. Chon `Add New...`
4. Chon `Project`
5. Import repo GitHub nay

## 3. Cau hinh deploy

Thong thuong Vercel se doc `vercel.json` tu dong. Ban chi can kiem tra:

- Framework Preset: `Other`
- Root Directory: de trong
- Build Command: de Vercel doc tu `vercel.json`
- Output Directory: de trong

## 4. Environment Variables

Them cac bien sau:

```env
JWT_SECRET=mot-chuoi-rat-dai-va-kho-doan
USE_MOCK_DATA=true
APPS_SCRIPT_URL=
APPS_SCRIPT_SECRET=
```

Khong can tu set `PORT` tren Vercel.

## 5. Deploy lan dau

1. Bam `Deploy`
2. Doi build xong
3. Test:

```text
https://<ten-project>.vercel.app/health
```

Neu tra ve JSON:

```json
{"success":true,"message":"Server is running"}
```

thi app da len.

De tranh loi luc len lan dau, nen de:

```env
USE_MOCK_DATA=true
```

Nhu vay app khong phu thuoc Google Sheets ngay trong lan build dau tien.

## 6. Dat ten de nho

Trong Vercel, ban co the doi ten project thanh:

- `daotaolaixehangha`

Thuong URL se co dang:

```text
https://daotaolaixehangha.vercel.app
```

## 7. Domain rieng

Neu mua domain rieng nhu:

- `daotaolaixehangha.site`
- `daotaolaixehangha.online`
- `daotaolaixehangha.net`

thi vao:

1. `Project`
2. `Settings`
3. `Domains`
4. `Add Domain`
5. Them DNS theo huong dan cua Vercel

Neu chua muon ton phi domain, dung luon:

- `daotaolaixehangha.vercel.app`

## 8. Google Sheets neu muon luu du lieu that

Ban co the deploy truoc voi:

```env
USE_MOCK_DATA=true
```

Sau khi site len on dinh, moi noi them Google Sheets bang cach set:

```env
USE_MOCK_DATA=false
APPS_SCRIPT_URL=<URL_APPS_SCRIPT>
APPS_SCRIPT_SECRET=<SECRET_CUA_BAN>
```

Roi redeploy.

## 9. Luu y

- Vercel khong can nghe cong `PORT`, nen backend da duoc sua de export `app` thay vi bat buoc `listen`.
- Script `prepare-vercel.js` se copy:
  - `client/public` -> `public`
  - `client/src` -> `public/src`

Nho vay cac link nhu `/src/js/...` va `/src/css/...` van chay binh thuong.

## 10. Checklist nhanh

1. Push code
2. Import repo vao Vercel
3. Set `JWT_SECRET`
4. De `USE_MOCK_DATA=true`
5. Deploy
6. Test `/health`
7. Mo trang chu
8. Test login admin demo

## 11. Checklist test sau deploy

Sau khi deploy xong, test theo thu tu nay:

1. `https://<ten-project>.vercel.app/health`
2. `https://<ten-project>.vercel.app/`
3. `https://<ten-project>.vercel.app/login.html`
4. Gui form dang ky o trang chu
5. Dang nhap bang tai khoan demo neu dang de `USE_MOCK_DATA=true`

Tai khoan demo:

- Admin: `admin@drivingschool.vn` / `Admin@123`
- Student: `student@drivingschool.vn` / `Student@123`

Neu co loi, vao:

1. `Project`
2. `Deployments`
3. Chon ban deploy moi nhat
4. Xem `Build Logs`
5. Xem `Runtime Logs`

Loi thuong gap:

- Quen set `JWT_SECRET`
- Dat `USE_MOCK_DATA=false` nhung chua set `APPS_SCRIPT_URL`
- Nhap sai `APPS_SCRIPT_SECRET`
