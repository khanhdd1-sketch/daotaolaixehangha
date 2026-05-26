/**
 * Thiết lập môi trường Jest cho server (mock mode, polyfill).
 */
const { TextEncoder, TextDecoder } = require("util");

process.env.USE_MOCK_DATA = "true";
process.env.NODE_ENV = "test";
delete process.env.APPS_SCRIPT_URL;

if (!globalThis.TextEncoder) {
  globalThis.TextEncoder = TextEncoder;
}
if (!globalThis.TextDecoder) {
  globalThis.TextDecoder = TextDecoder;
}

if (!globalThis.fetch) {
  globalThis.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ success: true, data: [] })
  });
}
