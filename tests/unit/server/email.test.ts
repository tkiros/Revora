import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

import { sendEmail } from "../../../lib/server/email";

describe("sendEmail", () => {
  afterEach(() => {
    delete process.env.AUTH_EMAIL_STUB_DIR;
    delete process.env.RESEND_API_KEY;
  });

  it("POSTs to Resend with bearer auth and the message body", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true, status: 200 });

    const result = await sendEmail(
      { to: "buyer@example.com", subject: "Hi", text: "Body" },
      { fetchImpl: fetchImpl as unknown as typeof fetch }
    );

    expect(result).toEqual({ ok: true });
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe("https://api.resend.com/emails");
    expect(init.headers.Authorization).toBe("Bearer re_test_key");
    const body = JSON.parse(init.body);
    expect(body.to).toBe("buyer@example.com");
    expect(body.subject).toBe("Hi");
    expect(body.text).toBe("Body");
  });

  it("returns ok:false with the status on a Resend error", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    const fetchImpl = vi.fn().mockResolvedValue({ ok: false, status: 429 });

    const result = await sendEmail(
      { to: "b@e.com", subject: "s", text: "t" },
      { fetchImpl: fetchImpl as unknown as typeof fetch }
    );

    expect(result).toEqual({ ok: false, status: 429 });
  });

  it("writes to the stub dir instead of fetching when AUTH_EMAIL_STUB_DIR is set", async () => {
    const stubDir = fs.mkdtempSync(path.join(os.tmpdir(), "revora-mail-"));
    process.env.AUTH_EMAIL_STUB_DIR = stubDir;
    const fetchImpl = vi.fn();

    const result = await sendEmail(
      { to: "buyer@example.com", subject: "Report ready", text: "link" },
      { fetchImpl: fetchImpl as unknown as typeof fetch }
    );

    expect(result).toEqual({ ok: true });
    expect(fetchImpl).not.toHaveBeenCalled();
    const files = fs.readdirSync(stubDir);
    expect(files.length).toBe(1);
    const saved = JSON.parse(fs.readFileSync(path.join(stubDir, files[0]), "utf8"));
    expect(saved.subject).toBe("Report ready");
  });
});
