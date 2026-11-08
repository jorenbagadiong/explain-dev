import { CLEANUP_TESTS } from "@/lib/lab/grading";
import type { LabChallenge } from "@/lib/lab/types";
export const effectCleanupChallenge = {
  "id": "react-effect-cleanup",
  "slug": "effect-cleanup",
  "technologyId": "react",
  "lessonId": "use-effect",
  "revision": "v1",
  "gradingRevision": "effect-cleanup-behavior-v1",
  "starterRevision": "effect-cleanup-starter-v1",
  "title": "useEffect Cleanup",
  "description": "Create an interval that ticks while mounted and is released when its component unmounts.",
  "concept": "Effect lifecycle and cleanup",
  "difficulty": "intermediate",
  "objectives": [
    "Synchronize a component with an interval",
    "Update state from each timer callback",
    "Release external resources on unmount"
  ],
  "instructions": [
    "Render one readable Ticks: integer display, initially Ticks: 0.",
    "On mount, register exactly one setInterval with a 1,000 ms delay; increment the displayed value once per tick. Return cleanup that cancels it on unmount.",
    "A new mount starts at zero with one fresh interval. Repeated mount/unmount cycles must not accumulate timers.",
    "Run Tests uses controlled interval time inside the sandbox and observes registrations and cancellation directly. No visible updates after unmount alone is not proof of cleanup. This exercise uses intervals, not recursive timeouts. Class lifecycle alternatives are accepted."
  ],
  "hints": [
    "An effect can register work with a system outside React and return a cleanup function.",
    "Keep the interval handle created by this mount so cleanup can cancel the same registration.",
    "Use a functional state update in the interval callback to avoid capturing an old tick count; clean up the handle when the effect ends."
  ],
  "starterFiles": [
    {
      "name": "App.tsx",
      "language": "tsx",
      "code": "import { useEffect, useState } from \"react\";\nexport default function App(){\n  // TODO: create a 1,000 ms interval, update state on each tick, and release it on unmount.\n  const ticks = 0;\n  return <p>Ticks: {ticks}</p>;\n}"
    }
  ],
  requirements: CLEANUP_TESTS.map(test => test.title)
} as const satisfies LabChallenge;
