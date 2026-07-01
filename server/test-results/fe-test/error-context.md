# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: fe.test.js >> test
- Location: fe.test.js:3:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.selectOption: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByLabel('Bài học', { exact: true })
    - locator resolved to <select required="" name="lesson_id" class="form-select" id="lessonQuestionLessonId"></select>
  - attempting select option action
    2 × waiting for element to be visible and enabled
      - did not find some options
    - retrying select option action
    - waiting 20ms
    2 × waiting for element to be visible and enabled
      - did not find some options
    - retrying select option action
      - waiting 100ms
    27 × waiting for element to be visible and enabled
       - did not find some options
     - retrying select option action
       - waiting 500ms

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - main [ref=e2]:
    - generic [ref=e3]:
      - generic [ref=e6]:
        - generic [ref=e7]:
          - generic [ref=e8]: Trung tâm điều hành admin
          - heading "Xin chào, System Admin" [level=1] [ref=e9]
          - paragraph [ref=e10]: Quản lý học viên, đề thi nội bộ, bài thi mô phỏng, kết quả và thống kê cho trung tâm dạy lái xe.
        - generic [ref=e11]:
          - link "Trang chủ" [ref=e12] [cursor=pointer]:
            - /url: /index.html
          - button "Đăng xuất" [ref=e13] [cursor=pointer]
      - navigation "Điều hướng quản trị" [ref=e15]:
        - link "Tổng quan" [ref=e16] [cursor=pointer]:
          - /url: /admin.html
        - link "Học viên" [ref=e17] [cursor=pointer]:
          - /url: /admin-students.html
        - link "Lý thuyết" [ref=e18] [cursor=pointer]:
          - /url: /admin-theory.html
        - link "Mô phỏng" [ref=e19] [cursor=pointer]:
          - /url: /admin-simulation.html
        - link "Bài học" [ref=e20] [cursor=pointer]:
          - /url: /admin-lessons.html
        - link "Kết quả" [ref=e21] [cursor=pointer]:
          - /url: /admin-results.html
      - generic [ref=e23]:
        - generic [ref=e25]:
          - generic [ref=e26]:
            - generic [ref=e27]:
              - heading "Quản lý bài học" [level=2] [ref=e28]
              - paragraph [ref=e29]: Tạo bài học video, thứ tự và điểm đạt quiz.
            - generic [ref=e30]: 0 bài
          - generic [ref=e31]:
            - generic [ref=e32]:
              - generic [ref=e33]: Loại bằng
              - combobox "Loại bằng" [ref=e34]:
                - option "A1"
                - option "A2"
                - option "B1"
                - option "B2" [selected]
                - option "C1"
            - generic [ref=e35]:
              - generic [ref=e36]: Tên bài học
              - textbox "Tên bài học" [ref=e37]
            - generic [ref=e38]:
              - generic [ref=e39]: Mô tả
              - textbox "Mô tả" [ref=e40]
            - generic [ref=e41]:
              - generic [ref=e42]: Thứ tự
              - spinbutton "Thứ tự" [ref=e43]
            - generic [ref=e44]:
              - generic [ref=e45]: Điểm đạt quiz
              - spinbutton "Điểm đạt quiz" [ref=e46]
            - generic [ref=e48]:
              - checkbox "Đang kích hoạt" [checked] [ref=e49]
              - generic [ref=e50]: Đang kích hoạt
            - generic [ref=e51]:
              - generic [ref=e52]: URL video bài học
              - textbox "URL video bài học" [ref=e53]
            - generic [ref=e54]:
              - button "Làm mới" [ref=e55] [cursor=pointer]
              - button "Lưu bài học" [ref=e56] [cursor=pointer]
          - generic [ref=e57]:
            - generic [ref=e58]:
              - generic [ref=e59]: Tìm bài học
              - searchbox "Tìm bài học" [ref=e60]
            - generic [ref=e61]:
              - generic [ref=e62]: Lọc loại bằng
              - combobox "Lọc loại bằng" [ref=e63]:
                - option "Tất cả" [selected]
                - option "A1"
                - option "A2"
                - option "B1"
                - option "B2"
                - option "C1"
        - generic [ref=e65]:
          - generic [ref=e66]:
            - generic [ref=e67]:
              - heading "Câu hỏi quiz bài học" [level=2] [ref=e68]
              - paragraph [ref=e69]: Câu hỏi sau khi học viên xem video bài học.
            - generic [ref=e70]: 0 câu
          - generic [ref=e71]:
            - generic [ref=e72]:
              - generic [ref=e73]: Bài học
              - combobox "Bài học" [ref=e74]
            - generic [ref=e75]:
              - generic [ref=e76]: Đáp án đúng
              - combobox "Đáp án đúng" [ref=e77]:
                - option "A" [selected]
                - option "B"
                - option "C"
                - option "D"
            - generic [ref=e78]:
              - generic [ref=e79]: Nội dung câu hỏi
              - textbox "Nội dung câu hỏi" [ref=e80]
            - generic [ref=e81]:
              - generic [ref=e82]: Upload ảnh
              - button "Upload ảnh" [active] [ref=e83] [cursor=pointer]
            - generic [ref=e84]:
              - generic [ref=e85]: Đáp án A
              - textbox "Đáp án A" [ref=e86]
            - generic [ref=e87]:
              - generic [ref=e88]: Đáp án B
              - textbox "Đáp án B" [ref=e89]
            - generic [ref=e90]:
              - generic [ref=e91]: Đáp án C
              - textbox "Đáp án C" [ref=e92]
            - generic [ref=e93]:
              - generic [ref=e94]: Đáp án D
              - textbox "Đáp án D" [ref=e95]
            - generic [ref=e96]:
              - generic [ref=e97]: Giải thích
              - textbox "Giải thích" [ref=e98]
            - generic [ref=e99]:
              - button "Làm mới" [ref=e100] [cursor=pointer]
              - button "Lưu câu hỏi" [ref=e101] [cursor=pointer]
          - generic [ref=e102]:
            - generic [ref=e103]:
              - generic [ref=e104]: Tìm câu hỏi
              - searchbox "Tìm câu hỏi" [ref=e105]
            - generic [ref=e106]:
              - generic [ref=e107]: Lọc theo bài
              - combobox "Lọc theo bài" [ref=e108]:
                - option "Tất cả bài" [selected]
          - table [ref=e110]:
            - rowgroup [ref=e111]:
              - row "Bài học Câu hỏi Đúng" [ref=e112]:
                - columnheader "Bài học" [ref=e113]
                - columnheader "Câu hỏi" [ref=e114]
                - columnheader "Đúng" [ref=e115]
                - columnheader [ref=e116]
            - rowgroup
  - link "Open Facebook page" [ref=e117] [cursor=pointer]:
    - /url: https://www.facebook.com/daotaolaixehangha
  - link "Zalo" [ref=e119] [cursor=pointer]:
    - /url: https://zalo.me/0986082686
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test('test', async ({ page }) => {
  4   |   await page.goto('http://localhost:5000/');
  5   |   await page.getByText('Admin quản lý tập trung Chỉ').click();
  6   |   await page.getByRole('heading', { name: 'Giao diện thân thiện, thao tá' }).click();
  7   |   await page.getByRole('textbox', { name: 'Họ và tên' }).click();
  8   |   await page.getByRole('textbox', { name: 'Họ và tên' }).fill('khánh');
  9   |   await page.getByRole('textbox', { name: 'Họ và tên' }).press('Tab');
  10  |   await page.getByRole('textbox', { name: 'Số điện thoại' }).fill('0985363602');
  11  |   await page.getByRole('textbox', { name: 'Số điện thoại' }).press('Tab');
  12  |   await page.getByRole('textbox', { name: 'Email' }).fill('khanhuu@gmail.com');
  13  |   await page.getByLabel('Loại bằng').selectOption('A1');
  14  |   await page.locator('#registrationForm div').filter({ hasText: 'Ghi chú' }).click();
  15  |   await page.getByRole('textbox', { name: 'Ghi chú' }).click();
  16  |   await page.getByRole('textbox', { name: 'Ghi chú' }).fill('ok nha');
  17  |   await page.getByRole('button', { name: 'Gửi đăng ký' }).click();
  18  |   await page.getByRole('link', { name: 'Đăng nhập', exact: true }).click();
  19  |   await page.getByRole('textbox', { name: 'Email' }).click();
  20  |   await page.getByRole('textbox', { name: 'Email' }).fill('ad');
  21  |   await page.getByRole('textbox', { name: 'Email' }).press('ControlOrMeta+a');
  22  |   await page.getByRole('textbox', { name: 'Email' }).dblclick();
  23  |   await page.getByRole('textbox', { name: 'Email' }).dblclick();
  24  |   await page.getByRole('textbox', { name: 'Email' }).fill('admin@drivingschool.vn');
  25  |   await page.getByRole('textbox', { name: 'Mật khẩu' }).click();
  26  |   await page.getByRole('textbox', { name: 'Mật khẩu' }).fill('admin@drivingschool.vn');
  27  |   await page.getByRole('textbox', { name: 'Mật khẩu' }).press('ControlOrMeta+a');
  28  |   await page.getByRole('textbox', { name: 'Mật khẩu' }).fill('Admin@123');
  29  |   await page.getByRole('button', { name: 'Đăng nhập' }).click();
  30  |   await page.getByRole('textbox', { name: 'Từ ngày' }).fill('2026-12-06');
  31  |   await page.getByRole('button', { name: 'Cập nhật dashboard' }).click();
  32  |   await page.getByRole('button', { name: 'Cập nhật dashboard' }).click();
  33  |   await page.getByLabel('Loại bằng').selectOption('A1');
  34  |   await page.getByLabel('Loại bằng').selectOption('A2');
  35  |   await page.getByLabel('Loại bằng').selectOption('B1');
  36  |   await page.getByRole('link', { name: 'Học viên' }).click();
  37  |   await page.getByRole('textbox', { name: 'Tên học viên' }).click();
  38  |   await page.getByRole('textbox', { name: 'Tên học viên' }).fill('khanh');
  39  |   await page.getByRole('textbox', { name: 'Tên học viên' }).press('Tab');
  40  |   await page.getByRole('textbox', { name: 'Email' }).fill('khanh@test.com');
  41  |   await page.getByRole('button', { name: 'Thêm học viên' }).click();
  42  |   await page.getByPlaceholder('Tên, số điện thoại, email').click();
  43  |   await page.getByPlaceholder('Tên, số điện thoại, email').fill('khanh');
  44  |   await page.getByPlaceholder('Tên, số điện thoại, email').click();
  45  |   await page.getByPlaceholder('Tên, số điện thoại, email').click();
  46  |   await page.getByPlaceholder('Tên, số điện thoại, email').click();
  47  |   await page.getByPlaceholder('Tên, số điện thoại, email').click();
  48  |   await page.getByPlaceholder('Tên, số điện thoại, email').click();
  49  |   await page.getByPlaceholder('Tên, số điện thoại, email').click();
  50  |   await page.getByPlaceholder('Tên, số điện thoại, email').fill('');
  51  |   await page.locator('#registrationCourseFilterLocal').selectOption('B2');
  52  |   await page.locator('#registrationCourseFilterLocal').selectOption('A1');
  53  |   await page.locator('#registrationCourseFilterLocal').selectOption('');
  54  |   await page.getByPlaceholder('Tên, số điện thoại, email').click();
  55  |   await page.getByRole('link', { name: 'Bài học' }).click();
  56  |   await page.getByRole('textbox', { name: 'Tên bài học' }).click();
  57  |   await page.getByRole('link', { name: 'Bài học' }).click();
  58  |   await page.getByRole('main').click();
  59  |   await page.getByRole('textbox', { name: 'Giải thích' }).press('F12');
  60  |   await page.getByText('Câu hỏi quiz bài học Câu hỏi sau khi học viên xem video bài học. 0 câu Bài học').click();
  61  |   await page.getByRole('textbox', { name: 'Tên bài học' }).fill('khánh');
  62  |   await page.getByRole('textbox', { name: 'Mô tả' }).fill('khánh');
  63  |   await page.getByRole('spinbutton', { name: 'Thứ tự' }).fill('61');
  64  |   await page.getByRole('spinbutton', { name: 'Điểm đạt quiz' }).fill('1');
  65  |   await page.getByRole('textbox', { name: 'URL video bài học' }).fill('youtube.com');
  66  |   await page.goto('http://localhost:5000/admin-lessons.html');
  67  |   await page.getByRole('button', { name: 'Upload ảnh' }).click();
> 68  |   await page.getByLabel('Bài học', { exact: true }).selectOption('lesson_1781753097400_454ef982');
      |                                                     ^ Error: locator.selectOption: Test timeout of 30000ms exceeded.
  69  |   await page.getByRole('textbox', { name: 'Nội dung câu hỏi' }).click();
  70  |   await page.getByRole('textbox', { name: 'Nội dung câu hỏi' }).fill('1');
  71  |   await page.getByLabel('Đáp án đúng').selectOption('D');
  72  |   await page.getByRole('button', { name: 'Upload ảnh' }).click();
  73  |   await page.getByRole('button', { name: 'Upload ảnh' }).setInputFiles('test.gif');
  74  |   await page.getByRole('button', { name: 'Upload ảnh' }).click();
  75  |   await page.getByRole('button', { name: 'Upload ảnh' }).setInputFiles('Untitled.png');
  76  |   await page.getByRole('textbox', { name: 'Đáp án A' }).click();
  77  |   await page.getByRole('textbox', { name: 'Đáp án A' }).fill('23');
  78  |   await page.getByRole('textbox', { name: 'Đáp án B' }).click();
  79  |   await page.getByRole('textbox', { name: 'Đáp án B' }).click();
  80  |   await page.getByRole('textbox', { name: 'Đáp án B' }).fill('3');
  81  |   await page.getByRole('textbox', { name: 'Đáp án C' }).click();
  82  |   await page.getByRole('textbox', { name: 'Đáp án C' }).fill('4');
  83  |   await page.getByRole('textbox', { name: 'Đáp án D' }).click();
  84  |   await page.getByRole('textbox', { name: 'Đáp án D' }).fill('5');
  85  |   await page.getByRole('textbox', { name: 'Giải thích' }).click();
  86  |   await page.getByRole('textbox', { name: 'Giải thích' }).fill('6');
  87  |   await page.getByRole('button', { name: 'Lưu câu hỏi' }).click();
  88  |   await page.getByRole('searchbox', { name: 'Tìm câu hỏi' }).click();
  89  |   await page.getByRole('searchbox', { name: 'Tìm câu hỏi' }).fill('khánh');
  90  |   await page.getByRole('searchbox', { name: 'Tìm câu hỏi' }).click();
  91  |   await page.getByRole('searchbox', { name: 'Tìm câu hỏi' }).click();
  92  |   await page.getByRole('searchbox', { name: 'Tìm câu hỏi' }).fill('test');
  93  |   await page.getByLabel('Lọc theo bài').selectOption('lesson_1781753097400_454ef982');
  94  |   await page.getByRole('searchbox', { name: 'Tìm câu hỏi' }).click();
  95  |   await page.getByRole('searchbox', { name: 'Tìm câu hỏi' }).fill('');
  96  |   await page.getByRole('button', { name: 'Sửa' }).click();
  97  |   await page.locator('.text-end > .btn.btn-sm.btn-outline-danger').click();
  98  |   await page.getByRole('button', { name: 'Xóa câu hỏi' }).click();
  99  |   await page.getByLabel('Lọc theo bài').selectOption('lesson_1780561498122_36a25679');
  100 |   await page.getByLabel('Lọc theo bài').selectOption('lesson_1781753097400_454ef982');
  101 |   await page.getByRole('link', { name: 'Kết quả' }).click();
  102 |   await page.getByRole('searchbox', { name: 'Tìm nhanh' }).click();
  103 |   await page.getByRole('searchbox', { name: 'Tìm nhanh' }).fill('khánh');
  104 |   await page.getByRole('searchbox', { name: 'Tìm nhanh' }).press('Enter');
  105 |   await page.getByLabel('Loại bằng').selectOption('B2');
  106 |   await page.getByLabel('Kenh thi').selectOption('theory');
  107 |   await page.getByLabel('Trạng thái').selectOption('failed');
  108 |   await page.getByText('Chưa đạt').nth(1).click();
  109 |   await page.getByLabel('Kenh thi').selectOption('third_party');
  110 |   await page.getByLabel('Loại bằng').selectOption('');
  111 |   await page.getByRole('searchbox', { name: 'Tìm nhanh' }).click();
  112 |   await page.getByRole('searchbox', { name: 'Tìm nhanh' }).fill('');
  113 |   await page.getByRole('row', { name: 'Dương Đình Khánh A1 3rd-party' }).getByRole('button').click();
  114 |   const page1Promise = page.waitForEvent('popup');
  115 |   await page.getByRole('link', { name: 'Mở ảnh trong tab mới' }).click();
  116 |   const page1 = await page1Promise;
  117 |   await page.getByRole('button').filter({ hasText: /^$/ }).click();
  118 |   await page.getByLabel('Số dòng mỗi trang').selectOption('10');
  119 |   await page.getByLabel('Số dòng mỗi trang').selectOption('20');
  120 |   await page.getByLabel('Số dòng mỗi trang').selectOption('50');
  121 |   await page.goto('http://localhost:5000/admin-theory.html');
  122 |   await page.getByRole('button', { name: 'Ảnh câu hỏi (có thể bỏ trống)' }).click();
  123 |   await page.getByRole('textbox', { name: 'Tên đề' }).click();
  124 |   await page.getByRole('textbox', { name: 'Tên đề' }).fill('khanh');
  125 |   await page.getByRole('spinbutton', { name: 'Điểm đạt' }).click();
  126 |   await page.getByRole('spinbutton', { name: 'Điểm đạt' }).fill('10');
  127 |   await page.getByRole('spinbutton', { name: 'Tổng câu' }).click();
  128 |   await page.getByRole('spinbutton', { name: 'Tổng câu' }).fill('10');
  129 |   await page.getByRole('button', { name: 'Lưu đề' }).click();
  130 |   await page.getByLabel('Đề thi').selectOption('exam_1781753356918_fe20a09c');
  131 |   await page.getByRole('checkbox', { name: 'Là câu điểm liệt' }).check();
  132 |   await page.getByLabel('Đáp án đúng').selectOption('D');
  133 |   await page.getByRole('textbox', { name: 'Nội dung câu hỏi' }).click();
  134 |   await page.getByRole('textbox', { name: 'Nội dung câu hỏi' }).fill('1');
  135 |   await page.getByRole('textbox', { name: 'Đáp án A' }).click();
  136 |   await page.getByRole('textbox', { name: 'Đáp án A' }).fill('2');
  137 |   await page.getByRole('textbox', { name: 'Đáp án B' }).click();
  138 |   await page.getByRole('textbox', { name: 'Đáp án A' }).fill('23');
  139 |   await page.getByRole('textbox', { name: 'Đáp án B' }).click();
  140 |   await page.getByRole('textbox', { name: 'Đáp án B' }).fill('34');
  141 |   await page.getByRole('textbox', { name: 'Đáp án C' }).click();
  142 |   await page.getByRole('textbox', { name: 'Đáp án C' }).fill('4');
  143 |   await page.getByRole('textbox', { name: 'Đáp án D' }).click();
  144 |   await page.getByRole('textbox', { name: 'Đáp án D' }).fill('56');
  145 |   await page.getByRole('textbox', { name: 'Giải thích hiện sau khi nộp' }).click();
  146 |   await page.getByRole('textbox', { name: 'Giải thích hiện sau khi nộp' }).fill('6');
  147 |   await page.getByRole('textbox', { name: 'Giải thích hiện sau khi nộp' }).click();
  148 |   await page.getByRole('button', { name: 'Ảnh câu hỏi (có thể bỏ trống)' }).click();
  149 |   await page.getByRole('button', { name: 'Ảnh câu hỏi (có thể bỏ trống)' }).setInputFiles('Untitled.png');
  150 |   await page.getByRole('button', { name: 'Lưu câu hỏi' }).click();
  151 |   await page.getByLabel('Đề thi').selectOption('exam_1781753356918_fe20a09c');
  152 |   await page.getByRole('button', { name: 'Xem ảnh' }).click();
  153 |   await page.getByRole('button', { name: 'Sửa' }).click();
  154 |   await page.getByRole('button', { name: 'Xóa' }).click();
  155 |   await page.getByRole('button', { name: 'Xóa câu hỏi' }).click();
  156 |   await page.getByRole('link', { name: 'Mô phỏng' }).click();
  157 |   await page.getByRole('textbox', { name: 'Tên bài mô phỏng' }).click();
  158 |   await page.getByRole('textbox', { name: 'Tên bài mô phỏng' }).fill('mo phong b2');
  159 |   await page.getByRole('textbox', { name: 'Mô tả' }).click();
  160 |   await page.getByRole('textbox', { name: 'Mô tả' }).fill('1');
  161 |   await page.getByRole('spinbutton', { name: 'Điểm đạt' }).click();
  162 |   await page.getByRole('spinbutton', { name: 'Điểm đạt' }).fill('3');
  163 |   await page.getByRole('spinbutton', { name: 'Tổng clip' }).click();
  164 |   await page.getByRole('spinbutton', { name: 'Tổng clip' }).fill('3');
  165 |   await page.getByRole('button', { name: 'Lưu bài mô phỏng' }).click();
  166 |   await page.getByLabel('Bài mô phỏng', { exact: true }).selectOption('sim_exam_1781753432328_fedc06e1');
  167 |   await page.getByRole('textbox', { name: 'Tên clip' }).click();
  168 |   await page.getByRole('textbox', { name: 'Tên clip' }).fill('1');
```