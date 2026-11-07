import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "C",
  sections: [
    {
      id: "what-streaming-is",
      heading: "What streaming means",
      paragraphs: [
        "Without streaming, a server has to finish generating an entire page before sending any of it, so one slow data source delays everything. Streaming sends HTML in chunks as they become ready, and the browser can render them on arrival.",
        "In React, Suspense boundaries define where the chunks are. Everything outside any boundary is the shell, which is sent first. Each boundary’s fallback goes with it, and its real content follows later, along with a small inline script that swaps it into place.",
      ],
      visual: {
        heading: "How a streamed page arrives",
        context: "This follows a profile page, whose posts load slowly.",
        steps: [
          { id: "shell", title: "The shell arrives", description: "The layout and profile cover render, with a fallback for the posts." },
          { id: "visible", title: "The user sees content", description: "This does not wait for JavaScript or the slow data." },
          { id: "chunk", title: "The posts’ HTML arrives", description: "An inline script replaces the fallback with the real content." },
          { id: "hydrate", title: "Hydration", description: "JavaScript loads and makes the page interactive, part by part." },
        ],
        note: "This is simplified. Nested boundaries add more steps, and they do not need to arrive in order.",
      },
      examples: [
        {
          id: "stream-structure",
          classification: "server",
          title: "Boundaries define the chunks",
          language: "tsx",
          code: `import { Suspense } from "react";

async function Posts() {
  const response = await fetch("https://api.example.com/posts");
  const posts: readonly { id: string; title: string }[] = await response.json();

  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}

export default function ProfilePage() {
  return (
    <main>
      <h1>Profile</h1>
      <Suspense fallback={<p>Loading posts…</p>}>
        <Posts />
      </Suspense>
    </main>
  );
}`,
          description: "The heading and fallback go out first, then the list follows when its data is ready. This async component needs a Server Components environment.",
        },
      ],
    },
    {
      id: "supported-renderers",
      heading: "It needs a supporting renderer",
      paragraphs: [
        "Streaming does not happen by itself. It depends on the server API in use, and on data coming from a source that activates Suspense. React’s renderToPipeableStream does this on Node.js, and renderToReadableStream on Web Streams environments such as Deno and modern edge runtimes.",
        "Frameworks such as Next.js handle this for you. renderToString, the older API, does not stream in this way. Data fetched in an Effect also does not suspend during server rendering, so it will not stream.",
      ],
      examples: [
        {
          id: "pipeable",
          classification: "server",
          title: "Streaming from Node.js",
          language: "tsx",
          code: `import { renderToPipeableStream } from "react-dom/server";
import type { ServerResponse } from "node:http";

function App() {
  return (
    <html lang="en">
      <body>
        <h1>Hello</h1>
      </body>
    </html>
  );
}

export async function handleRequest(response: ServerResponse) {
  const { pipe } = renderToPipeableStream(<App />, {
    bootstrapScripts: ["/main.js"],
    onShellReady() {
      response.setHeader("content-type", "text/html");
      pipe(response);
    },
    onShellError() {
      response.statusCode = 500;
      response.setHeader("content-type", "text/html");
      response.end("<h1>Something went wrong</h1>");
    },
    onError(error) {
      console.error(error);
    },
  });
}`,
          description: "onShellReady starts sending as soon as the shell is done. You will not normally write this yourself in a framework.",
        },
      ],
    },
    {
      id: "status-and-errors",
      heading: "Status codes and errors",
      paragraphs: [
        "Once streaming starts, you cannot change the status code, because headers have already been sent. So the shell decides. An error in the shell triggers onShellError, where you can still send a 500 response. An error inside a boundary emits its fallback, and the page continues as 200, because the client retries that content.",
        "This has a practical consequence: put anything critical, such as a not-found decision, in the shell, where it can still set a status.",
      ],
      comparison: [
        {
          id: "shell-error",
          title: "An error in the shell",
          items: ["onShellError fires.", "No bytes have been sent yet.", "You can send a 500 and a fallback page."],
        },
        {
          id: "boundary-error",
          title: "An error inside a boundary",
          items: ["The closest fallback is sent.", "The status stays 200.", "React retries on the client, and users may never see the error."],
        },
      ],
    },
    {
      id: "crawlers",
      heading: "Crawlers and static generation",
      paragraphs: [
        "For regular visitors, send on onShellReady, for progressive loading. For crawlers or static generation, you might wait for onAllReady, which fires when all content has finished, and then send the complete HTML. The tradeoff is that this waits for all data, including anything slow or failing.",
      ],
    },
    {
      id: "designing-for-it",
      heading: "Designing for streaming",
      paragraphs: [
        "Streaming helps most when a page has a fast part and a slow part. If all its data is fast, or the main content is itself the slow part, boundaries add less. Place them so that the shell is meaningful by itself, and so that a fallback holds the space its content will take, which reduces layout shift.",
      ],
    },
  ],
  mistakes: [
    {
      id: "effect-data",
      heading: "Expecting Effect data to stream",
      problem: "Effects do not run on the server, so data fetched there never appears in the HTML or the stream. The server sends the empty state, and the content only arrives after hydration.",
      correction: "Use data from a source that activates Suspense, such as a Server Component or use with a cached Promise.",
    },
    {
      id: "critical-in-boundary",
      heading: "Putting critical decisions inside a boundary",
      problem: "If a not-found or an authorization check happens inside a boundary, headers have already gone out with a 200 status. Search engines and clients then see a success for what should be an error.",
      correction: "Decide status-affecting things in the shell, before streaming begins.",
    },
    {
      id: "big-shell",
      heading: "Letting slow data into the shell",
      problem: "A slow fetch outside any boundary holds up the whole response. The page looks as if it does not stream at all, and users wait for everything, despite the server using a streaming API.",
      correction: "Wrap slow parts in Suspense, so that the shell can be sent right away.",
    },
    {
      id: "layout-shift",
      heading: "Using fallbacks that do not hold space",
      problem: "A small spinner replaced by a large list pushes everything below it down when the content arrives. People lose their place, and they may even click the wrong thing.",
      correction: "Make fallbacks similar in size to their content.",
    },
    {
      id: "string-api",
      heading: "Expecting renderToString to stream",
      problem: "renderToString returns one complete string, and it does not support streaming. It also does not wait for Suspense data, so slow content comes through as its fallback, and it is retried on the client.",
      correction: "Use renderToPipeableStream or renderToReadableStream, or a framework that uses them.",
    },
  ],
  interview: [
    {
      id: "st-what",
      question: "What is streaming server rendering?",
      answer: "Sending HTML in chunks as it becomes ready, rather than waiting for the whole page. In React, Suspense boundaries define the chunks. The shell and fallbacks arrive first, then later HTML replaces each fallback through a small inline script.",
    },
    {
      id: "st-benefit",
      question: "What does streaming improve?",
      answer: "Content appears sooner, particularly on pages with one slow data source, which would otherwise delay everything. It does not make that data faster. It also does not wait for JavaScript in the browser, so the shell can paint before any of it loads.",
    },
    {
      id: "st-apis",
      question: "Which APIs does React provide for streaming?",
      answer: "renderToPipeableStream for Node.js, and renderToReadableStream for Web Streams environments such as Deno or edge runtimes. Each lets you act when the shell is ready. Frameworks generally call these for you.",
    },
    {
      id: "st-status",
      question: "How do you handle HTTP status codes with streaming?",
      answer: "Once streaming begins, the status cannot change. Errors in the shell can still return a 500, while errors in boundaries stay 200, and they retry on the client. So anything that affects the status needs to happen before the shell is sent.",
    },
    {
      id: "st-activate",
      question: "What data can stream?",
      answer: "Data read from a source that activates Suspense, such as a Promise read with use, or a Server Component. Data fetched in an Effect does not, because Effects do not run on the server. The content then arrives only after hydration.",
    },
    {
      id: "st-crawler",
      question: "How should streaming treat crawlers?",
      answer: "You can wait for onAllReady and send complete HTML, so that crawlers get everything in one response. The tradeoff is waiting for all data, even slow or failing data. Alternatively, send the shell to them too, depending on how the crawler behaves.",
    },
  ],
  takeaways: [
    "Streaming sends HTML in chunks, with Suspense boundaries defining them.",
    "The shell goes first, so it should be fast and meaningful.",
    "The status code cannot change after streaming starts.",
    "Only Suspense-enabled data streams, and Effect data does not.",
  ],
  quickReview: {
    definition: "Streaming sends a page’s HTML progressively, with the shell first and each Suspense boundary’s content following when ready.",
    keyPoints: [
      "It needs renderToPipeableStream, renderToReadableStream, or a framework.",
      "Errors in boundaries retry on the client.",
      "Critical decisions belong in the shell.",
      "Fallbacks should hold their content’s space.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "snippet",
      title: "A slow part behind a boundary",
      language: "tsx",
      code: `<Suspense fallback={<PostsSkeleton />}>
  <Posts />
</Suspense>`,
      typecheckContext: { before: `import { Suspense, type ReactNode } from "react";\ndeclare function PostsSkeleton(): ReactNode;\ndeclare function Posts(): ReactNode;\nexport const element = (`, after: ");" },
      description: "The skeleton is sent in the first chunk, and the posts follow when they are ready.",
    },
    commonMistakes: [
      "Expecting data from Effects to stream.",
      "Making a not-found decision inside a boundary.",
      "Leaving slow data in the shell.",
    ],
    interviewTrap: "“Can a streamed response change to a 404 later?” No. Headers have been sent, so that decision has to happen in the shell.",
    takeaway: "Send what you know now, and let boundaries deliver the rest.",
  },
  sources: [
    { label: "renderToPipeableStream reference", href: "https://react.dev/reference/react-dom/server/renderToPipeableStream" },
    { label: "Suspense reference", href: "https://react.dev/reference/react/Suspense" },
    { label: "web.dev: Rendering on the Web", href: "https://web.dev/articles/rendering-on-the-web" },
  ],
};
