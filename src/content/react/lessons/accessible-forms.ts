import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "B",
  sections: [
    {
      id: "labels",
      heading: "Every control needs a label",
      paragraphs: [
        "A label tells people what a control is for, and it is the most important part of an accessible form. Use the label element. Clicking it focuses the input, and screen readers announce it when the input receives focus.",
        "There are two ways to connect them. Pairing htmlFor with an id is generally the better supported, and useId can generate the id so that it stays unique. Wrapping the input inside the label also works.",
      ],
      examples: [
        {
          id: "labelled-inputs",
          classification: "complete",
          title: "Explicit labels with generated IDs",
          language: "tsx",
          code: `import { useId } from "react";

export default function ContactFields() {
  const emailId = useId();
  const messageId = useId();

  return (
    <form>
      <label htmlFor={emailId}>Email</label>
      <input id={emailId} name="email" type="email" autoComplete="email" required />

      <label htmlFor={messageId}>Message</label>
      <textarea id={messageId} name="message" required />

      <button type="submit">Send</button>
    </form>
  );
}`,
          description: "Both pairs are connected explicitly. autoComplete helps people fill the field faster, and also helps those who have difficulty typing.",
        },
      ],
      closing: "A placeholder does not replace a label. It disappears as soon as someone types, and it is often low in contrast.",
    },
    {
      id: "hidden-labels",
      heading: "When a visible label is not possible",
      paragraphs: [
        "A search box next to a Search button may not need a visible label, because its purpose is clear from context. It still needs an accessible name. Use visually hidden CSS that keeps the text available, or aria-label. Do not use display: none or visibility: hidden, as those remove it from assistive technology too.",
        "The title attribute is less reliable, since some assistive technologies do not treat it as a label, so the W3C tutorial does not recommend it.",
      ],
    },
    {
      id: "grouping",
      heading: "Grouping related controls",
      paragraphs: [
        "Use fieldset and legend to name a group of related controls. Radio buttons should always be inside a fieldset, since a single option’s label makes little sense without the question it answers. This also distinguishes repeated labels, such as the Name fields in shipping and billing addresses.",
        "Screen readers may announce the legend with every field, once, or not at all, so keep legends short and make each label self-explanatory.",
      ],
      examples: [
        {
          id: "fieldset-radios",
          classification: "complete",
          title: "A radio group",
          language: "tsx",
          code: `export default function DeliveryChoice() {
  return (
    <fieldset>
      <legend>Delivery speed</legend>
      <label>
        <input type="radio" name="delivery" value="standard" defaultChecked />
        Standard, 3 to 5 days
      </label>
      <label>
        <input type="radio" name="delivery" value="express" />
        Express, next day
      </label>
    </fieldset>
  );
}`,
          description: "The legend provides the question, and a shared name makes the options a single group, which the browser handles with arrow keys.",
        },
      ],
    },
    {
      id: "instructions-and-errors",
      heading: "Instructions and errors",
      paragraphs: [
        "Connect any extra information to its control with aria-describedby, so it is read along with the field. Put format instructions before the input, or at least connected to it, so people have them before they begin. Mark required fields clearly, with text or a stated symbol, as well as with the required attribute.",
        "Errors must be described in text, not only by color. Set aria-invalid on the field, connect the message with aria-describedby, and when a message changes dynamically, use a live region so it is announced.",
      ],
      examples: [
        {
          id: "hint-and-error",
          classification: "complete",
          title: "A hint and an error on one field",
          language: "tsx",
          code: `import { useId } from "react";

export default function PasswordField({ error }: { error?: string }) {
  const hintId = useId();
  const errorId = useId();

  return (
    <div>
      <label>
        Password (required)
        <input
          name="password"
          type="password"
          required
          autoComplete="new-password"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? hintId + " " + errorId : hintId}
        />
      </label>
      <p id={hintId}>Use at least 12 characters.</p>
      {error && <p id={errorId}>{error}</p>}
    </div>
  );
}`,
          description: "aria-describedby accepts several IDs, so the hint and the error are both read with the field.",
        },
      ],
    },
    {
      id: "aria-limits",
      heading: "Native first, and ARIA with care",
      paragraphs: [
        "Native controls come with focus, keyboard behavior, and semantics. ARIA only changes semantics. A div with role=\"checkbox\" is announced as a checkbox, but you must then script the keyboard behavior and state yourself, since a role is a promise to implement it.",
        "No ARIA is better than bad ARIA, because incorrect attributes misrepresent the interface to people relying on it. Reach for a native input first, and style it. Custom controls are expensive to get right.",
      ],
    },
    {
      id: "testing",
      heading: "Checking your form",
      paragraphs: ["A few quick checks catch most problems, without any special tools."],
      list: [
        "Complete the whole form using only a keyboard.",
        "Click each label, and confirm it focuses its control.",
        "Zoom to 200% and check nothing is clipped.",
        "Trigger each error and make sure the message is clear without color.",
        "Try a screen reader on at least one key flow, since automated tools cannot judge everything.",
      ],
    },
  ],
  mistakes: [
    {
      id: "placeholder-label",
      heading: "Using a placeholder as the label",
      problem: "A placeholder looks tidy, but it vanishes while typing, so people forget what the field is for. It is also not a reliable accessible name, and it often has low contrast.",
      correction: "Add a visible label, and use a placeholder at most as an example.",
    },
    {
      id: "custom-control",
      heading: "Building custom controls with div elements",
      problem: "A styled div acting as a checkbox has no focus, no Space key handling, and no announced state. Adding a role does not add those, so keyboard and screen reader users cannot operate it.",
      correction: "Use a native input and style it, and choose a tested component if a custom one is truly required.",
    },
    {
      id: "missing-fieldset",
      heading: "Leaving radio buttons without a group label",
      problem: "A screen reader may announce only Yes when focusing an option, with nothing to say what the question was. The visual heading nearby is not connected to the controls in any way.",
      correction: "Wrap the options in a fieldset, with a legend stating the question.",
    },
    {
      id: "hard-coded-ids",
      heading: "Hard-coding IDs in a reusable field",
      problem: "A reusable field with id=\"email\" produces duplicate IDs when rendered twice. A label can then focus the wrong input, and aria-describedby might read the wrong message.",
      correction: "Generate IDs with useId, so each instance has its own.",
    },
    {
      id: "aria-required-only",
      heading: "Marking required fields only with a color or symbol",
      problem: "A red asterisk with no explanation means nothing to some people, and it is invisible to assistive technology. People may only discover the requirement when an error appears.",
      correction: "Use the required attribute, and say what the marker means, or write required in the label.",
    },
  ],
  interview: [
    {
      id: "af-label",
      question: "How do you correctly label a form input?",
      answer: "Use a label element, either with htmlFor matching the input’s id, or by wrapping the input. Clicking it focuses the input, and screen readers announce it. In reusable components, useId generates the id. A placeholder is not a substitute.",
    },
    {
      id: "af-placeholder",
      question: "Why isn’t a placeholder enough?",
      answer: "It disappears when typing begins, so people lose the context, and it often has poor contrast. It is also not reliably announced as a label. Use it, at most, for an example of the format, alongside a real label.",
    },
    {
      id: "af-fieldset",
      question: "When should you use fieldset and legend?",
      answer: "To name a group of related controls, and always for radio groups, where an option’s label alone lacks context. It also separates repeated labels, as in shipping and billing addresses. Keep legends short, because they may be read with every field.",
    },
    {
      id: "af-aria",
      question: "Why prefer native form elements to ARIA?",
      answer: "Native controls already have focus, keyboard behavior, and semantics. ARIA only changes semantics, so with role=\"checkbox\" on a div, you must still implement the keyboard and state yourself. Incorrect ARIA can be worse than none, as it misinforms assistive technology.",
    },
    {
      id: "af-errors",
      question: "How do you communicate an error accessibly?",
      answer: "State it in text near the field, connect it with aria-describedby, and set aria-invalid. Use a live region or role alert for dynamic changes, and consider moving focus after a failed submit. Color can reinforce the message, but it must not be the only signal.",
    },
    {
      id: "af-test",
      question: "How would you test a form’s accessibility?",
      answer: "Operate it using only a keyboard, check the labels and error messages, and zoom to 200%. Automated tools catch some issues, such as missing labels, but they cannot judge everything, so I would also try a screen reader on the important flows.",
    },
  ],
  takeaways: [
    "Give every control a real label, and connect it explicitly.",
    "Use fieldset and legend for groups, especially radio buttons.",
    "Connect hints and errors with aria-describedby.",
    "Use native controls first, because ARIA does not add behavior.",
  ],
  quickReview: {
    definition: "An accessible form connects labels, instructions, and errors to its controls, so that everyone can complete it.",
    keyPoints: [
      "label plus htmlFor, or wrapping the input.",
      "useId generates IDs for reusable fields.",
      "aria-describedby links hints and errors.",
      "A role is a promise to implement the behavior.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "complete",
      title: "A labelled field",
      language: "tsx",
      code: `import { useId } from "react";

export default function Field() {
  const id = useId();

  return (
    <>
      <label htmlFor={id}>City</label>
      <input id={id} name="city" autoComplete="address-level2" />
    </>
  );
}`,
      description: "Explicitly connected, and safe to render more than once.",
    },
    commonMistakes: [
      "Using a placeholder as the only label.",
      "Building checkboxes from div elements.",
      "Radio buttons with no fieldset and legend.",
    ],
    interviewTrap: "“Does adding role=\"button\" make a div a button?” It changes how it is announced only. Focus and keyboard behavior are still your job.",
    takeaway: "Use the platform’s controls and connect the text around them.",
  },
  sources: [
    { label: "W3C: Labeling controls", href: "https://www.w3.org/WAI/tutorials/forms/labels/" },
    { label: "W3C: Grouping controls", href: "https://www.w3.org/WAI/tutorials/forms/grouping/" },
    { label: "W3C: User notifications", href: "https://www.w3.org/WAI/tutorials/forms/notifications/" },
    { label: "ARIA APG: Read Me First", href: "https://www.w3.org/WAI/ARIA/apg/practices/read-me-first/" },
    { label: "input reference", href: "https://react.dev/reference/react-dom/components/input" },
  ],
};
