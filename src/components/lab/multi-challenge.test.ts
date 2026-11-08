import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { getLabChallengeContext, labChallenges } from "@/lib/lab/challenges";
import { getGradingTests } from "@/lib/lab/grading";
import { challengeProgressDefinition } from "@/lib/lab/progress-definition";
import { ChallengeProgressStatus } from "./challenge-progress-status";
import { GradingResults } from "./grading-results";
vi.mock("./practice-workspace-loader", () => ({ PracticeWorkspaceLoader: (props: { challengeId: string }) => createElement('div', { 'data-workspace-id': props.challengeId }) }));
const { ChallengePage } = await import('./challenge-page');
describe('five-challenge server and result presentation', () => {
  it.each(labChallenges.map(challenge => [challenge.id, challenge] as const))('%s renders its own content, objectives and lazy workspace', (id, challenge) => {
    const html = renderToStaticMarkup(createElement(ChallengePage, { context: getLabChallengeContext(id)! }));
    expect(html.match(/<h1\b/g)).toHaveLength(1); expect(html).toContain(`>${challenge.title}</h1>`);
    expect(html).toContain(`data-workspace-id="${id}"`); expect(html).toContain('Learning objectives');
    for (const hint of challenge.hints) expect(html).not.toContain(hint);
    const results = renderToStaticMarkup(createElement(GradingResults, { challengeId: id, onRetry: () => {}, state: { kind: 'finished', result: { challengeId: id, runId: 1, completed: true, durationMs: 7, results: getGradingTests(id).map(test => ({ id: test.id, status: 'passed' as const, feedback: 'Matched.', durationMs: 1 })) } } }));
    for (const test of getGradingTests(id)) expect(results).toContain(test.title);
    expect(results).toContain('7 of 7 tests passed. Challenge complete.');
  });
  it('keeps index status SSR-safe, read-only and independent from the editor', () => {
    const html = renderToStaticMarkup(createElement(ChallengeProgressStatus, { definition: challengeProgressDefinition(labChallenges[0]) }));
    expect(html).toContain('Loading local progress'); expect(html).not.toContain('iframe'); expect(html).not.toContain('textarea');
  });
});
