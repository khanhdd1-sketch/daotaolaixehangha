/** @typedef {'danger'|'warning'|'primary'} ConfirmModalVariant */

const MODAL_ID = "driveSchoolConfirmModal";
const DEFAULT_LABELS = Object.freeze({
  title: "Xác nhận",
  confirm: "Xác nhận",
  cancel: "Hủy"
});

/** @type {InstanceType<typeof bootstrap.Modal> | null} */
let modalInstance = null;
/** @type {((value: boolean) => void) | null} */
let pendingResolve = null;

/**
 * Gắn modal xác nhận Bootstrap vào DOM (một lần).
 * @sideeffects Tạo phần tử modal nếu chưa có
 */
export function mountConfirmModal() {
  if (document.getElementById(MODAL_ID)) return;

  document.body.insertAdjacentHTML(
    "beforeend",
    `
    <div class="modal fade" id="${MODAL_ID}" tabindex="-1" aria-labelledby="${MODAL_ID}Title" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title h5" id="${MODAL_ID}Title">${DEFAULT_LABELS.title}</h2>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Đóng hộp thoại"></button>
          </div>
          <div class="modal-body">
            <p class="mb-0" id="${MODAL_ID}Message"></p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-confirm-action="cancel" data-bs-dismiss="modal">
              ${DEFAULT_LABELS.cancel}
            </button>
            <button type="button" class="btn btn-danger" data-confirm-action="confirm" id="${MODAL_ID}ConfirmBtn">
              ${DEFAULT_LABELS.confirm}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
  );

  const modalEl = document.getElementById(MODAL_ID);
  if (!modalEl) return;
  modalInstance = new bootstrap.Modal(modalEl, { backdrop: "static", keyboard: true });

  modalEl.addEventListener("hidden.bs.modal", () => {
    if (pendingResolve) {
      pendingResolve(false);
      pendingResolve = null;
    }
  });

  modalEl.querySelector('[data-confirm-action="confirm"]')?.addEventListener("click", () => {
    if (pendingResolve) {
      const resolve = pendingResolve;
      pendingResolve = null;
      resolve(true);
    }
    modalInstance?.hide();
  });

  modalEl.querySelector('[data-confirm-action="cancel"]')?.addEventListener("click", () => {
    pendingResolve = null;
  });
}

/**
 * Hiển thị modal xác nhận hành động phá hủy.
 * @param {object} options
 * @param {string} options.message - Nội dung chính
 * @param {string} [options.title] - Tiêu đề modal
 * @param {string} [options.confirmLabel] - Nhãn nút xác nhận
 * @param {string} [options.cancelLabel] - Nhãn nút hủy
 * @param {ConfirmModalVariant} [options.variant='danger'] - Kiểu nút xác nhận
 * @returns {Promise<boolean>} true nếu người dùng xác nhận
 */
export function confirmDestructive({
  message,
  title = DEFAULT_LABELS.title,
  confirmLabel = "Xóa",
  cancelLabel = DEFAULT_LABELS.cancel,
  variant = "danger"
}) {
  mountConfirmModal();

  const titleEl = document.getElementById(`${MODAL_ID}Title`);
  const messageEl = document.getElementById(`${MODAL_ID}Message`);
  const confirmBtn = document.getElementById(`${MODAL_ID}ConfirmBtn`);
  const cancelBtn = document.querySelector(`#${MODAL_ID} [data-confirm-action="cancel"]`);

  if (titleEl) titleEl.textContent = title;
  if (messageEl) messageEl.textContent = message;
  if (confirmBtn) {
    confirmBtn.textContent = confirmLabel;
    confirmBtn.className = `btn btn-${variant}`;
  }
  if (cancelBtn) cancelBtn.textContent = cancelLabel;

  return new Promise((resolve) => {
    pendingResolve = resolve;
    modalInstance?.show();
  });
}
