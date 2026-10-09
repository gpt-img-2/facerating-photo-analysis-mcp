#!/usr/bin/env node

import("../dist/index.js").catch((error) => {
  console.error("FaceRating Photo Analysis MCP failed to start:", error);
  process.exit(1);
});
