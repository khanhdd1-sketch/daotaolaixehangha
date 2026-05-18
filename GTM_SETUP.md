# GTM Setup Guide

Tai lieu nay huong dan tung buoc de team marketing setup Google Tag Manager, GA4 va Google Ads cho website nay ma khong can doc code.

Muc tieu:

1. Do page view
2. Do click CTA quan trong
3. Do click goi dien
4. Do click Zalo/Facebook
5. Do submit form lead
6. Gui du lieu sang GA4
7. Gui conversion sang Google Ads

## 1. He thong dang co san gi trong code

Website da duoc gan san:

- GTM snippet cho container `GTM-KMF7RN94`
- `dataLayer` event de GTM doc
- hook tracking cho:
  - page view
  - click CTA
  - click hotline
  - click Zalo
  - click Facebook
  - click nut tai map
  - submit form dang ky

Team marketing khong can sua code de do cac event nay.

## 2. Cac event hien co trong dataLayer

Day la danh sach event website se day vao GTM:

- `marketing_page_view`
- `marketing_click`
- `contact_click`
- `contact_phone_click`
- `map_load_click`
- `lead_form_submit_attempt`
- `lead_form_submit_success`
- `lead_form_submit_error`
- `generate_lead`
- `marketing_tracking_ready`

## 3. Cac thong tin can xin hoac tao truoc

Truoc khi bat dau, can co:

### Google Tag Manager

- Container ID:
  - `GTM-KMF7RN94`

### Google Analytics 4

Can co property GA4 va lay:

- `Measurement ID`
- Dinh dang:
  - `G-XXXXXXXXXX`

Lay o:

1. Mo `Google Analytics`
2. Bam `Admin`
3. Bam `Data Streams`
4. Chon web stream
5. Copy `Measurement ID`

### Google Ads

Can co:

- `Conversion ID`
- `Conversion Label` cho lead form
- `Conversion Label` cho phone click

Lay o:

1. Mo `Google Ads`
2. Bam `Goals`
3. Bam `Conversions`
4. Tao conversion neu chua co
5. Mo tung conversion
6. Bam `Tag setup`
7. Copy:
   - `Conversion ID` dang `AW-123456789`
   - `Conversion label`

Luu y:

- `googleAdsPhoneLabel` KHONG PHAI so dien thoai
- No phai la chuoi label do Google Ads cap

## 4. Event mapping tong quan

| Event | Y nghia | Nen gui di dau |
|---|---|---|
| `marketing_page_view` | Tai trang | GA4 |
| `marketing_click` | CTA click chung | GA4 |
| `contact_click` | Click Zalo/Facebook | GA4 |
| `contact_phone_click` | Click goi dien | GA4 + Google Ads |
| `map_load_click` | Click tai ban do | GA4 |
| `lead_form_submit_attempt` | Bam gui form | GA4 |
| `lead_form_submit_success` | Gui form thanh cong | GA4 |
| `lead_form_submit_error` | Gui form loi | GA4 |
| `generate_lead` | Lead thanh cong | GA4 + Google Ads |

## 5. Tao bien trong GTM

Trong GTM:

1. Mo container `GTM-KMF7RN94`
2. Bam `Variables`
3. O muc `User-Defined Variables`
4. Bam `New`
5. Chon `Variable Configuration`
6. Chon `Data Layer Variable`

Tao lan luot cac bien sau:

### Nhom page

- `DLV - page_location`
  - Data Layer Variable Name: `page_location`
- `DLV - page_path`
  - Data Layer Variable Name: `page_path`
- `DLV - page_title`
  - Data Layer Variable Name: `page_title`
- `DLV - page_lang`
  - Data Layer Variable Name: `page_lang`

### Nhom click

- `DLV - click_name`
  - `click_name`
- `DLV - click_label`
  - `click_label`
- `DLV - click_section`
  - `click_section`
- `DLV - click_destination`
  - `click_destination`

### Nhom contact

- `DLV - method`
  - `method`
- `DLV - link_url`
  - `link_url`
- `DLV - link_text`
  - `link_text`
- `DLV - contact_type`
  - `contact_type`

### Nhom lead

- `DLV - form_name`
  - `form_name`
- `DLV - course_type`
  - `course_type`
- `DLV - lead_source`
  - `lead_source`
- `DLV - error_type`
  - `error_type`
- `DLV - error_message`
  - `error_message`
- `DLV - send_to`
  - `send_to`

## 6. Tao trigger trong GTM

Vao:

1. `Triggers`
2. Bam `New`
3. Chon `Custom Event`

Tao cac trigger sau:

- `CE - marketing_page_view`
  - Event name: `marketing_page_view`
- `CE - marketing_click`
  - Event name: `marketing_click`
- `CE - contact_click`
  - Event name: `contact_click`
- `CE - contact_phone_click`
  - Event name: `contact_phone_click`
- `CE - map_load_click`
  - Event name: `map_load_click`
- `CE - lead_form_submit_attempt`
  - Event name: `lead_form_submit_attempt`
- `CE - lead_form_submit_success`
  - Event name: `lead_form_submit_success`
- `CE - lead_form_submit_error`
  - Event name: `lead_form_submit_error`
- `CE - generate_lead`
  - Event name: `generate_lead`

## 7. Tao tag GA4 Config

### Cach tao

1. Vao `Tags`
2. Bam `New`
3. Dat ten:
   - `GA4 - Config`
4. Bam `Tag Configuration`
5. Chon `Google Analytics: GA4 Configuration`
6. Nhap `Measurement ID`
7. Chon trigger:
   - `All Pages`
8. Save

### Ghi chu

Neu giao dien GTM moi hien `Google Tag` thay vi `GA4 Configuration`, ban co the dung `Google Tag` voi cung Measurement ID.

## 8. Tao cac tag GA4 Event

Moi event duoi day tao 1 tag rieng.

Mau chung:

1. `Tags` -> `New`
2. Tag type:
   - `Google Analytics: GA4 Event`
3. Configuration tag:
   - chon `GA4 - Config`
4. Event Name:
   - nhap dung ten event
5. Trigger:
   - chon custom event tuong ung

### 8.1 GA4 - marketing_page_view

- Ten tag:
  - `GA4 - marketing_page_view`
- Event name:
  - `marketing_page_view`
- Trigger:
  - `CE - marketing_page_view`

Them Event Parameters:

- `page_location` = `{{DLV - page_location}}`
- `page_path` = `{{DLV - page_path}}`
- `page_title` = `{{DLV - page_title}}`
- `page_lang` = `{{DLV - page_lang}}`

### 8.2 GA4 - marketing_click

- Ten tag:
  - `GA4 - marketing_click`
- Event name:
  - `marketing_click`
- Trigger:
  - `CE - marketing_click`

Them Parameters:

- `click_name` = `{{DLV - click_name}}`
- `click_label` = `{{DLV - click_label}}`
- `click_section` = `{{DLV - click_section}}`
- `click_destination` = `{{DLV - click_destination}}`
- `page_location` = `{{DLV - page_location}}`

### 8.3 GA4 - contact_click

- Ten tag:
  - `GA4 - contact_click`
- Event name:
  - `contact_click`
- Trigger:
  - `CE - contact_click`

Them Parameters:

- `method` = `{{DLV - method}}`
- `link_url` = `{{DLV - link_url}}`
- `page_location` = `{{DLV - page_location}}`

### 8.4 GA4 - contact_phone_click

- Ten tag:
  - `GA4 - contact_phone_click`
- Event name:
  - `contact_phone_click`
- Trigger:
  - `CE - contact_phone_click`

Them Parameters:

- `contact_type` = `{{DLV - contact_type}}`
- `link_url` = `{{DLV - link_url}}`
- `link_text` = `{{DLV - link_text}}`
- `page_location` = `{{DLV - page_location}}`

### 8.5 GA4 - map_load_click

- Ten tag:
  - `GA4 - map_load_click`
- Event name:
  - `map_load_click`
- Trigger:
  - `CE - map_load_click`

Them Parameters:

- `click_name` = `{{DLV - click_name}}`
- `click_label` = `{{DLV - click_label}}`
- `page_location` = `{{DLV - page_location}}`

### 8.6 GA4 - lead_form_submit_attempt

- Ten tag:
  - `GA4 - lead_form_submit_attempt`
- Event name:
  - `lead_form_submit_attempt`
- Trigger:
  - `CE - lead_form_submit_attempt`

Them Parameters:

- `form_name` = `{{DLV - form_name}}`
- `course_type` = `{{DLV - course_type}}`
- `page_location` = `{{DLV - page_location}}`

### 8.7 GA4 - lead_form_submit_success

- Ten tag:
  - `GA4 - lead_form_submit_success`
- Event name:
  - `lead_form_submit_success`
- Trigger:
  - `CE - lead_form_submit_success`

Them Parameters:

- `form_name` = `{{DLV - form_name}}`
- `course_type` = `{{DLV - course_type}}`
- `lead_source` = `{{DLV - lead_source}}`
- `page_location` = `{{DLV - page_location}}`

### 8.8 GA4 - lead_form_submit_error

- Ten tag:
  - `GA4 - lead_form_submit_error`
- Event name:
  - `lead_form_submit_error`
- Trigger:
  - `CE - lead_form_submit_error`

Them Parameters:

- `form_name` = `{{DLV - form_name}}`
- `course_type` = `{{DLV - course_type}}`
- `error_type` = `{{DLV - error_type}}`
- `error_message` = `{{DLV - error_message}}`
- `page_location` = `{{DLV - page_location}}`

### 8.9 GA4 - generate_lead

- Ten tag:
  - `GA4 - generate_lead`
- Event name:
  - `generate_lead`
- Trigger:
  - `CE - generate_lead`

Them Parameters:

- `form_name` = `{{DLV - form_name}}`
- `course_type` = `{{DLV - course_type}}`
- `lead_source` = `{{DLV - lead_source}}`
- `page_location` = `{{DLV - page_location}}`

## 9. Tao conversion trong Google Ads

Can tao 2 conversion:

### 9.1 Lead form

1. Vao `Google Ads`
2. `Goals`
3. `Conversions`
4. `New conversion action`
5. Chon `Website`
6. Loai conversion:
   - Submit lead form
7. Dat ten:
   - `Lead Form Submit - Driving School`

Sau khi tao xong, vao `Tag setup` va copy:

- `Conversion ID`
- `Conversion label`

### 9.2 Phone click

1. Tao them 1 conversion moi
2. Chon website
3. Loai conversion:
   - Click so dien thoai
4. Dat ten:
   - `Phone Click - Driving School`

Copy tiep:

- `Conversion ID`
- `Conversion label`

## 10. Tao tag Google Ads conversion trong GTM

### 10.1 Google Ads - Lead Conversion

1. `Tags` -> `New`
2. Dat ten:
   - `Google Ads - Lead Conversion`
3. `Tag Configuration`
4. Chon:
   - `Google Ads Conversion Tracking`
5. Dien:
   - `Conversion ID` = ID tu Google Ads
   - `Conversion Label` = label cua lead form
6. Trigger:
   - `CE - generate_lead`

Neu can gia tri conversion:

- Conversion Value:
  - de trong, hoac dat so co dinh neu team ads muon

### 10.2 Google Ads - Phone Click Conversion

1. `Tags` -> `New`
2. Dat ten:
   - `Google Ads - Phone Click Conversion`
3. `Tag Configuration`
4. Chon:
   - `Google Ads Conversion Tracking`
5. Dien:
   - `Conversion ID` = ID tu Google Ads
   - `Conversion Label` = label cua phone click
6. Trigger:
   - `CE - contact_phone_click`

## 11. Tao event tuong ung trong GA4

Sau khi tag GA4 da ban event, vao GA4 de danh dau conversion.

### Cach lam

1. Vao `Google Analytics`
2. `Admin`
3. `Events`
4. Doi sau khi event da phat sinh
5. Tim cac event sau va bat `Mark as conversion`:

- `generate_lead`
- `contact_phone_click`

Co the bat them neu muon:

- `lead_form_submit_success`
- `contact_click`

## 12. Event names va y nghia cho team marketing

| Event name | Y nghia |
|---|---|
| `marketing_page_view` | Trang da tai xong va website san sang tracking |
| `marketing_click` | User bam 1 CTA da duoc danh dau `data-track-click` |
| `contact_click` | User click Zalo hoac Facebook |
| `contact_phone_click` | User click vao link goi dien |
| `map_load_click` | User bam tai ban do |
| `lead_form_submit_attempt` | User da bam gui form |
| `lead_form_submit_success` | Form gui thanh cong |
| `lead_form_submit_error` | Form gui loi |
| `generate_lead` | Lead da duoc tao thanh cong, dung de doi conversion |

## 13. Cac gia tri dataLayer hien co

Website dang push cac key sau:

- `page_location`
- `page_path`
- `page_title`
- `page_lang`
- `click_name`
- `click_label`
- `click_section`
- `click_destination`
- `method`
- `link_url`
- `link_text`
- `contact_type`
- `form_name`
- `course_type`
- `lead_source`
- `error_type`
- `error_message`
- `send_to`

## 14. Preview va test truoc khi publish

### B1. Bat Preview

1. Vao GTM
2. Bam `Preview`
3. Nhap domain website
4. Connect

### B2. Test tren web

Lam lan luot:

1. Mo trang chu
2. Bam CTA `Dang ky tu van`
3. Bam CTA `Dang nhap he thong`
4. Bam hotline
5. Bam Zalo
6. Gui form dang ky

### B3. Kiem tra event trong Tag Assistant

Phai thay event xuat hien:

- `marketing_page_view`
- `marketing_click`
- `contact_click`
- `contact_phone_click`
- `lead_form_submit_attempt`
- `lead_form_submit_success`

### B4. Kiem tra tag da fire

Trong tung event, xem:

- `GA4 - ...` co fire khong
- `Google Ads - Lead Conversion` co fire o `generate_lead` khong
- `Google Ads - Phone Click Conversion` co fire o `contact_phone_click` khong

## 15. Publish container

Khi test xong:

1. Quay lai GTM
2. Bam `Submit`
3. Dien version name

Vi du:

- `Add GA4 + Ads lead and phone tracking`

4. Publish

## 16. Ten tag khuyen nghi

De de quan ly, nen dat ten theo quy tac:

- `GA4 - Config`
- `GA4 - marketing_page_view`
- `GA4 - marketing_click`
- `GA4 - contact_click`
- `GA4 - contact_phone_click`
- `GA4 - lead_form_submit_attempt`
- `GA4 - lead_form_submit_success`
- `GA4 - lead_form_submit_error`
- `GA4 - generate_lead`
- `Google Ads - Lead Conversion`
- `Google Ads - Phone Click Conversion`

## 17. Ten trigger khuyen nghi

- `CE - marketing_page_view`
- `CE - marketing_click`
- `CE - contact_click`
- `CE - contact_phone_click`
- `CE - map_load_click`
- `CE - lead_form_submit_attempt`
- `CE - lead_form_submit_success`
- `CE - lead_form_submit_error`
- `CE - generate_lead`

## 18. Ten variable khuyen nghi

- `DLV - page_location`
- `DLV - page_path`
- `DLV - page_title`
- `DLV - page_lang`
- `DLV - click_name`
- `DLV - click_label`
- `DLV - click_section`
- `DLV - click_destination`
- `DLV - method`
- `DLV - link_url`
- `DLV - link_text`
- `DLV - contact_type`
- `DLV - form_name`
- `DLV - course_type`
- `DLV - lead_source`
- `DLV - error_type`
- `DLV - error_message`
- `DLV - send_to`

## 19. Ghi chu quan trong

- Khong dien so dien thoai vao `Conversion Label`
- `Conversion Label` phai lay tu giao dien Google Ads
- Neu da dung GTM snippet truc tiep trong HTML, khong can bat them GTM bang JS lan nua
- Nen de GTM la noi trung tam quan ly tracking thay vi hardcode tung tag le

## 20. Checklist ngan gon cho team marketing

1. Lay `Measurement ID` tu GA4
2. Tao 2 conversion trong Google Ads:
   - Lead form
   - Phone click
3. Lay `Conversion ID` va `Conversion Label`
4. Tao cac `Data Layer Variable`
5. Tao cac `Custom Event Trigger`
6. Tao `GA4 - Config`
7. Tao tat ca `GA4 Event Tag`
8. Tao `Google Ads - Lead Conversion`
9. Tao `Google Ads - Phone Click Conversion`
10. Preview
11. Test event
12. Publish

## 21. Neu muon mo rong sau nay

Co the bo sung them:

- Scroll depth
- Thoi gian o lai trang
- Xem video
- Click mo map Google
- Xem bai viet blog
- Submit login

Nhung o thoi diem hien tai, bo tracking da du cho SEO + Ads + remarketing co ban.
