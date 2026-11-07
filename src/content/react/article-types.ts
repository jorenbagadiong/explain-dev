export interface ArticleSection {
  id: string;
  heading: string;
  paragraphs: readonly string[];
}

export interface CodeExample {
  id: string;
  title: string;
  description: string;
  language: "tsx" | "typescript" | "text" | "json" | "bash";
  code: string;
}

export interface InterviewQuestion {
  id: string;
  question: string;
  answer: string;
}

export interface CommonMistake {
  id: string;
  heading: string;
  problem: string;
  correction: string;
  examples?: readonly CodeExample[];
}

export interface ArticleSource {
  label: string;
  href: string;
}

export interface ArticleQuickReview {
  definition: string;
  keyPoints: readonly string[];
  codeReminder: CodeExample;
  commonMistakes: readonly string[];
  interviewTrap: string;
  takeaway: string;
}

export interface ArticleConceptVisual {
  heading: string;
  context: string;
  steps: readonly { id: string; title: string; description: string }[];
  note: string;
}

export interface ComparisonColumn {
  id: string;
  title: string;
  items: readonly string[];
}

export interface ArticleHierarchyNode {
  id: string;
  title: string;
  description: string;
  children?: readonly ArticleHierarchyNode[];
}

// For nesting or branching, where numbered steps would imply one straight sequence.
export interface ArticleHierarchyVisual {
  heading: string;
  context: string;
  root: ArticleHierarchyNode;
  note: string;
}

// How a lesson's code block may be read and validated:
// - complete, client, server, framework: compile as shown under strict TypeScript.
// - snippet: a partial fragment, compiled inside its typecheckContext.
// - external: needs a package this project does not install, so it cannot compile here.
// - pseudocode: conceptual only, never presented as executable.
export type LessonExampleClassification = "complete" | "client" | "server" | "framework" | "snippet" | "external" | "pseudocode";

export interface LessonExample extends CodeExample {
  classification: LessonExampleClassification;
  typecheckContext?: { before?: string; after?: string };
}

export interface LessonMistake extends Omit<CommonMistake, "examples"> {
  examples?: readonly LessonExample[];
}

export interface LessonSection {
  id: string;
  heading: string;
  paragraphs: readonly string[];
  comparison?: readonly ComparisonColumn[];
  list?: readonly string[];
  visual?: ArticleConceptVisual | ArticleHierarchyVisual;
  examples?: readonly LessonExample[];
  closing?: string;
}

// Topic identity, title, summary, group, and route stay in the React topic registry.
export interface LessonArticle {
  tier: "A" | "B" | "C";
  sections: readonly LessonSection[];
  mistakes: readonly LessonMistake[];
  interview: readonly InterviewQuestion[];
  takeaways: readonly string[];
  quickReview: Omit<ArticleQuickReview, "codeReminder"> & { codeReminder: LessonExample };
  sources: readonly ArticleSource[];
}
