import assert from "node:assert/strict";
import test from "node:test";
import { compareFaceScanSessions, getFaceRatingResources, planFacePhotoCapture, reviewFaceMeasurements } from "../src/toolkit.js";

test("blocks capture without adult consent", () => {
  const result = planFacePhotoCapture({ subjectIsAdult: false, permissionConfirmed: false, frontFacing: true, neutralExpression: true, evenLighting: true, faceUnobstructed: true, cameraAtEyeLevel: true });
  assert.equal(result.ready, false);
  assert.equal(result.blockers.length, 2);
});

test("accepts a controlled capture setup", () => {
  const result = planFacePhotoCapture({ subjectIsAdult: true, permissionConfirmed: true, frontFacing: true, neutralExpression: true, evenLighting: true, faceUnobstructed: true, cameraAtEyeLevel: true });
  assert.equal(result.ready, true);
});

test("blocks medical or identity use", () => {
  const result = reviewFaceMeasurements({ measurements: [{ name: "Symmetry", value: "82" }], intendedUse: "personal-reference", medicalOrIdentityUse: true });
  assert.equal(result.ready, false);
});

test("requires comparable scan conditions", () => {
  const result = compareFaceScanSessions({ sessions: [{ label: "A", score: 70 }, { label: "B", score: 75 }], comparableSetup: false });
  assert.equal(result.ready, false);
  assert.equal(result.sessions[1]?.changeFromFirst, 5);
});

test("resources use configured origin", () => {
  const result = getFaceRatingResources("https://facerating.me", "report");
  assert.equal(result.length, 2);
  assert.match(result[0]?.url || "", /^https:\/\/facerating\.me\//);
});
