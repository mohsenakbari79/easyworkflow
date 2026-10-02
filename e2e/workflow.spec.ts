/**
 * Playwright E2E: main workflow — drag a node, connect nodes, click save,
 * and verify the exact payload sent to the adapter.
 *
 * Uses the system Chromium when Playwright browser downloads are blocked.
 */

import { test, expect, type Page } from '@playwright/test';

interface E2EStore {
  saves: Array<{
    id?: string;
    name: string;
    type: string;
    nodes: Array<{ id: string; data: { nodeType: string } }>;
    edges: Array<{ source: string; target: string }>;
  }>;
  loads: string[];
  lastSave: unknown;
}

declare global {
  interface Window {
    __easyflowE2E__?: E2EStore;
  }
}

async function getStore(page: Page): Promise<E2EStore> {
  return page.evaluate(() => {
    if (!window.__easyflowE2E__) {
      window.__easyflowE2E__ = { saves: [], loads: [], lastSave: null };
    }
    return window.__easyflowE2E__!;
  });
}

async function resetStore(page: Page) {
  await page.evaluate(() => {
    window.__easyflowE2E__ = { saves: [], loads: [], lastSave: null };
  });
}

/** Add a card from the palette, then return to the palette panel. */
async function addCard(page: Page, cardName: RegExp) {
  const card = page.getByRole('button', { name: cardName });
  await expect(card).toBeVisible({ timeout: 15_000 });
  await card.click();
  const cancel = page.getByRole('button', { name: /Cancel/i });
  await expect(cancel).toBeVisible();
  await cancel.click();
}

test.describe('easyworkflow main flow', () => {
  test('dragging a node, connecting nodes, and saving sends correct adapter payload', async ({ page }) => {
    test.skip(process.env.E2E_SKIP === '1', 'E2E skipped via E2E_SKIP=1');

    await page.goto('/');
    await expect(page.getByText(/Edit Workflow/i)).toBeVisible({ timeout: 20_000 });
    await resetStore(page);

    // 1) Place two nodes from the palette onto the canvas.
    await addCard(page, /Start/i);
    await addCard(page, /Age Filter/i);

    await expect(page.getByText(/2 nodes/i)).toBeVisible();

    // 2) Connect nodes by dragging from source handle to target handle.
    // React Flow reveals handles on hover; hover nodes first, then drag.
    const startNode = page.locator('.react-flow__node').filter({ hasText: 'Start' }).first();
    const filterNode = page.locator('.react-flow__node').filter({ hasText: 'Age Filter' }).first();
    await expect(startNode).toBeVisible();
    await expect(filterNode).toBeVisible();

    await startNode.hover();
    await page.waitForTimeout(200);
    await filterNode.hover();
    await page.waitForTimeout(200);
    await startNode.hover();

    const sourceHandle = startNode
      .locator('.react-flow__handle-source, .react-flow__handle-bottom')
      .first();
    const targetHandle = filterNode
      .locator('.react-flow__handle-target, .react-flow__handle-top')
      .first();
    await expect(sourceHandle).toBeVisible();
    await expect(targetHandle).toBeVisible();

    const sourceBox = await sourceHandle.boundingBox();
    const targetBox = await targetHandle.boundingBox();
    test.skip(!sourceBox || !targetBox, 'Handle bounding boxes unavailable in this environment');

    const sx = sourceBox!.x + sourceBox!.width / 2;
    const sy = sourceBox!.y + sourceBox!.height / 2;
    const tx = targetBox!.x + targetBox!.width / 2;
    const ty = targetBox!.y + targetBox!.height / 2;

    // Explicit pointer sequence — React Flow listens for pointer events.
    await page.mouse.move(sx, sy);
    await page.mouse.down();
    await page.waitForTimeout(100);
    // Intermediate points help React Flow track the connection line.
    await page.mouse.move(sx + (tx - sx) * 0.3, sy + (ty - sy) * 0.3, { steps: 5 });
    await page.mouse.move(sx + (tx - sx) * 0.7, sy + (ty - sy) * 0.7, { steps: 5 });
    await page.mouse.move(tx, ty, { steps: 5 });
    await page.waitForTimeout(100);
    await page.mouse.up();

    // Connection may take a frame to apply; poll for the edge count.
    await expect(page.getByText(/1 edges/i)).toBeVisible({ timeout: 15_000 });

    // 3) Click Save and verify adapter payload.
    const saveButton = page.getByRole('button', { name: /Save/i }).first();
    await expect(saveButton).toBeVisible();
    await saveButton.click();

    await expect
      .poll(
        async () => {
          const store = await getStore(page);
          return store.saves.length;
        },
        { timeout: 10_000 }
      )
      .toBeGreaterThan(0);

    const store = await getStore(page);
    const payload = store.saves[store.saves.length - 1];

    expect(payload.nodes).toHaveLength(2);
    expect(payload.edges).toHaveLength(1);
    expect(payload.edges[0]).toMatchObject({
      source: expect.any(String),
      target: expect.any(String),
    });

    const nodeTypes = payload.nodes.map((n) => n.data.nodeType).sort();
    expect(nodeTypes).toEqual(['control.start', 'filter.age']);

    const nodeIds = payload.nodes.map((n) => n.id);
    expect(nodeIds).toContain(payload.edges[0].source);
    expect(nodeIds).toContain(payload.edges[0].target);
  });

  test('loadWorkflow populates the editor from the mock adapter', async ({ page }) => {
    test.skip(process.env.E2E_SKIP === '1', 'E2E skipped via E2E_SKIP=1');

    await page.goto('/?workflowId=e2e-load-1');
    await expect(page.getByText(/Edit Workflow/i)).toBeVisible({ timeout: 20_000 });

    // Workflow name is rendered in a controlled text input.
    const nameInput = page.locator('input[type="text"]').first();
    await expect(nameInput).toHaveValue('Loaded E2E', { timeout: 15_000 });

    await expect(page.getByText(/2 nodes/i)).toBeVisible();
    await expect(page.getByText(/1 edges/i)).toBeVisible();

    const store = await getStore(page);
    expect(store.loads).toContain('e2e-load-1');

    await expect(
      page.locator('.react-flow__node').filter({ hasText: 'Start' }).first()
    ).toBeVisible();
    await expect(
      page.locator('.react-flow__node').filter({ hasText: 'Age Filter' }).first()
    ).toBeVisible();
  });
});
