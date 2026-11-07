import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "B",
  sections: [
    {
      id: "what-makes-complex",
      heading: "What makes a form complex",
      paragraphs: [
        "A form becomes complex when fields depend on each other, when validation spans several fields, or when it spreads across steps. The risk is conflicting state: a country change that leaves an invalid state selected, or a total that disagrees with its line items.",
        "The React tools are the same as ever. The discipline is in identifying the visual states, keeping one source of truth, and calculating everything you can.",
      ],
    },
    {
      id: "state-shape",
      heading: "Choosing a state shape",
      paragraphs: [
        "A reducer suits forms with many related updates, because it gathers the rules about what happens when something changes. Each action describes one interaction, even if it changes several values, which keeps dependent fields consistent.",
      ],
      examples: [
        {
          id: "dependent-fields",
          classification: "complete",
          title: "Dependent fields in a reducer",
          language: "tsx",
          code: `import { useReducer } from "react";

const citiesByCountry: Record<string, readonly string[]> = {
  Philippines: ["Cebu", "Davao"],
  Japan: ["Osaka", "Kyoto"],
};

interface AddressState {
  country: string;
  city: string;
}

type AddressAction = { type: "country_changed"; country: string } | { type: "city_changed"; city: string };

function addressReducer(state: AddressState, action: AddressAction): AddressState {
  switch (action.type) {
    case "country_changed":
      return { country: action.country, city: citiesByCountry[action.country]?.[0] ?? "" };
    case "city_changed":
      return { ...state, city: action.city };
  }
}

export default function AddressForm() {
  const [state, dispatch] = useReducer(addressReducer, { country: "Philippines", city: "Cebu" });

  return (
    <form>
      <label>
        Country
        <select value={state.country} onChange={event => dispatch({ type: "country_changed", country: event.target.value })}>
          {Object.keys(citiesByCountry).map(country => (
            <option key={country}>{country}</option>
          ))}
        </select>
      </label>
      <label>
        City
        <select value={state.city} onChange={event => dispatch({ type: "city_changed", city: event.target.value })}>
          {citiesByCountry[state.country]?.map(city => (
            <option key={city}>{city}</option>
          ))}
        </select>
      </label>
    </form>
  );
}`,
          description: "Changing country and fixing city happen in one action, so no render can show a city from the wrong country. An Effect would allow one in between.",
        },
      ],
    },
    {
      id: "derive-dont-sync",
      heading: "Calculating instead of syncing",
      paragraphs: [
        "Totals, whether a section is complete, whether the form can be submitted: all of these can be calculated while rendering. Do not store them, and do not set them from an Effect. An Effect leaves one render where the values disagree, and it is one more thing to keep correct.",
      ],
      examples: [
        {
          id: "line-items",
          classification: "complete",
          title: "Calculated totals on a dynamic list",
          language: "tsx",
          code: `import { useState } from "react";

interface LineItem {
  id: number;
  label: string;
  amount: number;
}

let nextId = 2;

export default function Expenses() {
  const [items, setItems] = useState<readonly LineItem[]>([{ id: 1, label: "Taxi", amount: 200 }]);
  const total = items.reduce((sum, item) => sum + item.amount, 0);

  function updateAmount(id: number, amount: number) {
    setItems(items.map(item => (item.id === id ? { ...item, amount } : item)));
  }

  return (
    <form>
      {items.map(item => (
        <label key={item.id}>
          {item.label}
          <input type="number" value={item.amount} onChange={event => updateAmount(item.id, Number(event.target.value))} />
        </label>
      ))}
      <button type="button" onClick={() => setItems([...items, { id: nextId++, label: "New item", amount: 0 }])}>
        Add item
      </button>
      <p>Total: {total}</p>
    </form>
  );
}`,
          description: "Rows have stable IDs rather than indexes, so editing and adding stay correct. total can never be out of date.",
        },
      ],
    },
    {
      id: "multi-step",
      heading: "Multi-step forms",
      paragraphs: [
        "Long forms are often easier split into smaller logical steps, with progress shown. Keep the values above the step components, because each step’s state would otherwise be destroyed when it unmounts. A status or step value then decides which part to show.",
      ],
      examples: [
        {
          id: "wizard",
          classification: "complete",
          title: "Steps sharing state in a parent",
          language: "tsx",
          code: `import { useState } from "react";

const steps = ["Contact", "Review"] as const;

export default function Checkout() {
  const [stepIndex, setStepIndex] = useState(0);
  const [email, setEmail] = useState("");

  return (
    <form>
      <p>
        Step {stepIndex + 1} of {steps.length}: {steps[stepIndex]}
      </p>
      {stepIndex === 0 ? (
        <label>
          Email
          <input type="email" value={email} onChange={event => setEmail(event.target.value)} />
        </label>
      ) : (
        <p>We will send your receipt to {email}.</p>
      )}
      {stepIndex > 0 && (
        <button type="button" onClick={() => setStepIndex(stepIndex - 1)}>
          Back
        </button>
      )}
      {stepIndex < steps.length - 1 && (
        <button type="button" onClick={() => setStepIndex(stepIndex + 1)}>
          Next
        </button>
      )}
    </form>
  );
}`,
          description: "email is above the conditional, so it survives moving between steps. When the step changes, also move focus to the new content’s heading, so keyboard users know something has changed.",
        },
      ],
    },
    {
      id: "libraries",
      heading: "When a form library makes sense",
      paragraphs: [
        "Plain React handles most forms well. Libraries help when a form has many fields, shared validation schemas, or field arrays, and when their subscriptions reduce re-renders, since they can avoid re-rendering the whole form on each keystroke. They are separate packages, so weigh one against the extra API and the dependency.",
        "Start with what React offers, and consider a library when you find you are rebuilding one.",
      ],
    },
  ],
  mistakes: [
    {
      id: "effect-chains",
      heading: "Chaining Effects between fields",
      problem: "One Effect resets city when country changes, and another updates shipping when city changes. Each runs after a commit, so several renders show inconsistent values, and the sequence becomes hard to follow.",
      correction: "Handle it in the event handler or a reducer action, and calculate what you can during rendering.",
    },
    {
      id: "state-in-steps",
      heading: "Keeping each step’s state inside the step",
      problem: "Local state in a step component is destroyed when the step unmounts. Going back to a previous step shows an empty form, which looks like the application lost the user’s data.",
      correction: "Lift the values above the step components, or keep all steps mounted and hidden.",
    },
    {
      id: "index-rows",
      heading: "Using the index as the key for dynamic rows",
      problem: "A row list keyed by index misbehaves as soon as a middle row is removed: inputs keep their position while the data shifts, so uncontrolled values and focus attach to the wrong row.",
      correction: "Give each row a stable ID when it is created.",
    },
    {
      id: "one-state-per-field",
      heading: "Adding dozens of separate state variables",
      problem: "Twenty useState calls work, but related updates such as a reset then need twenty setters. It is easy to miss one, and that leaves part of the form in its previous state.",
      correction: "Use an object or a reducer, with one action for reset.",
    },
    {
      id: "validate-at-end-only",
      heading: "Validating only at the final step",
      problem: "Discovering on step five that step one has an error sends someone back through the whole form. It also makes the error harder to find, since the field is no longer on screen.",
      correction: "Validate each step before moving on, and validate everything again on final submit.",
    },
  ],
  interview: [
    {
      id: "cf-state",
      question: "How do you manage state in a complex form?",
      answer: "I start with the shape: what truly is state, and what can be calculated. A reducer suits many related updates, because one action can change several fields consistently. Everything derived, such as totals, is calculated during rendering.",
    },
    {
      id: "cf-dependent",
      question: "How do you handle dependent fields?",
      answer: "Update them together in the same event handler or reducer action. So choosing a country sets the first valid city at once, and no render ever shows a mismatched pair. An Effect would commit an inconsistent state first and then correct it.",
    },
    {
      id: "cf-multistep",
      question: "How would you build a multi-step form?",
      answer: "Keep values in a parent above the steps, since a step’s own state is destroyed on unmount. A step value decides what renders. Validate before moving on and again on submit, show progress, and move focus to the new step’s heading.",
    },
    {
      id: "cf-dynamic-rows",
      question: "How do you handle a form with dynamically added rows?",
      answer: "Store rows as an array of objects with stable IDs created when each is added, and use those as keys. Update them immutably with map and filter. Using the index would attach state and focus to the wrong row after a removal.",
    },
    {
      id: "cf-library",
      question: "When would you use a form library?",
      answer: "When a form has many fields, complex validation shared through schemas, or field arrays, and when subscription-based updates would avoid re-rendering the whole form. For simpler forms, React’s tools are enough, and they do not add a dependency.",
    },
    {
      id: "cf-performance",
      question: "How do you keep a large controlled form responsive?",
      answer: "Split it so that each section owns its state, or use uncontrolled inputs where nothing needs the value until submit. Memoizing expensive sections helps after measuring. If typing is slow, finding what re-renders on each keystroke comes first.",
    },
  ],
  takeaways: [
    "Keep one source of truth, and calculate everything derived.",
    "Update dependent fields together in one action.",
    "Keep multi-step values above the steps.",
    "Give dynamic rows stable IDs.",
  ],
  quickReview: {
    definition: "Managing a complex form means keeping dependent fields consistent by using a single source of truth and calculated values.",
    keyPoints: [
      "One event, one consistent state change.",
      "Avoid chains of Effects between fields.",
      "Lift values above conditional steps.",
      "Consider a library for very large forms.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "snippet",
      title: "Updating dependent fields together",
      language: "tsx",
      code: `function handleCountryChange(country: string) {
  setAddress({ country, city: citiesByCountry[country][0] });
}`,
      typecheckContext: { before: `declare const citiesByCountry: Record<string, string[]>;\ndeclare const setAddress: (next: { country: string; city: string }) => void;` },
      description: "One update means no render ever shows a mismatched city.",
    },
    commonMistakes: [
      "Syncing fields through a chain of Effects.",
      "Holding each step’s state inside the step.",
      "Keying dynamic rows by index.",
    ],
    interviewTrap: "“Should a city reset in an Effect when the country changes?” No. That renders a mismatch first, so update both in the same event.",
    takeaway: "Complex forms stay simple when each event produces one consistent state.",
  },
  sources: [
    { label: "Reacting to Input with State", href: "https://react.dev/learn/reacting-to-input-with-state" },
    { label: "Extracting State Logic into a Reducer", href: "https://react.dev/learn/extracting-state-logic-into-a-reducer" },
    { label: "You Might Not Need an Effect", href: "https://react.dev/learn/you-might-not-need-an-effect" },
    { label: "W3C: Forms tutorial", href: "https://www.w3.org/WAI/tutorials/forms/" },
  ],
};
