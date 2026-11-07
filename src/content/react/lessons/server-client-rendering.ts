import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "C",
  sections: [
    {
      id: "the-strategies",
      heading: "Where HTML gets produced",
      paragraphs: [
        "A rendering strategy answers one question: where and when is the page’s HTML produced? The answer shapes how fast content appears, how soon the page responds, and what the server costs. No single answer suits everything, and many sites mix them per route.",
      ],
      comparison: [
        {
          id: "on-server",
          title: "Server-produced",
          items: ["SSR: full HTML for each navigation.", "Static rendering: HTML generated at build time.", "Streaming SSR: HTML sent in chunks as it becomes ready."],
        },
        {
          id: "in-browser",
          title: "Browser-produced",
          items: ["CSR: JavaScript fetches data and builds the page.", "The first response is often a nearly empty shell.", "Later navigations can feel very fast."],
        },
      ],
    },
    {
      id: "tradeoffs",
      heading: "The tradeoffs",
      paragraphs: [
        "Each strategy trades off different things. First Contentful Paint measures when content becomes visible, Time to First Byte measures how soon the server responds, and Interaction to Next Paint measures how responsive the page is.",
      ],
      list: [
        "Static rendering gives fast content and a consistently low Time to First Byte, but it is impractical for very many pages or unpredictable URLs.",
        "SSR gives fast content, and suits personalized or live data, but generating pages on demand can raise Time to First Byte and compute cost.",
        "CSR means JavaScript grows with the application, which tends to hurt responsiveness, unless it is split and cached carefully.",
        "Streaming gets markup to users sooner, which helps pages with slow parts.",
      ],
    },
    {
      id: "react-apis",
      heading: "How this looks in React",
      paragraphs: [
        "React’s own APIs correspond to these strategies. createRoot starts a client-rendered app. hydrateRoot attaches React to server-produced HTML. On the server, react-dom/server provides functions such as renderToPipeableStream for Node.js and renderToReadableStream for Web Streams environments.",
        "React Router is not part of React, and neither are frameworks such as Next.js. They wrap these APIs and choose strategies per route, so you rarely call them directly in a framework.",
      ],
      examples: [
        {
          id: "client-entry",
          classification: "client",
          title: "A client-rendered entry point",
          language: "tsx",
          code: `import { createRoot } from "react-dom/client";

function App() {
  return <h1>Rendered in the browser</h1>;
}

const container = document.getElementById("root");

if (container) {
  createRoot(container).render(<App />);
}`,
          description: "With no server rendering, the HTML contains only an empty root, and this code builds the page.",
        },
        {
          id: "hydrate-entry",
          classification: "client",
          title: "A server-rendered entry point",
          language: "tsx",
          code: `import { hydrateRoot } from "react-dom/client";

function App() {
  return <h1>Rendered on the server first</h1>;
}

const container = document.getElementById("root");

if (container) {
  hydrateRoot(container, <App />);
}`,
          description: "The server already sent this heading as HTML. hydrateRoot makes it interactive, and it must produce the same output as the server did.",
        },
      ],
    },
    {
      id: "looks-ready-problem",
      heading: "When a page looks ready but is not",
      paragraphs: [
        "Server-produced HTML appears quickly, but buttons do nothing until the JavaScript has loaded and hydrated. On a slow phone, this gap can be long, and it frustrates people. The same UI is also paid for twice: as HTML, and as the JavaScript that hydrates it.",
        "So fast content is only half of the story. Reducing the JavaScript that ships, which is what Server Components are for, and streaming and hydrating progressively all narrow this gap.",
      ],
      visual: {
        heading: "What a user experiences with SSR",
        context: "This follows a first visit to a server-rendered page.",
        steps: [
          { id: "request", title: "Request", description: "The server generates HTML, which affects Time to First Byte." },
          { id: "content", title: "Content appears", description: "HTML paints, though nothing is interactive yet." },
          { id: "download", title: "JavaScript downloads and runs", description: "This gap is longest on slower devices." },
          { id: "interactive", title: "Hydration finishes", description: "Event handlers are attached, and the page responds." },
        ],
        note: "This is simplified. Streaming and selective hydration can make parts of the page interactive earlier.",
      },
    },
    {
      id: "choosing",
      heading: "Choosing a strategy",
      paragraphs: [
        "Measure your actual bottleneck first, and choose per page rather than per application. A marketing page can be static, a dashboard personalized, and a heavily interactive editor mostly client-rendered.",
      ],
      list: [
        "Pages that do not change per request: prefer static rendering.",
        "Personalized or live pages: use SSR, with streaming for slow parts.",
        "Highly interactive tools behind a login: CSR may be acceptable.",
        "Ship as little JavaScript as the page needs in every case.",
      ],
    },
  ],
  mistakes: [
    {
      id: "ssr-is-interactive",
      heading: "Assuming server-rendered pages are immediately interactive",
      problem: "Visible content looks ready, but event handlers are not attached until hydration completes. A fast-looking page can ignore taps for seconds on a mid-range phone, which standard paint metrics do not reveal.",
      correction: "Measure responsiveness too, and reduce the JavaScript the page has to hydrate.",
    },
    {
      id: "one-strategy",
      heading: "Using one strategy for the whole site",
      problem: "Rendering every page on demand spends server resources on content that never changes, while client-rendering everything delays content for all visitors. The needs of different pages rarely match.",
      correction: "Choose per route, using static rendering wherever data does not change per request.",
    },
    {
      id: "framework-as-react",
      heading: "Treating framework behavior as React behavior",
      problem: "Prerendering, routing, and caching rules come from Next.js and similar frameworks, and not from React. Code or advice written with that assumption does not transfer to a different setup.",
      correction: "Check which layer provides a feature, and read that layer’s documentation.",
    },
    {
      id: "browser-api-render",
      heading: "Using browser APIs while rendering",
      problem: "Code that reads window during rendering works in a client-only app, then throws when the same component is rendered on a server. It is often found only once the app adopts SSR.",
      correction: "Read browser APIs in Effects or handlers, and render something that matches on both sides.",
    },
    {
      id: "ignore-ttfb",
      heading: "Forgetting the cost of generating pages on demand",
      problem: "SSR can increase the time until the first byte, and a slow data source then delays the entire page. Moving work to the server does not remove it, and that cost can become visible to every visitor.",
      correction: "Cache where possible, and stream, so that slow data does not hold up the whole response.",
    },
  ],
  interview: [
    {
      id: "scr-compare",
      question: "What is the difference between CSR, SSR, and static rendering?",
      answer: "CSR builds the page in the browser with JavaScript. SSR generates HTML on the server for each request. Static rendering generates HTML at build time and serves it from a cache or CDN. Each trades off content speed, responsiveness, freshness, and server cost.",
    },
    {
      id: "scr-when",
      question: "When would you choose static rendering over SSR?",
      answer: "When a page does not change per request, since it gives fast content and consistently low response time. SSR suits personalized or live data. Static rendering becomes impractical when there are too many pages or unpredictable URLs.",
    },
    {
      id: "scr-gap",
      question: "Why can a server-rendered page look ready before it responds?",
      answer: "The HTML paints before JavaScript has downloaded and hydrated, so handlers are not attached yet. On a slower device, this gap can be long. Shipping less JavaScript, with streaming and progressive hydration, reduces it.",
    },
    {
      id: "scr-react-apis",
      question: "Which React APIs correspond to these strategies?",
      answer: "createRoot for client rendering, and hydrateRoot to attach to server HTML. On the server, renderToPipeableStream for Node.js and renderToReadableStream for Web Streams environments. Frameworks usually wrap these, so most developers do not call them directly.",
    },
    {
      id: "scr-rsc-relation",
      question: "How do Server Components relate to these strategies?",
      answer: "They are about where a component’s code runs, not about how the HTML is delivered. They can reduce the JavaScript sent to the browser, which helps the hydration gap. They are often combined with SSR or static rendering in a framework.",
    },
    {
      id: "scr-seo",
      question: "How do these strategies affect SEO?",
      answer: "Server-produced HTML gives crawlers complete content in the first response, which is the most reliable. Client-rendered content can be indexed but needs more testing. So public, content-focused pages usually prefer SSR or static rendering.",
    },
  ],
  takeaways: [
    "A strategy decides where and when HTML is produced.",
    "Choose per route, based on how each page’s data behaves.",
    "Server HTML is fast to appear, though it is not interactive until hydration.",
    "Frameworks choose strategies, and React provides the underlying APIs.",
  ],
  quickReview: {
    definition: "Rendering strategies determine where HTML is produced: on a server per request, at build time, or in the browser.",
    keyPoints: [
      "Static suits pages that do not change per request.",
      "SSR suits personalized or live pages.",
      "CSR ships more JavaScript as apps grow.",
      "Hydration makes server HTML interactive.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "snippet",
      title: "Two entry points",
      language: "tsx",
      code: `createRoot(container).render(<App />);
// or, for server-rendered HTML:
hydrateRoot(container, <App />);`,
      typecheckContext: { before: `import { createRoot, hydrateRoot } from "react-dom/client";\nimport type { ReactNode } from "react";\ndeclare const container: HTMLElement;\ndeclare function App(): ReactNode;` },
      description: "createRoot builds from nothing, and hydrateRoot attaches to existing HTML.",
    },
    commonMistakes: [
      "Assuming server-rendered pages respond right away.",
      "Using one strategy for an entire site.",
      "Treating framework rules as React’s rules.",
    ],
    interviewTrap: "“Does SSR make a page interactive faster?” No. It makes content appear sooner, while interactivity still waits for JavaScript.",
    takeaway: "Decide for each page how fresh it must be and how soon it must respond.",
  },
  sources: [
    { label: "web.dev: Rendering on the Web", href: "https://web.dev/articles/rendering-on-the-web" },
    { label: "hydrateRoot reference", href: "https://react.dev/reference/react-dom/client/hydrateRoot" },
    { label: "renderToPipeableStream reference", href: "https://react.dev/reference/react-dom/server/renderToPipeableStream" },
    { label: "Creating a React App", href: "https://react.dev/learn/creating-a-react-app" },
  ],
};
