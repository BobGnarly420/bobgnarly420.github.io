import { LighthouseEnforcer } from '../enforcer.js';
import { test } from 'node:test';
import assert from 'node:assert';

test('LighthouseEnforcer enforces budget correctly', () => {
  const budget = {
    performance_score: 90,
    lcp: 2500
  };

  const enforcer = new LighthouseEnforcer(budget);
  const result = enforcer.enforce('demo/sample-report.json');

  assert.ok(result.metrics, 'Should extract metrics');
  assert.ok(result.score >= 0, 'Should calculate score');
  assert.strictEqual(result.passed, true, 'Should pass budget');
});

test('LighthouseEnforcer detects violations', () => {
  const strictBudget = {
    performance_score: 99, // Impossible threshold
    lcp: 100 // Very strict
  };

  const enforcer = new LighthouseEnforcer(strictBudget);
  const result = enforcer.enforce('demo/sample-report.json');

  assert.ok(result.violations.length > 0, 'Should detect violations');
  assert.strictEqual(result.passed, false, 'Should fail budget');
});

test('LighthouseEnforcer throws on missing file', () => {
  const enforcer = new LighthouseEnforcer({});
  assert.throws(() => {
    enforcer.enforce('does-not-exist.json');
  }, /Report not found/);
});
