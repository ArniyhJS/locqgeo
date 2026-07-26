export async function getOrCreateDeviceId(): Promise<string> {
  const STORAGE_KEY = "spott_verify_device_id_v1";
  const existingId = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;

  if (existingId && existingId.length >= 32) {
    return existingId;
  }

  let canvasHash = "";
  if (typeof document !== "undefined") {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (ctx) {
      canvas.width = 200;
      canvas.height = 50;
      ctx.textBaseline = "top";
      ctx.font = "14px 'Arial'";
      ctx.fillStyle = "#f60";
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = "#069";
      ctx.fillText("SpottVerify,PoL#1", 2, 15);
      canvasHash = canvas.toDataURL();
    }
  }

  const screenRes =
    typeof window !== "undefined"
      ? `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`
      : "800x600x24";
  const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "NodeJS";
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const hardwareConcurrency =
    (typeof navigator !== "undefined" && navigator.hardwareConcurrency) || 2;
  const randomEntropy =
    typeof window !== "undefined" && window.crypto?.randomUUID
      ? window.crypto.randomUUID()
      : "demo_entropy";

  const rawEntropyString = `${canvasHash}|${screenRes}|${userAgent}|${timeZone}|${hardwareConcurrency}|${randomEntropy}`;

  const encoder = new TextEncoder();
  const data = encoder.encode(rawEntropyString);
  let deviceId = "";

  if (typeof window !== "undefined" && window.crypto?.subtle) {
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    deviceId = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  } else {
    deviceId = `dev_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, deviceId);
  }

  return deviceId;
}
