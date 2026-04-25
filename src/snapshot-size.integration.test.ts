import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import { measureSnapshot, summarizeSizes } from "./snapshot-size";
import { saveSnapshot } from "./snapshot";

const TEST_DIR = path.join(os.tmpdir(), "envsnap-size-integration-test");

beforeAll(async () => {
  await fs.mkdir(TEST_DIR, { recursive: true });
  process.env.ENVSNAP_DIR = TEST_DIR;
});

afterAll(async () => {
  await fs.rm(TEST_DIR, { recursive: true, force: true });
  delete process.env.ENVSNAP_DIR;
});

describe("snapshot-size integration", () => {
  it("measureSnapshot returns accurate key count and positive byte size", async () => {
    const env = { API_KEY: "secret123", DB_HOST: "localhost", PORT: "5432" };
    await saveSnapshot("size-test-snap", env);
    const result = await measureSnapshot("size-test-snap");
    expect(result.name).toBe("size-test-snap");
    expect(result.keyCount).toBe(3);
    expect(result.bytes).toBeGreaterThan(0);
  });

  it("summarizeSizes aggregates multiple snapshots", async () => {
    await saveSnapshot("size-snap-a", { FOO: "bar" });
    await saveSnapshot("size-snap-b", { BAZ: "qux", QUUX: "corge" });
    const results = await summarizeSizes(["size-snap-a", "size-snap-b"]);
    expect(results).toHaveLength(2);
    const a = results.find((r) => r.name === "size-snap-a");
    const b = results.find((r) => r.name === "size-snap-b");
    expect(a?.keyCount).toBe(1);
    expect(b?.keyCount).toBe(2);
    expect(b!.bytes).toBeGreaterThanOrEqual(a!.bytes);
  });

  it("measureSnapshot throws for non-existent snapshot", async () => {
    await expect(measureSnapshot("does-not-exist-xyz")).rejects.toThrow();
  });
});
