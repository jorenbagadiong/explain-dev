import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { gzipSync, brotliCompressSync } from "node:zlib";
import path from "node:path";
import { articles, manifest, textEntries } from "./inventory.mjs";

function walk(dir) { return readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]); }
const jsFiles = walk(".next/static").filter(file => file.endsWith(".js"));
const js = new Map(jsFiles.map(file => [file, readFileSync(file, "utf8")]));
const sizeCache = new Map();
const sizes = file => {
  if (!sizeCache.has(file)) {
    const data = readFileSync(file);
    sizeCache.set(file, { raw: data.length, gzip: gzipSync(data).length, brotli: brotliCompressSync(data).length });
  }
  return sizeCache.get(file);
};
const routes = manifest.topics.map(topic => {
  const htmlPath = `.next/server/app${topic.route}.html`;
  const html = readFileSync(htmlPath, "utf8");
  const scripts = [...new Set([...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)].map(match => match[1]))];
  const assets = scripts.map(url => ({ url, ...sizes(`.next/${url.replace(/^\/_next\//, "")}`) }));
  const totals = assets.reduce((total, asset) => ({ raw: total.raw + asset.raw, gzip: total.gzip + asset.gzip, brotli: total.brotli + asset.brotli }), { raw: 0, gzip: 0, brotli: 0 });
  return { topicId: topic.id, route: topic.route, html: sizes(htmlPath), scripts, totals };
});
const htmlSizes = routes.map(route => route.html.raw).sort((a,b) => a-b);
const allShared = routes[0].scripts.filter(url => routes.every(route => route.scripts.includes(url)));
const prose = articles.flatMap(({ topic, article }) => textEntries(article).filter(entry => entry.location.includes("paragraphs") && entry.text.length > 80).map(entry => ({ topicId: topic.id, text: entry.text })));
const leaks = prose.flatMap(entry => [...js].filter(([, source]) => source.includes(entry.text) || source.includes(JSON.stringify(entry.text).slice(1,-1))).map(([file]) => ({ topicId: entry.topicId, file })));
const report = {
  measurement: "Build files and script references, not network transfer, parsing, or execution. Compression uses Node defaults, not deployment settings.",
  routeCount: routes.length, emittedJsFiles: jsFiles.length, emittedJsBytes: jsFiles.reduce((sum,file) => sum + statSync(file).size, 0),
  htmlRaw: { min: htmlSizes[0], median: htmlSizes[Math.floor(htmlSizes.length/2)], max: htmlSizes.at(-1) },
  commonScripts: allShared, sampledParagraphs: prose.length, contentLeaks: leaks,
  assets: Object.fromEntries([...new Set(routes.flatMap(route => route.scripts))].map(url => [url, sizes(`.next/${url.replace(/^\/_next\//, "")}`)])),
  prerenderCount: Object.keys(JSON.parse(readFileSync(".next/prerender-manifest.json", "utf8")).routes).length,
  routes,
};
writeFileSync("docs/ed-014/build-measurements.json", JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify({ ...report, routes: { first: routes[0], largest: routes.find(route => route.html.raw === htmlSizes.at(-1)) } }, null, 2));
