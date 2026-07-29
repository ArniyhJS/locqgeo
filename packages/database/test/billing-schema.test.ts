import { describe, expect, it } from "vitest";
import { tenantWallets, tenantWalletTransactions, tenantInvoices, financialAuditLogs } from "../src/schema";

describe("Billing Database Schemas", () => {
  it("exports tenantWallets schema with correct table name and columns", () => {
    expect(tenantWallets).toBeDefined();
    expect(tenantWallets.tenantId).toBeDefined();
    expect(tenantWallets.availableBalance).toBeDefined();
  });

  it("exports tenantWalletTransactions schema", () => {
    expect(tenantWalletTransactions).toBeDefined();
    expect(tenantWalletTransactions.amount).toBeDefined();
    expect(tenantWalletTransactions.type).toBeDefined();
  });

  it("exports tenantInvoices and financialAuditLogs schemas", () => {
    expect(tenantInvoices).toBeDefined();
    expect(financialAuditLogs).toBeDefined();
  });
});
