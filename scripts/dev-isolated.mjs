// Local development with the dedicated preview host on a different site:
//   app      http://localhost:3000     (Next.js dev server)
//   preview  http://127.0.0.1:4100     (static preview host)
// Usage: yarn dev:isolated
import { spawn } from "node:child_process";

import { DEV_PREVIEW_ORIGIN } from "../preview-host/policy.mjs";

const run = (args, env = {}) => spawn("yarn", ["-s", ...args], { stdio: "inherit", env: { ...process.env, ...env } });
const wait = (child) => new Promise((resolve, reject) => child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${child.spawnargs.join(" ")} exited with ${code}`)))));

await wait(run(["build:lab-runtime"]));
await wait(run(["build:preview-host:dev"]));
const children = [run(["preview-host"]), run(["next", "dev"], { NEXT_PUBLIC_LAB_PREVIEW_ORIGIN: DEV_PREVIEW_ORIGIN })];
const stop = () => { for (const child of children) child.kill("SIGTERM"); };
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
for (const child of children) child.on("exit", stop);
