#!/usr/bin/env node
/**
 * Test script for the DorothyWilliams Forum Bot
 * Tests basic functionality before running the full simulation
 */

import BoomerBot from '../boomer-bot.js';

// Check for verbose flag
const args = process.argv.slice(2);
const isVerbose = args.includes('--verbose') || args.includes('-v');

// Helper function for verbose logging
function logVerbose(...args) {
  if (isVerbose) {
    console.log(...args);
  }
}

async function testBot() {
  console.log('Testing BoomerBot...');

  if (!isVerbose) {
    console.log('Use --verbose or -v flag for detailed output\n');
  }

  const bot = new BoomerBot();

  try {
    // Test browser initialization
    logVerbose('1. Testing browser initialization...');
    await bot.init();
    logVerbose('Browser initialization successful\n');

    // Test navigation to homepage
    logVerbose('2. Testing homepage navigation...');
    await bot.page.goto(bot.baseUrl, { waitUntil: 'networkidle2' });

    const title = await bot.page.title();
    logVerbose(`Homepage loaded successfully. Title: ${title}\n`);

    // Test navigation to login page
    logVerbose('3. Testing login page navigation...');
    await bot.page.goto(`${bot.baseUrl}/login`, { waitUntil: 'networkidle2' });

    const loginElements = await bot.page.evaluate(() => {
      return {
        hasUsernameField: !!document.querySelector('#username'),
        hasPasswordField: !!document.querySelector('#password'),
        hasSubmitButton: !!document.querySelector('button[type="submit"]'),
      };
    });

    if (
      loginElements.hasUsernameField &&
      loginElements.hasPasswordField &&
      loginElements.hasSubmitButton
    ) {
      logVerbose('Login form elements found\n');
    } else {
      logVerbose('Missing login form elements:', loginElements);
    }

    // Test forum page accessibility
    logVerbose('4. Testing forum page navigation...');
    await bot.page.goto(`${bot.baseUrl}/forum`, { waitUntil: 'networkidle2' });

    const forumElements = await bot.page.evaluate(() => {
      return {
        hasTitle: !!document.querySelector('h1'),
        hasMessagesList: !!document.querySelector(
          '.messages-list, .no-messages'
        ),
        hasLoginPrompt: !!document.querySelector('.login-prompt'),
      };
    });

    logVerbose('Forum page accessible. Elements found:', forumElements);

    console.log('All tests passed!');
  } catch (error) {
    console.error('Test failed:', error.message);
  } finally {
    await bot.cleanup();
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testBot();
}

export default testBot;
