#!/usr/bin/env node
/**
 * Script to manually post forum messages with links using Puppeteer
 * This simulates posting messages through the UI instead of the API
 */

const puppeteer = require("puppeteer");

const users = [
  { username: "EdwardGreenwood", password: "memories1952" },
  { username: "HaroldSmith", password: "fishing1955" },
  { username: "BettyJohnson", password: "knitting123" },
];

const testMessages = [
  {
    title: "Great product links!",
    body: 'I found some amazing deals: <a href="http://localhost:3000/products">Check out our products</a> and <a href="http://localhost:3000/cart">your shopping cart</a>!',
    userIndex: 0,
  },
  {
    title: "Helpful links for newcomers",
    body: 'If you\'re new here, try <a href="http://localhost:3000/register">registering an account</a> or visit the <a href="http://localhost:3000/reseller">reseller section</a> to sell your crafts.',
    userIndex: 1,
  },
  {
    title: "Found something interesting",
    body: 'My grandson showed me this <a href="http://localhost:3000/login">login area</a>. There\'s also some kind of <a href="http://localhost:3001/admin">admin panel</a> - has anyone tried it?',
    userIndex: 2,
  },
];

async function postMessageAsUser(page, user, message) {
  console.log(`\n🔐 Logging in as ${user.username}...`);

  // Navigate to login page
  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle2" });

  // Fill and submit login form
  await page.type("#username", user.username);
  await page.type("#password", user.password);
  await page.click('button[type="submit"]');

  // Wait for redirect after login
  await page.waitForNavigation({ waitUntil: "networkidle2" });

  console.log(`✅ Logged in as ${user.username}`);

  // Navigate to forum
  await page.goto("http://localhost:3000/forum", { waitUntil: "networkidle2" });

  console.log(`📝 Posting message: "${message.title}"`);

  // Fill the forum message form
  await page.waitForSelector("#title");
  await page.type("#title", message.title);

  await page.waitForSelector("#body");
  await page.type("#body", message.body);

  // Submit the form
  await page.click('button[type="submit"]');

  // Wait a moment for the message to be posted
  await page.waitForTimeout(2000);

  console.log(`✅ Posted message: "${message.title}"`);

  // Logout by navigating to logout page
  await page.goto("http://localhost:3000/logout", {
    waitUntil: "networkidle2",
  });
  await page.click("button"); // Click the logout button
  await page.waitForNavigation({ waitUntil: "networkidle2" });

  console.log(`🚪 Logged out ${user.username}`);
}

async function createTestMessages() {
  console.log("🤖 Starting browser to post test messages...");

  const browser = await puppeteer.launch({
    headless: false, // Set to true for headless mode
    defaultViewport: { width: 1280, height: 720 },
  });

  const page = await browser.newPage();

  try {
    for (const message of testMessages) {
      const user = users[message.userIndex];
      await postMessageAsUser(page, user, message);

      // Small delay between users
      await page.waitForTimeout(1000);
    }

    console.log("\n🎉 All test messages posted successfully!");
  } catch (error) {
    console.error("❌ Error posting messages:", error);
  } finally {
    await browser.close();
  }
}

createTestMessages();
