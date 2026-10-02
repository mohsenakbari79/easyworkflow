/**
 * Vitest global setup for easyworkflow component tests.
 *
 * Provides jsdom polyfills required by @xyflow/react (React Flow) and
 * enables jest-dom matchers.
 */

import '@testing-library/jest-dom/vitest';
import { afterEach, beforeAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

/** Minimal ResizeObserver mock — React Flow relies on it for measurement. */
class ResizeObserverMock {
  observe(): void {}
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

  // jsdom lacks layout; give elements a stable box for React Flow measurements.
  if (!Element.prototype.getBoundingClientRect) {
    Element.prototype.getBoundingClientRect = () =>
      ({
        x: 0,
        y: 0,
        width: 120,
        height: 80,
        top: 0,
        left: 0,
        right: 120,
        bottom: 80,
        toJSON: () => ({}),
      }) as DOMRect;
  } else {
    const original = Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = function getBoundingClientRect(this: Element) {
      const rect = original.call(this);
      if (rect.width === 0 && rect.height === 0) {
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
      }
      return rect;
    };
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
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
