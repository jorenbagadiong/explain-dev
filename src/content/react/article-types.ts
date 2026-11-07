export interface ArticleSection {
  id: string;
  heading: string;
  paragraphs: readonly string[];
}

export interface CodeExample {
  id: string;
  title: string;
  description: string;
  language: "tsx" | "typescript";
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

export interface ArticleHierarchyNode {
  id: string;
  title: string;
  description: string;
  children?: readonly ArticleHierarchyNode[];
}

// For relationships with no sequence, where numbered steps would imply an order.
export interface ArticleHierarchyVisual {
  heading: string;
  context: string;
  root: ArticleHierarchyNode;
  note: string;
}
