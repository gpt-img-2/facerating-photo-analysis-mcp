# FaceRating Photo Analysis MCP

Deterministic, read-only MCP tools and an OpenClaw Skill for preparing a repeatable face photo, reviewing user-supplied measurements, comparing controlled scan sessions, and discovering canonical FaceRating resources.

The server does not inspect images, identify people, infer sensitive traits, score attractiveness, provide medical advice, access accounts, consume credits, charge payments, or submit reports.

## Install

```bash
npx -y github:gpt-img-2/facerating-photo-analysis-mcp
```

## Tools

- `plan_face_photo_capture`
- `review_face_measurements`
- `compare_face_scan_sessions`
- `get_facerating_resources`

## OpenClaw

```bash
openclaw mcp add facerating --command npx --arg -y --arg github:gpt-img-2/facerating-photo-analysis-mcp
```

The Skill source is in [`openclaw/facerating-photo-analysis-guide`](openclaw/facerating-photo-analysis-guide/SKILL.md).

## Development

```bash
pnpm install
pnpm validate
```

Canonical product resources: [facerating.me/llms.txt](https://facerating.me/llms.txt)
