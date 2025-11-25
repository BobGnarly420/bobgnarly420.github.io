#!/usr/bin/env node
import { LighthouseEnforcer } from './enforcer.js';
import fs from 'fs';

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    report: null,
    budget: null,
    format: 'text',
    output: null,
    exitOnFail: false
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--report':
      case '-r':
        options.report = args[++i];
        break;
      case '--budget':
      case '-b':
        options.budget = args[++i];
        break;
      case '--format':
      case '-f':
        options.format = args[++i];
        break;
      case '--output':
      case '-o':
        options.output = args[++i];
        break;
      case '--exit-on-fail':
        options.exitOnFail = true;
        break;
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
        break;
    }
  }

  return options;
}

function printHelp() {
  console.log(`
Lighthouse Budget Enforcer - Validate performance against budgets

USAGE:
  lighthouse-enforce --report <file> --budget <file> [options]

OPTIONS:
  -r, --report <file>      Path to Lighthouse JSON report (required)
  -b, --budget <file>      Path to budget JSON file (required)
  -f, --format <format>    Output format: text|json (default: text)
  -o, --output <file>      Write report to file (optional)
  --exit-on-fail           Exit with code 1 if budget violated
  -h, --help               Show this help

BUDGET FILE FORMAT:
  {
    "performance_score": 90,
    "lcp": 2500,
    "fid": 100,
    "cls": 0.1,
    "total_byte_weight": 512000
  }

EXAMPLES:
  # Basic check
  lighthouse-enforce --report report.json --budget budget.json

  # CI integration
  lighthouse-enforce -r report.json -b budget.json --exit-on-fail

  # JSON output
  lighthouse-enforce -r report.json -b budget.json --format json -o results.json

EXIT CODES:
  0 - All budgets passed
  1 - Budget violations or error
`);
}

async function main() {
  const options = parseArgs();

  if (!options.report || !options.budget) {
    console.error('Error: --report and --budget are required');
    console.error('Run with --help for usage information');
    process.exit(1);
  }

  try {
    // Load budget
    const budgetConfig = JSON.parse(fs.readFileSync(options.budget, 'utf-8'));

    // Create enforcer
    const enforcer = new LighthouseEnforcer(budgetConfig);

    // Enforce budget
    console.log(`Enforcing budget on: ${options.report}\n`);
    const results = enforcer.enforce(options.report);

    // Generate output
    let output;
    if (options.format === 'json') {
      output = enforcer.toJSON();
    } else {
      output = enforcer.toText();
    }

    // Write to file or stdout
    if (options.output) {
      fs.writeFileSync(options.output, output, 'utf-8');
      console.log(`\n✅ Report written to: ${options.output}`);
    } else {
      console.log(output);
    }

    // Exit based on results
    if (options.exitOnFail && !enforcer.passed()) {
      console.error('\n❌ Budget enforcement failed');
      process.exit(1);
    } else if (enforcer.passed()) {
      console.log('\n✅ All budgets passed');
    }

  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    process.exit(1);
  }
}

main();
