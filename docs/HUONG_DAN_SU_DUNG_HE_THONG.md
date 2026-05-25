# HUONG DAN SU DUNG HE THONG THI THU TRUNG TAM DAY LAI XE

## 1. Muc dich tai lieu

Tai lieu nay huong dan cach su dung website thi thu va quan ly hoc vien cho 2 nhom nguoi dung:

- Admin
- Hoc vien

He thong duoc su dung de:

- Dang nhap theo tung vai tro
- Quan ly hoc vien
- Tao de thi ly thuyet theo loai bang
- Them cau hoi va cau diem liet
- Quan ly bai thi mo phong
- Theo doi ket qua thi, so lan thi va bieu do thong ke
- Cho hoc vien thi thu va xem ket qua

## 2. Thong tin dang nhap

Nguoi dung can co tai khoan do admin cap.

- Admin dang nhap de quan ly he thong
- Hoc vien dang nhap de vao khu vuc thi thu

Neu quen mat khau hoac chua co tai khoan, lien he admin cua trung tam.

## 3. Cach dang nhap

1. Mo trang dang nhap cua he thong
2. Nhap email
3. Nhap mat khau
4. Bam "Dang nhap"

Luu y:

- Admin se duoc chuyen vao trang quan ly `admin.html`
- Hoc vien se duoc chuyen vao khu vuc hoc vien `exam.html`

## 4. Huong dan cho Admin

### 4.1. Tong quan trang Admin

Sau khi dang nhap, admin se thay:

- So lieu tong quan: luot truy cap, lead dang ky, hoc vien, so luot dat, so luot chua dat
- Bieu do thong ke
- Danh sach hoc vien
- Danh sach lead
- Khu vuc quan ly de thi ly thuyet
- Khu vuc quan ly cau hoi
- Khu vuc quan ly de thi mo phong
- Bang tong hop ket qua thi

### 4.2. Them hoc vien

1. Tai khu vuc "Hoc vien", nhap:
   - Ten hoc vien
   - Email
   - Mat khau
   - Loai bang
2. Bam "Them hoc vien"

Ket qua:

- Hoc vien duoc tao tai khoan
- Hoc vien chi nhin thay de thi dung voi loai bang duoc gan

### 4.3. Tao de thi ly thuyet

1. Tai khu vuc "Quan ly de ly thuyet", nhap:
   - Loai bang
   - Ten de
   - Diem dat
   - Tong cau hien thi khi hoc vien thi
   - So phut lam bai
   - Trang thai kich hoat
2. Bam "Luu de"

Vi du:

- Loai bang: B2
- Ten de: De thi B2 so 01
- Diem dat: 25
- Tong cau: 30
- So phut: 20

Luu y quan trong:

- Admin co the them 100, 300 hoac 600 cau vao cung 1 de
- Khi hoc vien vao thi, he thong chi rut ngau nhien dung so cau theo `Tong cau`
- Neu de co du cau diem liet, he thong uu tien lay 5 cau diem liet trong bai thi

### 4.4. Them cau hoi cho de thi

1. Tai khu vuc "Ngan hang cau hoi", chon de thi
2. Nhap:
   - Noi dung cau hoi
   - Dap an A
   - Dap an B
   - Dap an C
   - Dap an D
   - Dap an dung
   - Co phai cau diem liet hay khong
   - Giai thich
3. Bam "Luu cau hoi"

Luu y:

- Giai thich se hien cho hoc vien sau khi nop bai
- Nen them toi thieu 5 cau diem liet cho moi de neu muon bai thi luon co 5 cau diem liet
- Neu de hien thi 30 cau, admin co the them 600 cau van duoc

### 4.5. Sua hoac xoa cau hoi

1. Tim cau hoi trong bang danh sach
2. Bam "Sua" de nap du lieu len form
3. Chinh sua noi dung can thiet
4. Bam "Luu cau hoi"

Neu can xoa:

1. Bam "Xoa"
2. He thong se xoa cau hoi do khoi de

### 4.6. Tao de thi mo phong

1. Tai khu vuc "De thi mo phong", nhap:
   - Loai bang
   - Ten bai mo phong
   - Mo ta
   - Diem dat
   - Tong clip
   - Trang thai
2. Bam "Luu bai mo phong"

### 4.7. Them clip mo phong

1. Chon bai mo phong
2. Nhap:
   - Ten clip
   - URL video
   - Thu tu clip
   - Thoi diem bat dau tinh diem
   - Thoi diem ket thuc tinh diem
   - Trang thai
3. Bam "Luu clip"

### 4.8. Xem ket qua thi

Tai bang "Trung tam ket qua thi", admin co the xem:

- Ten hoc vien
- Loai bang
- Kenh thi
- De thi hoac nen tang
- So lan thi
- Diem
- Trang thai dat/chua dat
- Thoi gian nop bai

Admin co the loc theo:

- Loai bang
- Kenh thi
- Trang thai
- Tu khoa tim kiem

### 4.9. Theo doi bieu do va thong ke

Admin co the theo doi:

- Tong quan he thong
- Nguon ket qua tu ly thuyet noi bo, mo phong va 3rd-party
- So luong hoc vien
- So luot dat va chua dat

### 4.10. Luu y cho Admin

- Hoc vien duoc gan bang nao thi chi thay de bang do
- De thi phai co `course_type` dung trong du lieu
- Neu dung Google Sheet that, can bao dam tab `exams` va `questions` du thong tin
- Khong chia se tai khoan admin cho hoc vien

## 5. Huong dan cho Hoc vien

### 5.1. Tong quan khu vuc hoc vien

Sau khi dang nhap, hoc vien se thay:

- Thong tin ten va loai bang
- Bieu do tien do
- Danh sach de thi ly thuyet
- Danh sach bai hoc
- Khu vuc thi mo phong
- Khu vuc gui ket qua 3rd-party
- Lich su ket qua

### 5.2. Thi thu ly thuyet

1. Tai phan "Thi thu ly thuyet noi bo", bam "Lam de ngay"
2. He thong se hien thi de thi ngau nhien
3. Chon dap an cho tung cau
4. Theo doi dong ho dem nguoc
5. Bam "Nop bai ly thuyet"

Ket qua:

- He thong cham diem tu dong
- Neu sai cau diem liet, hoc vien co the truot du diem tong
- Sau khi nop, hoc vien duoc chuyen sang trang ket qua

### 5.3. Cach he thong lay cau hoi

Vi du de thi duoc cau hinh:

- Tong cau hien thi: 30
- Diem dat: 25

Neu admin da them 600 cau cho de do:

- Hoc vien KHONG nhin thay 600 cau
- He thong chi rut ngau nhien 30 cau de thi
- Trong 30 cau se uu tien co 5 cau diem liet neu de co du cau diem liet

Moi lan thi:

- Bo cau hoi co the khac nhau
- Diem va lich su van duoc luu lai

### 5.4. Xem ket qua bai thi

Sau khi nop bai, hoc vien co the xem:

- Trang thai dat hay chua dat
- Diem so
- So lan thi
- Cac cau da chon
- Dap an dung
- Giai thich cho tung cau

### 5.5. Thi mo phong

1. Mo clip mo phong
2. Xem video
3. Bam nut ghi nhan nguy hiem dung thoi diem
4. Chuyen clip tiep theo
5. Bam "Nop bai mo phong"

Ket qua se hien sau khi nop.

### 5.6. Gui ket qua thi tu nen tang 3rd-party

Neu trung tam van su dung app/website ben ngoai:

1. Chon loai thi
2. Nhap diem
3. Chon trang thai dat/chua dat
4. Neu can, tai anh minh chung
5. Bam "Gui ket qua 3rd-party"

### 5.7. Xem lich su thi

Hoc vien co the xem:

- Kenh thi
- Ten de thi
- So lan thi
- Diem
- Trang thai
- Thoi gian nop bai

Hoc vien co the loc theo:

- Kenh thi
- Trang thai
- Tu khoa

## 6. Nhung loi thuong gap va cach xu ly

### 6.1. Khong dang nhap duoc

Nguyen nhan co the:

- Sai email
- Sai mat khau
- Tai khoan chua duoc tao

Cach xu ly:

- Kiem tra lai thong tin dang nhap
- Lien he admin de cap lai tai khoan

### 6.2. Hoc vien khong thay de thi

Nguyen nhan co the:

- Chua co de thi dung loai bang
- De thi chua kich hoat
- De thi chua duoc gan `course_type` dung

Cach xu ly:

- Admin kiem tra loai bang cua hoc vien
- Admin kiem tra truong `course_type` cua de thi
- Admin kiem tra trang thai `active`

### 6.3. Nop bai bi loi

Nguyen nhan co the:

- Het phien dang nhap
- Mat ket noi internet
- Trinh duyet giu cache cu

Cach xu ly:

- Dang nhap lai
- Tai lai trang
- Thu `Ctrl + Shift + R`

### 6.4. Khong tai duoc anh minh chung

Cach xu ly:

- Dung anh dinh dang JPG, PNG hoac WEBP
- Kiem tra ket noi internet
- Thu tai lai anh nho hon

## 7. Khuyen nghi van hanh

- Admin nen tao it nhat 1 de cho moi loai bang dang dao tao
- Moi de nen co nhieu cau hoi de hoc vien thi moi lan se khac nhau
- Moi de nen co it nhat 5 cau diem liet
- Nen kiem tra ket qua va bieu do thuong xuyen de theo doi hoc vien
- Nen sao luu du lieu Google Sheet dinh ky

## 8. Ket luan

He thong nay giup trung tam:

- Quan ly hoc vien
- Quan ly de thi
- Cho hoc vien thi thu ly thuyet va mo phong
- Theo doi ket qua, so lan thi va tien do hoc

Neu can thay doi chuc nang, can cap nhat boi nguoi quan tri he thong.
