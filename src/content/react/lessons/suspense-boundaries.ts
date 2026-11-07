import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "C",
  sections: [
    {
      id: "a-design-decision",
      heading: "Boundaries are a design decision",
      paragraphs: [
        "Where you place Suspense boundaries decides what people see while a page loads. It is as much a design decision as a technical one, because each boundary answers: which parts of this page should appear together?",
        "Everything inside a boundary is one unit. If any child suspends, the whole unit shows the fallback, and then it all appears at once. That gives you control over what looks finished, and when.",
      ],
      comparison: [
        {
          id: "too-few",
          title: "Too few boundaries",
          items: ["One slow part holds up everything.", "A big spinner replaces a whole screen.", "Fast content waits for no good reason."],
        },
        {
          id: "too-many",
          title: "Too many boundaries",
          items: ["Many spinners, popping in separately.", "The page keeps rearranging.", "People cannot tell when it has finished."],
        },
      ],
    },
    {
      id: "coherent-units",
      heading: "Grouping by what makes sense together",
      paragraphs: [
        "Ask what a person is trying to do. A profile’s name and picture belong together, while a slow activity feed can arrive later. Content that is meaningless without its neighbor should share a boundary, and independent sections can have their own.",
      ],
      visual: {
        heading: "A page’s loading sequence",
        context: "Indentation shows boundaries nested inside each other.",
        root: {
          id: "shell",
          title: "Page shell",
          description: "The header and navigation are usable straight away.",
          children: [
            {
              id: "main",
              title: "Suspense: profile",
              description: "The name and photo appear together.",
              children: [
                { id: "feed", title: "Suspense: activity feed", description: "Shows a skeleton until its slower data arrives." },
                { id: "suggestions", title: "Suspense: suggestions", description: "Optional, so it can arrive last without blocking anything." },
              ],
            },
          ],
        },
        note: "React throttles reveals to at most once every 300 ms, so boundaries that become ready close together appear together.",
      },
      examples: [
        {
          id: "nested-structure",
          classification: "client",
          title: "Boundaries matching what the user needs",
          language: "tsx",
          code: `"use client";

import { Suspense, use } from "react";

function ProfileHeader({ profile }: { profile: Promise<{ name: string }> }) {
  return <h1>{use(profile).name}</h1>;
}

function ActivityFeed({ activity }: { activity: Promise<readonly string[]> }) {
  return (
    <ul>
      {use(activity).map(item => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export default function ProfilePage({ profile, activity }: { profile: Promise<{ name: string }>; activity: Promise<readonly string[]> }) {
  return (
    <Suspense fallback={<p>Loading profile…</p>}>
      <ProfileHeader profile={profile} />
      <Suspense fallback={<p>Loading activity…</p>}>
        <ActivityFeed activity={activity} />
      </Suspense>
    </Suspense>
  );
}`,
          description: "The profile appears first, because the feed has its own boundary. The Promises are created outside this component, so they stay stable when React retries.",
        },
      ],
    },
    {
      id: "fallbacks",
      heading: "Designing good fallbacks",
      paragraphs: [
        "A good fallback is lightweight, and it looks roughly like what is coming. A skeleton of the right size reduces layout shift, because surrounding content does not jump when the real thing arrives. A generic spinner tells people less about what to expect.",
        "Fallbacks need to be accessible as well. Include text that states what is loading, since a purely decorative skeleton conveys nothing to a screen reader.",
      ],
      examples: [
        {
          id: "skeleton-fallback",
          classification: "complete",
          title: "A fallback that holds its space",
          language: "tsx",
          code: `export default function ActivitySkeleton() {
  return (
    <div role="status" style={{ minHeight: 320 }}>
      <p>Loading activity…</p>
    </div>
  );
}`,
          description: "The minimum height matches the content that is coming, which keeps the page from jumping, and the text states what is happening.",
        },
      ],
    },
    {
      id: "navigation",
      heading: "Boundaries during navigation",
      paragraphs: [
        "Already visible content that suspends again is replaced by its fallback, which feels like going backward. A Transition prevents this, keeping the current content on screen while the new content loads. New boundaries inside the updated content still show their own fallbacks right away.",
        "When navigating to different content, such as another user’s profile, you may want the fallback, rather than old data under a new heading. A key on the boundary tells React that this is new content.",
      ],
      examples: [
        {
          id: "key-reset",
          classification: "snippet",
          title: "Showing a fallback for new content",
          language: "tsx",
          code: `<Suspense key={user.id} fallback={<p>Loading profile…</p>}>
  <Bio bioPromise={user.bioPromise} />
</Suspense>`,
          typecheckContext: { before: `import { Suspense, type ReactNode } from "react";\ndeclare const user: { id: string; bioPromise: Promise<string> };\ndeclare function Bio(props: { bioPromise: Promise<string> }): ReactNode;\nexport const element = (`, after: ");" },
          description: "A different key is treated as a new boundary, so this person’s data does not appear to belong to the previous one.",
        },
      ],
    },
    {
      id: "pairing-errors",
      heading: "Pair boundaries with error handling",
      paragraphs: [
        "Loading and failure tend to happen in the same places, so think about them together. A rejected Promise skips the fallback and goes to the nearest Error Boundary, so an Error Boundary near each independent Suspense boundary keeps one failed section from taking down the page.",
      ],
    },
  ],
  mistakes: [
    {
      id: "boundary-every-component",
      heading: "Wrapping every component",
      problem: "A boundary per component feels thorough, but the page then fills with separate spinners that resolve at random, and the layout keeps moving. People can no longer tell what is finished.",
      correction: "Group content into a few meaningful units, and let related parts appear together.",
    },
    {
      id: "single-root-boundary",
      heading: "Using only one boundary at the top",
      problem: "A single boundary means the slowest piece of data decides when the whole page appears. Fast, useful content is held back behind one fallback, for as long as that takes.",
      correction: "Add a nested boundary around slow, non-essential parts.",
    },
    {
      id: "spinner-jump",
      heading: "Using fallbacks that do not match the content",
      problem: "A small spinner replaced by a tall list shifts everything below it when it arrives. Someone about to click something may hit the wrong thing, since it moved as they did.",
      correction: "Use a skeleton with roughly the content’s size and shape.",
    },
    {
      id: "stale-other-user",
      heading: "Showing old data during a change of subject",
      problem: "During a Transition, the old content stays visible. If the heading changes while a previous person’s details remain on screen, people may read one person’s data as if it belongs to another.",
      correction: "Key the boundary by the new subject, or indicate clearly that the old content is stale.",
    },
    {
      id: "no-error-handling",
      heading: "Handling loading but not failure",
      problem: "A Suspense boundary offers no help with a rejected Promise. With no Error Boundary nearby, a single failed feed can take out much more of the page than it needs to.",
      correction: "Place an Error Boundary alongside each independent boundary.",
    },
  ],
  interview: [
    {
      id: "sb-how",
      question: "How do you decide where to place Suspense boundaries?",
      answer: "By asking what should appear together from the user’s point of view. Related content shares a boundary, and slow, optional sections get their own. The aim is a coherent loading sequence, rather than one spinner per component or a single one for the page.",
    },
    {
      id: "sb-too-many",
      question: "What goes wrong with too many boundaries?",
      answer: "Many spinners resolve at different times, so the layout keeps shifting, and people cannot tell when the page is ready. It looks unfinished for longer. React throttles reveals, which helps a little, but the design should still group related content.",
    },
    {
      id: "sb-fallback",
      question: "What makes a good fallback?",
      answer: "It is lightweight, close to the size and shape of the content, and clear about what is loading, including for assistive technology. A well-sized skeleton reduces layout shift, while a generic spinner gives less information and can cause jumps.",
    },
    {
      id: "sb-nav",
      question: "How do boundaries behave during navigation?",
      answer: "Without a Transition, visible content that suspends is replaced by a fallback. Inside a Transition, it stays visible until new content is ready, though new boundaries still show their own fallbacks. A key on the boundary forces a fallback for a truly different subject.",
    },
    {
      id: "sb-with-errors",
      question: "How should Suspense and Error Boundaries be arranged?",
      answer: "Usually together around each independent section, so that one has both a loading and a failure state. A rejected Promise bypasses the fallback and goes to the nearest Error Boundary, so without one, a failure can spread to a larger area.",
    },
    {
      id: "sb-streaming",
      question: "How do boundaries affect streaming?",
      answer: "They define the chunks. The shell goes first with its fallbacks, and each boundary’s content follows when it is ready. So placing a boundary around slow data lets the rest of the page reach the user sooner, while critical content should stay in the shell.",
    },
  ],
  takeaways: [
    "Boundaries decide what appears together, so design them.",
    "Group by what makes sense to the user.",
    "Use fallbacks that hold their content’s shape, and state what is loading.",
    "Use Transitions and keys to control what happens during navigation.",
  ],
  quickReview: {
    definition: "Designing Suspense boundaries means choosing which parts of a screen load together, and what people see in the meantime.",
    keyPoints: [
      "Everything inside one boundary appears at once.",
      "Nesting creates a sequence.",
      "Transitions keep visible content on screen.",
      "A key on a boundary forces a fresh fallback.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "snippet",
      title: "A nested sequence",
      language: "tsx",
      code: `<Suspense fallback={<PageSkeleton />}>
  <Header />
  <Suspense fallback={<FeedSkeleton />}>
    <Feed />
  </Suspense>
</Suspense>`,
      typecheckContext: { before: `import { Suspense, type ReactNode } from "react";\ndeclare function PageSkeleton(): ReactNode;\ndeclare function FeedSkeleton(): ReactNode;\ndeclare function Header(): ReactNode;\ndeclare function Feed(): ReactNode;\nexport const element = (`, after: ");" },
      description: "The header appears first, and the feed follows when it is ready.",
    },
    commonMistakes: [
      "Giving every component its own boundary.",
      "Letting one slow part block the page.",
      "Fallbacks that shift the layout.",
    ],
    interviewTrap: "“Is more Suspense better for performance?” No. Boundaries shape what users see. Too many make a page feel less finished.",
    takeaway: "Design the loading experience as deliberately as the loaded one.",
  },
  sources: [
    { label: "Suspense reference", href: "https://react.dev/reference/react/Suspense" },
    { label: "use reference", href: "https://react.dev/reference/react/use" },
    { label: "useTransition reference", href: "https://react.dev/reference/react/useTransition" },
  ],
};
