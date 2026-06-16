
/**
 * Copyright (c) 2026 Driving Training Center Hang Ha
 * (Trung tâm đào tạo lái xe Hiếu Khánh)
 *
 * All rights reserved.
 */
/**
 * Phân tích query phân trang từ request Express.
 * @param {object} query - req.query
 * @param {{ defaultLimit?: number, maxLimit?: number }} [options]
 * @returns {{ page: number, limit: number, skip: number }}
 */
function parsePaginationQuery(query = {}, options = {}) {
  const defaultLimit = options.defaultLimit ?? 20;
  const maxLimit = options.maxLimit ?? 100;
  const page = Math.max(1, Number.parseInt(String(query.page || "1"), 10) || 1);
  const rawLimit = Number.parseInt(String(query.limit || String(defaultLimit)), 10) || defaultLimit;
  const limit = Math.min(maxLimit, Math.max(1, rawLimit));
  return {
    page,
    limit,
    skip: (page - 1) * limit
  };
}

/**
 * Cắt mảng theo phân trang và trả về envelope chuẩn.
 * @template T
 * @param {T[]} items - Toàn bộ dữ liệu
 * @param {{ page: number, limit: number, skip?: number }} pagination
 * @returns {{ data: T[], total: number, page: number, limit: number, totalPages: number }}
 */
function paginateArray(items, pagination) {
  const total = items.length;
  const skip = pagination.skip ?? (pagination.page - 1) * pagination.limit;
  const data = items.slice(skip, skip + pagination.limit);
  const totalPages = total === 0 ? 1 : Math.ceil(total / pagination.limit);
  return {
    data,
    total,
    page: pagination.page,
    limit: pagination.limit,
    totalPages
  };
}

module.exports = {
  parsePaginationQuery,
  paginateArray
};
