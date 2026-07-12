// TEMPORARY diagnostic — remove once the CI/local fold discrepancy is explained.
import { test, expect } from "@playwright/test";

test("PROBE: what is above the CTA", async ({ page }) => {
  await page.goto("/check?stay=1");
  const b = page.getByRole("button", { name: "Should I eat this?" });
  await expect(b).toBeVisible();
  await page.evaluate(() => (document as any).fonts.ready);

  const dump = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll("button")).find((el) =>
      /Should I eat this/.test(el.textContent || "")
    )!;
    const btnY = btn.getBoundingClientRect().top + window.scrollY;
    const rows: string[] = [];
    document.querySelectorAll("main *").forEach((el) => {
      const r = (el as HTMLElement).getBoundingClientRect();
      const y = r.top + window.scrollY;
      if (y < btnY && r.height > 8 && (el as HTMLElement).offsetParent !== null) {
        rows.push(
          `${el.tagName.toLowerCase()}.${(el.className || "").toString().slice(0, 28)} y=${y.toFixed(0)} h=${r.height.toFixed(0)} "${(el.textContent || "").trim().slice(0, 40)}"`
        );
      }
    });
    return { btnY, ua: navigator.userAgent.slice(0, 40), vw: innerWidth, vh: innerHeight, rows };
  });

  console.log("PROBE_BTN_Y=" + dump.btnY);
  console.log("PROBE_VIEWPORT=" + dump.vw + "x" + dump.vh);
  dump.rows.forEach((r) => console.log("PROBE_ROW " + r));
});
