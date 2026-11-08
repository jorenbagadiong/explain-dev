/* eslint-disable @typescript-eslint/no-require-imports */
// ED-018 Phase 3 isolation probe (pre-implementation). Serves parent.html and preview.html on :4801 and :4802 with the
// proposed preview CSP. Usage: node server.cjs & node run.cjs <chromium executable>
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const CSP = "default-src 'none'; script-src 'self' blob:; style-src 'self' 'unsafe-inline'; img-src data: blob:; connect-src 'none'; font-src 'none'; media-src 'none'; object-src 'none'; frame-src 'none'; worker-src 'none'; manifest-src 'none'; form-action 'none'; base-uri 'none'; frame-ancestors 'self' http://localhost:4801 http://127.0.0.1:4801; sandbox allow-scripts";
const hits = [];
function serve(port) {
  http.createServer((req, res) => {
    hits.push(`${port} ${req.method} ${req.url} dest=${req.headers['sec-fetch-dest']} mode=${req.headers['sec-fetch-mode']} ref=${req.headers.referer||''}`);
    if (req.url === "/__hits") { res.setHeader("content-type", "application/json"); return res.end(JSON.stringify(hits)); }
    const file = req.url.split("?")[0] === "/" ? "/parent.html" : req.url.split("?")[0];
    const p = path.join(__dirname, file);
    if (!fs.existsSync(p)) { res.statusCode = 404; return res.end("nf"); }
    if (file.startsWith("/preview")) { res.setHeader("content-security-policy", CSP); res.setHeader("x-content-type-options", "nosniff"); res.setHeader("referrer-policy", "no-referrer"); }
    res.setHeader("content-type", file.endsWith(".js") ? "text/javascript" : "text/html");
    res.end(fs.readFileSync(p));
  }).listen(port, "127.0.0.1");
}
serve(4801); serve(4802);
