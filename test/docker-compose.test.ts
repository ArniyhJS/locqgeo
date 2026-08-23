import { describe, expect, it } from "vitest";
import fs from "fs";
import path from "path";

describe("Docker Compose Configuration", () => {
  it("contains postgis and redis service definitions", () => {
    const composePath = path.join(__dirname, "../docker-compose.yml");
    const content = fs.readFileSync(composePath, "utf-8");
    expect(content).toContain("postgis/postgis:16-3.4");
    expect(content).toContain("redis:7-alpine");
    expect(content).toContain("5433:5432");
    expect(content).toContain("6379:6379");
    expect(content).toContain("POSTGRES_USER: locqgeo");
    expect(content).toContain("POSTGRES_DB: locqgeo_dev");
  });
});
