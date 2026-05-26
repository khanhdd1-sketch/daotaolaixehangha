/**
 * Render điều khiển phân trang bảng kết quả admin.
 * @param {object} pagination - { page, limit, total, totalPages }
 * @param {(page: number) => void} onPageChange - Callback đổi trang
 * @sideeffects Ghi #resultPaginationBar
 */
export function renderResultsPagination(pagination, onPageChange) {
  const host = document.getElementById("resultPaginationBar");
  if (!host) return;

  const { page, limit, total, totalPages } = pagination;
  const safeTotalPages = Math.max(1, totalPages || 1);
  const prevDisabled = page <= 1;
  const nextDisabled = page >= safeTotalPages;

  host.innerHTML = `
    <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
      <div class="text-muted small">
        Trang ${page}/${safeTotalPages} — ${total} kết quả (mỗi trang ${limit})
      </div>
      <div class="d-flex flex-wrap align-items-center gap-2">
        <label class="visually-hidden" for="resultPageSize">Số dòng mỗi trang</label>
        <select class="form-select form-select-sm" id="resultPageSize" style="width: auto;" aria-label="Số dòng mỗi trang">
          ${[10, 20, 50].map((size) => `<option value="${size}" ${size === limit ? "selected" : ""}>${size}/trang</option>`).join("")}
        </select>
        <button class="btn btn-outline-secondary btn-sm" type="button" data-result-page="prev" ${prevDisabled ? "disabled" : ""}>
          Trước
        </button>
        <button class="btn btn-outline-secondary btn-sm" type="button" data-result-page="next" ${nextDisabled ? "disabled" : ""}>
          Sau
        </button>
      </div>
    </div>
  `;

  host.querySelector('[data-result-page="prev"]')?.addEventListener("click", () => {
    if (!prevDisabled) onPageChange(page - 1);
  });
  host.querySelector('[data-result-page="next"]')?.addEventListener("click", () => {
    if (!nextDisabled) onPageChange(page + 1);
  });
  host.querySelector("#resultPageSize")?.addEventListener("change", (event) => {
    const newLimit = Number(event.target.value) || 20;
    onPageChange(1, newLimit);
  });
}
