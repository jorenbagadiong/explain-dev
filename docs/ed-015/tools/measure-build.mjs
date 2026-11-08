// Build-output comparison only; compression estimates are not network transfer.
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
const phase = process.argv[2];
if (!["baseline", "prototype", "after"].includes(phase)) throw new Error("Expected baseline, prototype, or after");
const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? walk(`${dir}/${entry.name}`) : [`${dir}/${entry.name}`]);
const sizes = (path) => { const data = readFileSync(path); return { raw: data.length, gzipEstimate: gzipSync(data).length }; };
const assets = walk(".next/static");
const manifest = JSON.parse(readFileSync("docs/ed-013/curriculum-manifest.json", "utf8"));
const routes = ["/", "/frontend", "/frontend/react", ...manifest.topics.map((topic) => topic.route)];
const report = {
  scope: "Local production files. Node gzip estimates; not browser transfer or field performance.",
  js: assets.filter((file) => file.endsWith(".js")).map((file) => ({ file, ...sizes(file) })),
  css: assets.filter((file) => file.endsWith(".css")).map((file) => ({ file, ...sizes(file) })),
  routes: routes.map((route) => {
    const file = `.next/server/app${route === "/" ? "/index" : route}.html`;
    const html = readFileSync(file, "utf8");
    const scripts = [...new Set([...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)].map((match) => match[1]))];
    return { route, html: sizes(file), referencedJsRaw: scripts.reduce((sum, url) => sum + statSync(`.next/${url.replace(/^\/_next\//, "")}`).size, 0) };
  }),
};
writeFileSync(`docs/ed-015/${phase}-build.json`, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ phase, routes: routes.length, jsRaw: report.js.reduce((sum, item) => sum + item.raw, 0), cssRaw: report.css.reduce((sum, item) => sum + item.raw, 0) }));
