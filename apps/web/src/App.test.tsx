import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { App } from './App.tsx';

describe('App', () => {
  it("affiche le nom de l'application", () => {
    expect(renderToString(<App />)).toContain('Duper');
  });
});
