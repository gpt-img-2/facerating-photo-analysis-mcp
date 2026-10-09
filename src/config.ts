export type FaceRatingConfig = { appBaseUrl: string };

function parseBaseUrl(value: string | undefined) {
  const candidate = (value || "https://facerating.me").trim().replace(/\/+$/, "");
  const url = new URL(candidate);
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("FaceRating base URL must use http or https.");
  }
  return url.toString().replace(/\/+$/, "");
}

export function loadConfig(): FaceRatingConfig {
  return { appBaseUrl: parseBaseUrl(process.env.FACERATING_BASE_URL) };
}
