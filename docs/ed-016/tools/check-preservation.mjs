import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const baseline = JSON.parse(readFileSync("docs/ed-016/ed-015-preservation.json", "utf8"));
const changed = Object.entries(baseline).filter(([file, expected]) => createHash("sha256").update(readFileSync(file)).digest("hex") !== expected).map(([file]) => file);
if (changed.length) { console.error("Pre-existing ED-015 files changed:", changed); process.exit(1); }
console.log(`All ${Object.keys(baseline).length} pre-existing ED-015 files are byte-identical.`);
