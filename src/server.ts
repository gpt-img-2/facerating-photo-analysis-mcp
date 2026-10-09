import { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";
import { loadConfig } from "./config.js";
import { compareFaceScanSessions, getFaceRatingResources, planFacePhotoCapture, reviewFaceMeasurements } from "./toolkit.js";

const annotations = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };
const text = (value: unknown) => ({ content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }] });
const instructions = `FaceRating Photo Analysis MCP is deterministic and read-only. It prepares consenting adults for repeatable photo capture, organizes user-supplied measurements, compares supplied scan sessions, and returns canonical public resources. It does not inspect images, identify people, infer sensitive traits, score attractiveness, provide medical advice, access accounts, charge payments, consume credits, or submit reports.`;

export function createServer() {
  const config = loadConfig();
  const server = new McpServer({ name: "facerating-photo-analysis-mcp", version: "1.0.0" }, { instructions });

  server.registerTool("plan_face_photo_capture", {
    title: "Plan a repeatable face photo capture",
    description: "Check consent, adult use, pose, lighting, visibility, and camera setup before a photo-based measurement.",
    inputSchema: z.object({
      subjectIsAdult: z.boolean(), permissionConfirmed: z.boolean(), frontFacing: z.boolean(), neutralExpression: z.boolean(),
      evenLighting: z.boolean(), faceUnobstructed: z.boolean(), cameraAtEyeLevel: z.boolean(), comparisonGoal: z.string().max(1000).optional(),
    }), annotations,
  }, async (params) => text(planFacePhotoCapture(params)));

  server.registerTool("review_face_measurements", {
    title: "Review supplied face measurements",
    description: "Organize user-supplied values with neutral interpretation rules and explicit safety limits.",
    inputSchema: z.object({
      measurements: z.array(z.object({ name: z.string().max(200), value: z.string().max(500), context: z.string().max(1000).optional() })).min(1).max(50),
      photoConditions: z.array(z.string().max(500)).max(30).optional(),
      intendedUse: z.enum(["personal-reference", "style-guidance", "photo-comparison", "other"]),
      medicalOrIdentityUse: z.boolean(),
    }), annotations,
  }, async (params) => text(reviewFaceMeasurements(params)));

  server.registerTool("compare_face_scan_sessions", {
    title: "Compare supplied face scan sessions",
    description: "Calculate score deltas only when the user confirms comparable capture conditions.",
    inputSchema: z.object({
      sessions: z.array(z.object({ label: z.string().max(200), score: z.number().finite(), setupNotes: z.string().max(1000).optional() })).min(2).max(30),
      comparableSetup: z.boolean(),
    }), annotations,
  }, async (params) => text(compareFaceScanSessions(params)));

  server.registerTool("get_facerating_resources", {
    title: "Get canonical FaceRating resources",
    description: "Return canonical public tool, report, guidance, and policy pages without fetching external content.",
    inputSchema: z.object({ topic: z.enum(["all", "tools", "report", "guidance", "policy"]).default("all") }), annotations,
  }, async ({ topic }) => text({ topic, resources: getFaceRatingResources(config.appBaseUrl, topic), rawSkillUrl: `${config.appBaseUrl}/skills/facerating-photo-analysis-guide/SKILL.md` }));

  return server;
}
