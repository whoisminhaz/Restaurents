import { createServer } from 'vite';
import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Import tests
import { tests as tier1Tests } from './tier1.test.js';
import { tests as tier2Tests } from './tier2.test.js';
import { tests as tier3Tests } from './tier3.test.js';
import { tests as tier4Tests } from './tier4.test.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSuite() {
  console.log("Starting E2E Test Suite...");
  
  // 1. Programmatically start Vite Server using the E2E config
  let server;
  try {
    server = await createServer({
      configFile: path.resolve(__dirname, '../../vite.e2e.config.js'),
      server: {
        port: 5173,
        strictPort: true
      }
    });
    await server.listen();
  } catch (err) {
    console.error("Failed to start Vite server:", err);
    process.exit(1);
  }

  const baseUrl = `http://localhost:5173`;
  console.log(`Vite E2E server running at ${baseUrl}`);

  // 2. Launch Puppeteer Browser using local installation
  const localBrowserPaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
  ];
  let executablePath;
  for (const p of localBrowserPaths) {
    if (fs.existsSync(p)) {
      executablePath = p;
      break;
    }
  }
  
  if (!executablePath) {
    console.warn("Could not find local Chrome or Edge, falling back to default launcher path");
  } else {
    console.log(`Using local browser: ${executablePath}`);
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      executablePath,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  } catch (err) {
    console.error("Failed to launch Puppeteer:", err);
    await server.close();
    process.exit(1);
  }

  const allTestGroups = [
    { name: 'Tier 1: Feature Coverage', tests: tier1Tests },
    { name: 'Tier 2: Boundary & Corner Cases', tests: tier2Tests },
    { name: 'Tier 3: Cross-Feature Combinations', tests: tier3Tests },
    { name: 'Tier 4: Real-world Scenarios', tests: tier4Tests }
  ];

  let totalPassed = 0;
  let totalFailed = 0;
  const failures = [];

  // 3. Loop through and execute tests
  for (const group of allTestGroups) {
    console.log(`\n=== Running ${group.name} (${group.tests.length} tests) ===`);
    for (const test of group.tests) {
      const page = await browser.newPage();
      
      // Set reasonable timeouts (5 seconds max per operation) to fail fast if blocked
      page.setDefaultTimeout(5000);
      page.setDefaultNavigationTimeout(5000);

      // Simple auto-accept handler for any alerts or confirms
      page.on('dialog', async dialog => {
        try {
          await dialog.accept();
        } catch (e) {
          // Ignore if already handled or dismissed
        }
      });

      page.on('console', msg => {
        if (msg.type() === 'error') {
          console.log(`\n    [PAGE LOG ERROR]: ${msg.text()}`);
        }
      });
      page.on('pageerror', err => {
        console.log(`\n    [PAGE ERROR TRACE]: ${err.stack || err.message}`);
      });
      page.on('requestfailed', request => {
        console.log(`\n    [REQUEST FAILED]: ${request.url()} - ${request.failure()?.errorText || 'unknown'}`);
      });

      try {
        process.stdout.write(`Running "${test.name}"... `);
        await test.run(page, baseUrl);
        console.log(`✅ PASSED`);
        totalPassed++;
      } catch (err) {
        console.log(`❌ FAILED`);
        console.error(`   Error details: ${err.stack || err.message}`);
        totalFailed++;
        failures.push({ name: test.name, error: err });
      } finally {
        try {
          await page.close();
        } catch (e) {
          // ignore page close error
        }
      }
    }
  }

  // 4. Cleanup
  console.log("\nClosing Puppeteer browser...");
  await browser.close();
  
  console.log("Closing Vite server...");
  await server.close();

  // 5. Report summary
  console.log(`\n===================================`);
  console.log(`E2E TEST RUN SUMMARY`);
  console.log(`===================================`);
  console.log(`Total Passed: ${totalPassed}`);
  console.log(`Total Failed: ${totalFailed}`);
  console.log(`===================================`);

  if (totalFailed > 0) {
    console.log(`\n❌ ${totalFailed} tests failed. Exiting with code 1.`);
    process.exit(1);
  } else {
    console.log(`\n🎉 All ${totalPassed} tests passed successfully! Exiting with code 0.`);
    process.exit(0);
  }
}

runSuite().catch(err => {
  console.error("Unhandled error in test runner:", err);
  process.exit(1);
});
