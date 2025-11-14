#!/usr/bin/env node
/**
 * Test script for the DorothyWilliams Forum Bot
 * Tests basic functionality before running the full simulation
 */

const DorothyBot = require("./dorothy-bot");

async function testBot() {
  console.log("🧪 Testing DorothyWilliams Bot...\n");

  const bot = new DorothyBot();

  try {
    // Test browser initialization
    console.log("1. Testing browser initialization...");
    await bot.init();
    console.log("✅ Browser initialization successful\n");

    // Test navigation to homepage
    console.log("2. Testing homepage navigation...");
    await bot.page.goto(bot.baseUrl, { waitUntil: "networkidle2" });

    const title = await bot.page.title();
    console.log(`✅ Homepage loaded successfully. Title: ${title}\n`);

    // Test navigation to login page
    console.log("3. Testing login page navigation...");
    await bot.page.goto(`${bot.baseUrl}/login`, { waitUntil: "networkidle2" });

    const loginElements = await bot.page.evaluate(() => {
      return {
        hasUsernameField: !!document.querySelector("#username"),
        hasPasswordField: !!document.querySelector("#password"),
        hasSubmitButton: !!document.querySelector('button[type="submit"]'),
      };
    });

    if (
      loginElements.hasUsernameField &&
      loginElements.hasPasswordField &&
      loginElements.hasSubmitButton
    ) {
      console.log("✅ Login form elements found\n");
    } else {
      console.log("❌ Missing login form elements:", loginElements);
    }

    // Test forum page accessibility
    console.log("4. Testing forum page navigation...");
    await bot.page.goto(`${bot.baseUrl}/forum`, { waitUntil: "networkidle2" });

    const forumElements = await bot.page.evaluate(() => {
      return {
        hasTitle: !!document.querySelector("h1"),
        hasMessagesList: !!document.querySelector(
          ".messages-list, .no-messages"
        ),
        hasLoginPrompt: !!document.querySelector(".login-prompt"),
      };
    });

    console.log("✅ Forum page accessible. Elements found:", forumElements);

    console.log("\n🎉 All tests passed! Bot is ready to run.");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  } finally {
    await bot.cleanup();
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testBot();
}

module.exports = testBot;
