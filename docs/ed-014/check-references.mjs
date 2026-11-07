import { writeFileSync } from "node:fs";
import { summary } from "./inventory.mjs";

const results = [];
const queue = [...summary.sourceUrls];
await Promise.all(Array.from({ length: 6 }, async () => {
  while (queue.length) {
    const url = queue.shift();
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(15000), redirect: "follow" });
      results.push({ url, status: response.status, finalUrl: response.url, contentType: response.headers.get("content-type") });
      await response.body?.cancel();
    } catch (error) {
      results.push({ url, error: error.message, cause: error.cause?.code });
    }
  }
}));
results.sort((a,b) => a.url.localeCompare(b.url));
writeFileSync("docs/ed-014/reference-results.json", JSON.stringify(results, null, 2) + "\n");
console.log(JSON.stringify({ checked: results.length, resolved: results.filter(result => result.status === 200).length, unresolved: results.filter(result => result.status !== 200) }, null, 2));
process.exitCode = results.some(result => result.status !== 200) ? 1 : 0;
