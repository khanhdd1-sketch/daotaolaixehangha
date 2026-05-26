import { normalizeText, matchesSearch } from "../src/js/modules/shared/textUtils.js";

describe("textUtils", () => {
  it("normalizeText bo dau va chuyen chu thuong", () => {
    expect(normalizeText("Đạt thi lý thuyết")).toBe("dat thi ly thuyet");
  });

  it("matchesSearch tra ve true khi khong co tu khoa", () => {
    expect(matchesSearch(["abc"], "")).toBe(true);
  });

  it("matchesSearch tim trong mang gia tri", () => {
    expect(matchesSearch(["Bài học số 1", "note"], normalizeText("bai hoc"))).toBe(true);
  });
});
