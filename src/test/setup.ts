/**
 * Vitest global setup for easyworkflow component tests.
 *
 * Provides jsdom polyfills required by @xyflow/react (React Flow) and
 * enables jest-dom matchers.
 */

import '@testing-library/jest-dom/vitest';
import { afterEach, beforeAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

type ObserverCallback = (entries: ResizeObserverEntry[], observer: ResizeObserver) => void;

/**
 * ResizeObserver mock that immediately reports a stable non-zero box for
 * every observed element so React Flow can complete node measurement.
 */
class ResizeObserverMock {
  private callback: ObserverCallback;

  constructor(callback: ObserverCallback) {
    this.callback = callback;
  }

  observe(target: Element): void {
    const rect = target.getBoundingClientRect?.() ?? {
      width: 120,
      height: 80,
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 120,
      bottom: 80,
    };
    const entry = {
      target,
      contentRect: {
        width: rect.width || 120,
        height: rect.height || 80,
        x: rect.x || 0,
        y: rect.y || 0,
        top: rect.top || 0,
        left: rect.left || 0,
        right: rect.right || 120,
        bottom: rect.bottom || 80,
        toJSON: () => ({}),
      } as DOMRectReadOnly,
      contentBoxSize: [{ inlineSize: rect.width || 120, blockSize: rect.height || 80 }],
      borderBoxSize: [{ inlineSize: rect.width || 120, blockSize: rect.height || 80 }],
      devicePixelContentBoxSize: [],
    } as unknown as ResizeObserverEntry;

    // Fire async so React can process the measurement update.
    queueMicrotask(() => {
      try {
        this.callback([entry], this as unknown as ResizeObserver);
      } catch {
        // ignore observer errors in jsdom
      }
    });
  }

  unobserve(): void {}
  disconnect(): void {}
}

/** Minimal matchMedia mock used by React Flow / CSS media queries. */
function matchMediaMock(query: string): MediaQueryList {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  } as unknown as MediaQueryList;
}

beforeAll(() => {
  globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;

  if (!window.matchMedia) {
    window.matchMedia = matchMediaMock;
  }

  // jsdom has no layout engine. Give every element a stable non-zero box.
  Element.prototype.getBoundingClientRect = function getBoundingClientRect() {
    return {
      x: 0,
      y: 0,
      width: 120,
      height: 80,
      top: 0,
      left: 0,
      right: 120,
      bottom: 80,
      toJSON: () => ({}),
    } as DOMRect;
  };

  for (const proto of [Element.prototype, HTMLElement.prototype]) {
    Object.defineProperty(proto, 'offsetWidth', {
      configurable: true,
      get() {
        return 120;
      },
    });
    Object.defineProperty(proto, 'offsetHeight', {
      configurable: true,
      get() {
        return 80;
      },
    });
  }

  if (!globalThis.DOMMatrixReadOnly) {
    globalThis.DOMMatrixReadOnly = class DOMMatrixReadOnly {
      constructor(_transform?: string) {}
      m22 = 1;
    } as unknown as typeof DOMMatrixReadOnly;
  }

  if (!window.ResizeObserver) {
    window.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;
  }

  // React Flow schedules measurement work with rAF.
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = (cb: FrameRequestCallback) =>
      setTimeout(() => cb(performance.now()), 0) as unknown as number;
  }
  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = (id: number) => clearTimeout(id);
  }
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
