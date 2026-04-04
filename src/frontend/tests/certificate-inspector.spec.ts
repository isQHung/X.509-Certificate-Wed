import { test, expect } from "@playwright/test";
import path from "path";

const invalidFilePath = path.join(__dirname, "fixtures", "invalid-file.txt");
const validCertPath = path.join(__dirname, "fixtures", "valid-cert.pem");

test.describe("Certificate Inspector", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/user/certificate-inspector");
  });

  test("should render certificate inspector page", async ({ page }) => {
    await expect(page.locator("text=Kiểm tra chứng chỉ")).toBeVisible();
    await expect(page.locator("text=Tải lên chứng chỉ")).toBeVisible();
    await expect(page.locator('input[type="file"]')).toHaveCount(1);
  });

  test("should show client-side validation error for invalid file type", async ({
    page,
  }) => {
    page.on("dialog", async (dialog) => {
      expect(dialog.message()).toContain("Chỉ chấp nhận các định dạng");
      await dialog.dismiss();
    });

    await page.setInputFiles('input[type="file"]', invalidFilePath);
    await expect(page.locator("text=✓ Tệp được chọn")).not.toBeVisible();
  });

  test("should successfully inspect a valid certificate", async ({ page }) => {
    // Upload valid certificate
    await page.setInputFiles('input[type="file"]', validCertPath);

    // Wait for processing
    await expect(page.locator("text=Đang xử lý chứng chỉ...")).toBeVisible();

    // Check if certificate info is displayed
    await expect(page.locator("text=Số sê-ri")).toBeVisible();
    await expect(page.locator("text=Chủ đề (Subject)")).toBeVisible();
    await expect(page.locator("text=Nhà phát hành (Issuer)")).toBeVisible();
    await expect(page.locator("text=✓ Chứng chỉ hợp lệ")).toBeVisible();
  });
});
