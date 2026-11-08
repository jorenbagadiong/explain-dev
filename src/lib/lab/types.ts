// Coding Lab challenge model. Static, serializable data only: no editor or runtime code.
// Lesson titles and routes are never stored here; they are resolved from the curriculum registry.

export type LabDifficulty = "beginner" | "intermediate" | "advanced";

export interface LabStarterFile {
  /** File name shown in the editor. The first entry is the module the preview renders. */
  name: string;
  language: "tsx";
  code: string;
}

export interface LabChallenge {
  /** Stable identifier. Never reuse or rename once published. */
  id: string;
  /** Route segment under the technology's practice path. */
  slug: string;
  technologyId: "react";
  /** ID of an existing, available lesson in `reactTopics`. */
  lessonId: string;
  gradingRevision: string;
  starterRevision: string;
  title: string;
  description: string;
  difficulty: LabDifficulty;
  instructions: readonly string[];
  /** Observable outcomes the learner should reach. Shown as a checklist; supported challenges also have behavioral tests. */
  requirements: readonly string[];
  hints: readonly string[];
  starterFiles: readonly [LabStarterFile, ...LabStarterFile[]];
}
