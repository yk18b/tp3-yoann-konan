import { describe, expect, it } from 'vitest';
import { APP_NAME } from './index.ts';

describe('shared', () => {
  it("expose le nom de l'application", () => {
    expect(APP_NAME).toBe('Duper');
  });
});
