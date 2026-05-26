/**

 * @deprecated Dùng module ES: /src/js/entries/admin-dashboard.js

 * Giữ file để tương thích nếu HTML cũ vẫn trỏ admin.js.

 */

import { initAdminOverviewPage } from "./modules/admin/controllers/adminPageController.js";



document.addEventListener("DOMContentLoaded", () => {

  void initAdminOverviewPage();

});


