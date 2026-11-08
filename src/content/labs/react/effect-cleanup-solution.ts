import type { ReferenceSolution } from "@/lib/lab/types";
export const effectCleanupSolution = {
  "code": "import { useEffect, useState } from \"react\";\nexport default function Ticker(){const [ticks,setTicks]=useState(0);useEffect(()=>{const id=setInterval(()=>setTicks(previous=>previous+1),1000);return ()=>clearInterval(id)},[]);return <p>Ticks: {ticks}</p>}",
  "explanation": [
    {
      "title": "Set up after mounting",
      "body": "useEffect registers one interval after the component commits. An empty dependency list keeps registration tied to this mount."
    },
    {
      "title": "Update from current state",
      "body": "The functional setter receives the latest value, so repeated ticks do not reuse a stale count captured on the first render."
    },
    {
      "title": "Release the resource",
      "body": "The returned cleanup calls clearInterval with the handle created by this effect. Removing DOM alone does not stop a timer."
    },
    {
      "title": "Keep remounts independent",
      "body": "Each new mount starts with fresh state and one interval. Its cleanup prevents callbacks and registrations from accumulating."
    }
  ]
} satisfies ReferenceSolution;
