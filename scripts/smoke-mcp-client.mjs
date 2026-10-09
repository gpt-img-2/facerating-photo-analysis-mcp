import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";

const expectedTools = ["plan_face_photo_capture", "review_face_measurements", "compare_face_scan_sessions", "get_facerating_resources"];
const command = process.env.MCP_SMOKE_COMMAND || "node";
const args = process.env.MCP_SMOKE_ARGS_JSON ? JSON.parse(process.env.MCP_SMOKE_ARGS_JSON) : ["bin/facerating-photo-analysis-mcp.js"];
const client = new Client({ name: "facerating-photo-analysis-smoke", version: "1.0.0" });
const transport = new StdioClientTransport({ command, args, cwd: process.cwd() });

try {
  await client.connect(transport);
  const { tools } = await client.listTools();
  const names = tools.map((tool) => tool.name);
  assert.deepEqual([...names].sort(), [...expectedTools].sort());
  const result = await client.callTool({ name: "get_facerating_resources", arguments: { topic: "report" } });
  const first = result.content?.[0];
  assert.match(first?.type === "text" ? first.text : "", /facerating\.me/);
  console.log(`MCP smoke passed: ${names.join(", ")}`);
} finally {
  await client.close();
}
