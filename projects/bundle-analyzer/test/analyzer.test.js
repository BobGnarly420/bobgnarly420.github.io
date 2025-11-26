import { BundleAnalyzer } from '../analyzer.js';
import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';

test('BundleAnalyzer analyzes file correctly', () => {
  const analyzer = new BundleAnalyzer();
  const result = analyzer.analyze('demo/sample-bundle.js');

  assert.ok(result.size.kb > 0, 'Should calculate size');
  assert.ok(result.structure.lines > 0, 'Should count lines');
  assert.ok(Array.isArray(result.analysis.import_list), 'Should find imports');
});

test('BundleAnalyzer detects budget violations', () => {
  const analyzer = new BundleAnalyzer({ budget: 1 }); // 1KB budget
  const result = analyzer.analyze('demo/sample-bundle.js');

  assert.strictEqual(result.budget.over_budget, true, 'Should detect over budget');
  assert.strictEqual(analyzer.passesBudget(), false, 'Should fail budget check');
});

test('BundleAnalyzer passes budget when under limit', () => {
  const analyzer = new BundleAnalyzer({ budget: 100 }); // 100KB budget
  const result = analyzer.analyze('demo/sample-bundle.js');

  assert.strictEqual(result.budget.over_budget, false, 'Should be under budget');
  assert.strictEqual(analyzer.passesBudget(), true, 'Should pass budget check');
});

test('BundleAnalyzer throws on missing file', () => {
  const analyzer = new BundleAnalyzer();
  assert.throws(() => {
    analyzer.analyze('does-not-exist.js');
  }, /File not found/);
});
