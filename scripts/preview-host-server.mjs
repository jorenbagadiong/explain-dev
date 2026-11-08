// Serves preview-host/dist for local development on http://127.0.0.1:4100 (a different site from http://localhost:3000).
// Usage: node scripts/preview-host-server.mjs   (run `yarn build:preview-host:dev` first)
// Environment: PREVIEW_HOST_PORT, LAB_PARENT_ORIGINS (defaults to the development origins).
import path from "node:path";
import { fileURLToPath } from "node:url";

import { DEV_PARENT_ORIGINS, DEV_PREVIEW_HOST, parseOriginList } from "../preview-host/policy.mjs";
import { createPreviewHostServer } from "../preview-host/server.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = Number(process.env.PREVIEW_HOST_PORT || DEV_PREVIEW_HOST.port);
const parentOrigins = process.env.LAB_PARENT_ORIGINS ? parseOriginList(process.env.LAB_PARENT_ORIGINS, "LAB_PARENT_ORIGINS") : [...DEV_PARENT_ORIGINS];

const server = await createPreviewHostServer({ root: path.join(root, "preview-host/dist"), frameAncestors: parentOrigins });
server.listen(port, DEV_PREVIEW_HOST.hostname, () => {
  console.log(`Preview host on http://${DEV_PREVIEW_HOST.hostname}:${port} for ${parentOrigins.join(", ")}`);
});
