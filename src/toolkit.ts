export type ResourceTopic = "all" | "tools" | "report" | "guidance" | "policy";
export type Measurement = { name: string; value: string; context?: string | undefined };

function clean(value: string | undefined) {
  return (value || "").replace(/\s+/g, " ").trim();
}

function cleanList(values: string[] | undefined) {
  return [...new Set((values || []).map(clean).filter(Boolean))];
}

export function planFacePhotoCapture(params: {
  subjectIsAdult: boolean;
  permissionConfirmed: boolean;
  frontFacing: boolean;
  neutralExpression: boolean;
  evenLighting: boolean;
  faceUnobstructed: boolean;
  cameraAtEyeLevel: boolean;
  comparisonGoal?: string | undefined;
}) {
  const blockers = [
    !params.subjectIsAdult ? "This workflow is intended for consenting adults." : "",
    !params.permissionConfirmed ? "Confirm that the subject permitted use of the photo." : "",
    !params.frontFacing ? "Use a front-facing photo to reduce perspective distortion." : "",
    !params.faceUnobstructed ? "Keep the eyes, brows, cheeks, jaw, and chin visible." : "",
  ].filter(Boolean);
  const improvements = [
    !params.neutralExpression ? "Use a relaxed, neutral expression for repeatable measurements." : "",
    !params.evenLighting ? "Use soft, even frontal lighting without strong side shadows." : "",
    !params.cameraAtEyeLevel ? "Place the camera at eye level and avoid wide-angle close-ups." : "",
  ].filter(Boolean);
  return {
    ready: blockers.length === 0,
    blockers,
    improvements,
    comparisonGoal: clean(params.comparisonGoal) || null,
    captureChecklist: [
      "Use the same camera, distance, lighting, expression, and framing for comparisons.",
      "Avoid beauty filters, portrait distortion, and cropped facial landmarks.",
      "Treat the result as a measurement of this photo, not a judgment of the person.",
    ],
  };
}

export function reviewFaceMeasurements(params: {
  measurements: Measurement[];
  photoConditions?: string[] | undefined;
  intendedUse: "personal-reference" | "style-guidance" | "photo-comparison" | "other";
  medicalOrIdentityUse: boolean;
}) {
  const measurements = params.measurements
    .map((item) => ({ name: clean(item.name), value: clean(item.value), context: clean(item.context) || null }))
    .filter((item) => item.name && item.value);
  const blockers = [
    measurements.length === 0 ? "Provide at least one named measurement and value." : "",
    params.medicalOrIdentityUse ? "Do not use photo-based face measurements for diagnosis, health claims, identity verification, or access decisions." : "",
  ].filter(Boolean);
  return {
    ready: blockers.length === 0,
    blockers,
    intendedUse: params.intendedUse,
    measurements,
    photoConditions: cleanList(params.photoConditions),
    interpretationRules: [
      "Describe visible geometry and measurement context without claiming objective beauty or personal worth.",
      "Do not infer identity, ethnicity, health, personality, emotion, or other sensitive traits.",
      "Explain that pose, expression, lighting, camera distance, and lens perspective can change results.",
      "Prefer concrete style or retake suggestions over ranking a person against others.",
    ],
    boundary: "This review organizes user-supplied measurements only; it does not inspect a photo, score a face, diagnose a condition, or verify identity.",
  };
}

export function compareFaceScanSessions(params: {
  sessions: Array<{ label: string; score: number; setupNotes?: string | undefined }>;
  comparableSetup: boolean;
}) {
  const sessions = params.sessions.map((item) => ({
    label: clean(item.label),
    score: item.score,
    setupNotes: clean(item.setupNotes) || null,
  }));
  const labels = sessions.map((item) => item.label).filter(Boolean);
  const blockers = [
    sessions.length < 2 ? "Provide at least two sessions." : "",
    labels.length !== sessions.length ? "Every session needs a label." : "",
    new Set(labels).size !== labels.length ? "Session labels must be unique." : "",
    !params.comparableSetup ? "Do not interpret score changes until capture conditions are comparable." : "",
  ].filter(Boolean);
  const baseline = sessions[0]?.score ?? 0;
  return {
    ready: blockers.length === 0,
    blockers,
    sessions: sessions.map((item) => ({ ...item, changeFromFirst: Number((item.score - baseline).toFixed(2)) })),
    interpretation: "Deltas describe supplied scores from comparable photos; they do not prove a physical change or a change in attractiveness.",
  };
}

const resources = [
  { topic: "tools", title: "Face analysis tools", path: "/tools", purpose: "Browse public on-device measurement tools." },
  { topic: "tools", title: "Face symmetry test", path: "/tools/symmetry", purpose: "Review the public symmetry methodology and limits." },
  { topic: "tools", title: "Facial ratios calculator", path: "/tools/facial-ratios", purpose: "Review visible proportion measurements." },
  { topic: "guidance", title: "Face shape detector", path: "/tools/face-shape", purpose: "Review photo-based face-shape and style guidance." },
  { topic: "report", title: "Complete report", path: "/tools/full-analysis", purpose: "Review the complete report scope." },
  { topic: "report", title: "Sample report", path: "/sample-report", purpose: "Inspect a public example before purchase." },
  { topic: "policy", title: "About", path: "/about", purpose: "Read product context and limitations." },
  { topic: "policy", title: "Privacy", path: "/privacy", purpose: "Review current data-handling terms." },
  { topic: "policy", title: "Terms", path: "/terms", purpose: "Review current usage terms." },
] as const;

export function getFaceRatingResources(appBaseUrl: string, topic: ResourceTopic) {
  return resources
    .filter((item) => topic === "all" || item.topic === topic)
    .map((item) => ({ ...item, url: `${appBaseUrl}${item.path}` }));
}
