#!/usr/bin/env node
import { BundleAnalyzer } from './analyzer.js';
import fs from 'fs';
import path from 'path';

/**
 * CLI for Bundle Analyzer
 */

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    input: null,
    budget: null,
    format: 'text',
    output: null,
    exitOnFail: false
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--input':
      case '-i':
        options.input = args[++i];
        break;
      case '--budget':
      case '-b':
        options.budget = parseFloat(args[++i]);
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
Bundle Analyzer - Analyze JavaScript bundle sizes

USAGE:
  bundle-analyze --input <file> [options]

OPTIONS:
  -i, --input <file>       Path to bundle file (required)
  -b, --budget <kb>        Size budget in KB (optional)
  -f, --format <format>    Output format: text|json (default: text)
  -o, --output <file>      Write report to file (optional)
  --exit-on-fail           Exit with code 1 if over budget
  -h, --help               Show this help

EXAMPLES:
  # Basic analysis
  bundle-analyze --input dist/bundle.js

  # With budget check
  bundle-analyze --input dist/bundle.js --budget 100

  # JSON output to file
  bundle-analyze --input dist/bundle.js --format json --output report.json

  # CI integration (fails if over budget)
  bundle-analyze --input dist/bundle.js --budget 150 --exit-on-fail

EXIT CODES:
  0 - Success (within budget if specified)
  1 - Failure (over budget or error)
`);
}

async function main() {
  const options = parseArgs();

  if (!options.input) {
    console.error('Error: --input is required');
    console.error('Run with --help for usage information');
    process.exit(1);
  }

  try {
    const analyzer = new BundleAnalyzer({
      budget: options.budget,
      threshold: 50
    });

    console.log(`Analyzing: ${options.input}`);
    if (options.budget) {
      console.log(`Budget: ${options.budget} KB\n`);
    }

    const results = analyzer.analyze(options.input);

    // Generate output
    let output;
    if (options.format === 'json') {
      output = analyzer.toJSON();
    } else {
      output = analyzer.toText();
    }

    // Write to file or stdout
    if (options.output) {
      fs.writeFileSync(options.output, output, 'utf-8');
      console.log(`\n✅ Report written to: ${options.output}`);
    } else {
      console.log(output);
    }

    // Check budget and exit if requested
    if (options.budget && options.exitOnFail) {
      if (!analyzer.passesBudget()) {
        console.error('\n❌ Bundle exceeds budget');
        process.exit(1);
      } else {
        console.log('\n✅ Bundle within budget');
      }
    }

  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    process.exit(1);
  }
}

main();
