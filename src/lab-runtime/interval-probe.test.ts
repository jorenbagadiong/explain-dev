import { describe, expect, it, vi } from "vitest";
import { installIntervalProbe } from "./interval-probe";
function setup() {
  const nativeInterval = vi.fn(), nativeTimeout = vi.fn(), originalInterval = vi.fn();
  let nextNativeId = 100;
  const target = { setTimeout: vi.fn(() => nextNativeId++), setInterval: originalInterval, clearInterval: nativeInterval, clearTimeout: nativeTimeout } as unknown as Window;
  const probe = installIntervalProbe(target); return { target, probe, nativeInterval, nativeTimeout, originalInterval };
}
describe('sandbox interval lifecycle instrumentation', () => {
  it('observes real registrations and exact cadence without sleeping', () => {
    const { target, probe } = setup(), tick = vi.fn();
    const id = target.setInterval(tick, 1000, 'argument');
    expect(id).toBeGreaterThan(0);
    expect(probe.snapshot()).toEqual({ active: 1, delays: [1000], fired: 0 });
    probe.advance(999); expect(tick).not.toHaveBeenCalled(); probe.advance(1); expect(tick).toHaveBeenCalledWith('argument');
    probe.advance(3000); expect(tick).toHaveBeenCalledTimes(4); target.clearInterval(id); expect(probe.snapshot().active).toBe(0);
    probe.advance(10000); expect(tick).toHaveBeenCalledTimes(4); probe.dispose();
  });
  it('distinguishes absent DOM updates from an actually cleared interval', () => {
    const { target, probe } = setup(); let mounted = true, updates = 0;
    target.setInterval(() => { if (mounted) updates++; }, 1000); probe.advance(1000); mounted = false; probe.advance(3000);
    expect(updates).toBe(1); expect(probe.snapshot()).toMatchObject({ active: 1, fired: 4 }); probe.dispose();
  });
  it('supports shared timer cancellation and leaves native heartbeat/deadline IDs alone', () => {
    const { target, probe, nativeInterval, nativeTimeout } = setup(), id = target.setInterval(() => {}, 1000);
    target.clearTimeout(id); expect(probe.snapshot().active).toBe(0);
    target.clearInterval(42); target.clearTimeout(43); expect(nativeInterval).toHaveBeenCalledWith(42); expect(nativeTimeout).toHaveBeenCalledWith(43); probe.dispose();
  });
  it('detects duplicate registrations and accumulations across simulated remounts', () => {
    const { target, probe } = setup(); target.setInterval(() => {}, 1000); target.setInterval(() => {}, 1000);
    expect(probe.snapshot().active).toBe(2); probe.advance(1000); expect(probe.snapshot().fired).toBe(2); probe.dispose();
  });
  it('allows a callback to cancel itself and restores globals on disposal', () => {
    const { target, probe, originalInterval } = setup(); const id = target.setInterval(() => target.clearInterval(id), 1000);
    probe.advance(5000); expect(probe.snapshot()).toMatchObject({ active: 0, fired: 1 }); probe.dispose(); expect(target.setInterval).toBe(originalInterval);
  });
  it('bounds pathological registrations and virtual callback loops', () => {
    const { target, probe } = setup(); target.setInterval(() => {}, 1); expect(() => probe.advance(101)).toThrow('Too many interval callbacks');
    expect(() => target.setInterval('alert(1)', 1000)).toThrow('function interval callback'); probe.dispose();
  });
});
