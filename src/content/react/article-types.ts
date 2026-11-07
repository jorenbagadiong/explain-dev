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
