import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { reactTopics } from "@/lib/learning/react-topics";
import { challengeHref, getChallengeLesson, getLabChallengeContext, labChallenges, PRACTICE_HREF } from "./challenges";
import { compileLearnerModule } from "./compiler";

describe("Coding Lab challenge registry", () => {
  it("has unique, stable IDs and slugs", () => {
    expect(new Set(labChallenges.map((challenge) => challenge.id)).size).toBe(labChallenges.length);
    expect(new Set(labChallenges.map((challenge) => challengeHref(challenge))).size).toBe(labChallenges.length);
    for (const challenge of labChallenges) {
      expect(challenge.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(challenge.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it.each(labChallenges.map((challenge) => [challenge.id, challenge] as const))("%s references an existing, available lesson without duplicating its title or route", (_id, challenge) => {
    const lesson = getChallengeLesson(challenge);
    expect(lesson).toBeDefined();
    expect(reactTopics.find((topic) => topic.id === challenge.lessonId)?.status).toBe("available");
    const serialized = JSON.stringify(challenge);
    expect(serialized).not.toContain(lesson!.href);
    expect(Object.keys(challenge)).not.toEqual(expect.arrayContaining(["href"]));
    expect(getLabChallengeContext(challenge.id)?.lesson).toBe(lesson);
  });

  it.each(labChallenges.map((challenge) => [challenge.id, challenge] as const))("%s has a route file and compiling starter files with TODOs", (_id, challenge) => {
    const href = challengeHref(challenge);
    expect(href.startsWith(`${PRACTICE_HREF}/`)).toBe(true);
    expect(existsSync(path.join(process.cwd(), "src/app", href, "page.tsx"))).toBe(true);
    for (const file of challenge.starterFiles) {
      expect(file.name).toMatch(/^[\w-]+\.tsx$/);
      expect(file.code).toContain("TODO");
      expect(compileLearnerModule(file).ok).toBe(true);
    }
    expect(challenge.instructions.length).toBeGreaterThan(0);
    expect(challenge.requirements.length).toBeGreaterThan(0);
  });

  it("defines the useState counter challenge from ED-018", () => {
    const context = getLabChallengeContext("react-use-state-counter")!;
    expect(context.href).toBe("/practice/react/use-state-counter");
    expect(context.lesson.id).toBe("use-state");
    expect(context.group.id).toBe("hooks");
    expect(context.challenge.difficulty).toBe("beginner");
    expect(context.challenge.requirements).toEqual([
      "The counter initially displays zero",
      "Increment increases the count by one",
      "Repeated increments update on every click",
      "Decrement decreases the count by one",
      "Reset returns a changed count to zero",
      "The counter supports negative values",
      "Combined increments, decrements and resets stay correct",
    ]);
    const starter = context.challenge.starterFiles[0].code;
    expect(starter).toContain("Count: {count}");
    expect(starter).toContain("const count = 0;");
    for (const label of ["Increment", "Decrement", "Reset"]) expect(starter).toContain(`>${label}</button>`);
  });

  it("returns nothing for unknown challenges", () => {
    expect(getLabChallengeContext("missing")).toBeUndefined();
  });
});
