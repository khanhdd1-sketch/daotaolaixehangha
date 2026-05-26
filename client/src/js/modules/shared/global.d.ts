/**
 * Khai báo global cho checkJs (browser + Bootstrap).
 */
export {};

declare global {
  interface DriveSchoolCommonApi {
    escapeHtml(value: unknown): string;
    withLangUrl(path: string): string;
  }

  // eslint-disable-next-line no-var
  var DriveSchoolCommon: DriveSchoolCommonApi;

  namespace globalThis {
    // eslint-disable-next-line no-var
    var DriveSchoolCommon: DriveSchoolCommonApi;
  }

  const bootstrap: {
    Modal: new (
      element: Element,
      options?: { backdrop?: string | boolean; keyboard?: boolean }
    ) => { show(): void; hide(): void };
  };
}
