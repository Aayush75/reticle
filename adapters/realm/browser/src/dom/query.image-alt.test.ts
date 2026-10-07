/**
 * What the engine's `alt` check reads off an image: its role and its accessible name.
 *
 * An element predicate that names `alt` beside a locator which does not read it (`testid`, or
 * `scope` + `self`) is checked against the descriptor this package returns: the element must report
 * `role: "img"`, and its `name` must be the alt text. Both halves live here, so they are pinned here —
 * the engine cannot import this package, and a fake session there only proves the comparison, not that
 * a real `<img>` produces the descriptor the comparison assumes.
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { runQuery } from './query.js';

beforeEach(() => {
  document.body.innerHTML = `
    <div>
      <img data-testid="hero" alt="Product photo" src="hero.png">
      <img data-testid="decorative" alt="" src="deco.png">
      <img data-testid="labelled" alt="Product photo" aria-label="Hero banner" src="label.png">
      <button data-testid="buy">Buy</button>
    </div>`;
});

function only(query: Parameters<typeof runQuery>[0]): { role: string; name: string } {
  const [element] = runQuery(query).elements;
  return { role: element?.role ?? '', name: element?.name ?? '' };
}

describe('an <img> as the descriptor an alt check reads', () => {
  it('reports role img, named by its alt, when found by testid', () => {
    expect(only({ testid: 'hero' })).toEqual({ role: 'img', name: 'Product photo' });
  });

  it('reports the same when the scope root itself is the image', () => {
    expect(only({ scope: '[data-testid="hero"]', self: true })).toEqual({
      role: 'img',
      name: 'Product photo',
    });
  });

  it('reports an empty name for a decorative image', () => {
    expect(only({ testid: 'decorative' })).toEqual({ role: 'img', name: '' });
  });

  it('lets an aria-label take precedence over the alt as the name', () => {
    expect(only({ testid: 'labelled' })).toEqual({ role: 'img', name: 'Hero banner' });
  });

  it('reports a button as something other than an image', () => {
    expect(only({ testid: 'buy' }).role).not.toBe('img');
  });
});
