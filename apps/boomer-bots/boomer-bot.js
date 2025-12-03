#!/usr/bin/env node
/**
 * BoomerBot Forum Bot
 * Simulates boomer users browsing the forum and clicking on links in forum message bodies
 */

import puppeteer from 'puppeteer';
import pino from 'pino';

// Create pino logger
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  },
});

class BoomerBot {
  constructor(options = {}) {
    this.credentials = {
      username: process.env.BOT_USERNAME || 'DorothyWilliams',
      password: process.env.BOT_PASSWORD || 'quilting456',
    };
    this.baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    this.apiBaseUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    this.browser = null;
    this.page = null;
    this.clickTimeout = 5000; // 5 seconds timeout
    this.headless = options.headless !== undefined ? options.headless : true;
  }

  async init() {
    logger.info('Starting BoomerBot...');
    logger.info(`Headless mode: ${this.headless}`);

    this.browser = await puppeteer.launch({
      headless: this.headless,
      defaultViewport: { width: 1280, height: 720 },
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
    });

    this.page = await this.browser.newPage();

    logger.info('Browser launched successfully');
  }

  async notifyBotStatus(isActive) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/bot-activity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isActive,
          startedAt: isActive ? new Date().toISOString() : null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        logger.info(
          `Bot status updated (isActive: ${isActive}). Broadcasting to ${data.activeClients} clients.`
        );
      } else {
        logger.error(
          `Failed to update bot status: ${response.status} ${response.statusText}`
        );
      }
    } catch (error) {
      logger.error('Error notifying bot status:', error.message);
    }
  }

  async login() {
    logger.info('Attempting to log in as boomer user...');

    try {
      // Navigate to the login page
      await this.page.goto(`${this.baseUrl}/login`, {
        waitUntil: 'networkidle2',
        timeout: 10000,
      });

      logger.info('Filling in login form...');

      // Fill in the login form
      await this.page.waitForSelector('#username', { timeout: 5000 });
      await this.page.type('#username', this.credentials.username);

      await this.page.waitForSelector('#password', { timeout: 5000 });
      await this.page.type('#password', this.credentials.password);

      // Submit the form
      logger.info('Submitting login form...');

      // Set up response listener before clicking
      const responsePromise = this.page.waitForResponse(
        (response) =>
          response.url().includes('/api/users/login') &&
          response.request().method() === 'POST'
      );

      // Click the submit button
      await this.page.click('button[type="submit"]');

      // Wait for the login response
      const response = await responsePromise;

      if (response.status() === 200) {
        // Verify we're logged in by checking cookies
        const cookies = await this.page.cookies();
        const hasAccessToken = cookies.some(
          (cookie) => cookie.name === 'accessToken'
        );

        if (hasAccessToken) {
          logger.info('Successfully logged in as boomer user');
          return true;
        } else {
          logger.error(
            'Login response was OK but no access token cookie found'
          );
          return false;
        }
      } else {
        const responseText = await response.text();
        logger.error(
          `Login failed with status ${response.status}: ${responseText}`
        );
        return false;
      }
    } catch (error) {
      logger.error('Login failed:', error.message);
      return false;
    }
  }

  async navigateToForum() {
    logger.info('Navigating to forum...');

    try {
      await this.page.goto(`${this.baseUrl}/forum`, {
        waitUntil: 'networkidle2',
        timeout: 10000,
      });

      // Wait for forum content to load
      await this.page.waitForSelector('.messages-list, .no-messages', {
        timeout: 5000,
      });

      logger.info('Successfully navigated to forum');
      return true;
    } catch (error) {
      logger.error('Failed to navigate to forum:', error.message);
      return false;
    }
  }

  async extractForumLinks() {
    logger.info('Extracting links from forum messages...');

    try {
      // Extract all links from message bodies using v-html rendered content
      const links = await this.page.evaluate(() => {
        const messageElements = document.querySelectorAll('.message-body');
        const foundLinks = [];

        messageElements.forEach((messageBody, index) => {
          const linkElements = messageBody.querySelectorAll('a[href]');
          linkElements.forEach((link) => {
            const href = link.getAttribute('href');
            const text = link.textContent.trim();

            // TODO: add JS vulnerability here later as part of the course
            if (
              href &&
              !href.startsWith('javascript:') &&
              !href.startsWith('#')
            ) {
              foundLinks.push({
                url: href,
                text: text,
                messageIndex: index,
              });
            }
          });
        });

        return foundLinks;
      });

      logger.info(`Found ${links.length} links in forum messages:`);
      links.forEach((link, index) => {
        logger.info(`   ${index + 1}. "${link.text}" -> ${link.url}`);
      });

      return links;
    } catch (error) {
      logger.error('Failed to extract forum links:', error.message);
      return [];
    }
  }

  async clickLinkWithTimeout(link) {
    logger.info(`Clicking link: "${link.text}" (${link.url})`);

    try {
      // Navigate to the link
      const navigationPromise = this.page
        .goto(link.url, {
          waitUntil: 'networkidle2',
        })
        .then(async () => {
          // Try to find and click the first button
          try {
            const buttonFound = await this.page.waitForSelector('button', {
              timeout: 1000, // Quick check for button
            });

            if (buttonFound) {
              logger.info('Found a button, clicking it...');
              await this.page.click('button');

              // Wait a bit to see if anything happens
              await new Promise((resolve) => setTimeout(resolve, 1000));
            } else {
              logger.info('No button found on this page');
            }
          } catch {
            logger.info('No clickable button found on this page');
          }
          return true;
        });

      // Set up a timeout for the entire operation
      const timeoutPromise = new Promise((resolve) => {
        setTimeout(() => {
          logger.info(
            `⏰ ${this.clickTimeout / 1000}s timeout reached for ${link.url}`
          );
          resolve(false);
        }, this.clickTimeout);
      });

      // Wait for navigation to complete or timeout
      const result = await Promise.any([navigationPromise, timeoutPromise]);
      return result;
    } catch (error) {
      logger.error(`Error clicking link ${link.url}:`, error.message);
      return false;
    }
  }

  async returnToForum() {
    logger.info('Returning to forum...');

    try {
      await this.page.goto(`${this.baseUrl}/forum`, {
        waitUntil: 'domcontentloaded',
        timeout: 10000,
      });

      // Wait a moment for the page to settle using setTimeout wrapped in Promise
      await new Promise((resolve) => setTimeout(resolve, 1000));

      logger.info('Successfully returned to forum');
      return true;
    } catch (error) {
      logger.error('Failed to return to forum:', error.message);
      return false;
    }
  }

  async simulateForumBrowsing() {
    logger.info('Boomer user is starting to browse the forum...');

    try {
      // Notify that bot is starting activity
      await this.notifyBotStatus(true);

      // Navigate to forum
      const forumNavSuccess = await this.navigateToForum();
      if (!forumNavSuccess) {
        throw new Error('Failed to navigate to forum');
      }

      // Extract all links from forum messages
      const forumLinks = await this.extractForumLinks();

      if (forumLinks.length === 0) {
        logger.info(
          'No links found in forum messages. Dorothy has nothing to click!'
        );
        return;
      }

      // Click on each link with timeout and return to forum
      for (let i = 0; i < forumLinks.length; i++) {
        const link = forumLinks[i];
        logger.info(`\n--- Processing link ${i + 1}/${forumLinks.length} ---`);

        // Click the link and wait for timeout
        await this.clickLinkWithTimeout(link);

        // Return to forum for next link
        if (i < forumLinks.length - 1) {
          // Don't return after the last link
          await this.returnToForum();

          // Small delay between clicks to simulate human behavior
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      logger.info('\nBoomer user has finished browsing all forum links!');
    } catch (error) {
      logger.error('Error during forum browsing simulation:', error.message);
    } finally {
      // Notify that bot has stopped activity
      await this.notifyBotStatus(false);
    }
  }

  async run() {
    while (true) {
      try {
        await this.init();

        const loginSuccess = await this.login();
        if (!loginSuccess) {
          throw new Error('Failed to login');
        }

        await this.simulateForumBrowsing();
      } catch (error) {
        logger.error('Bot execution failed:', error.message);
      } finally {
        if (this.browser) {
          logger.info('Closing browser...');
          await this.browser.close();
        }
      }

      // Wait before next run (configurable via BOT_DELAY_MINUTES env variable)
      const delayMinutes = parseInt(process.env.BOT_DELAY_MINUTES || '10', 10);
      const delayMs = delayMinutes * 60 * 1000;
      logger.info(`⏰ Waiting ${delayMinutes} minutes before next run...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Handle graceful shutdown - only exit if explicitly requested
let isShuttingDown = false;

process.on('SIGINT', async () => {
  if (!isShuttingDown) {
    logger.info('\nReceived SIGINT, shutting down gracefully...');
    isShuttingDown = true;
    process.exit(0);
  }
});

process.on('SIGTERM', async () => {
  if (!isShuttingDown) {
    logger.info('\nReceived SIGTERM, shutting down gracefully...');
    isShuttingDown = true;
    process.exit(0);
  }
});

// Run the bot if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const options = {};

  args.forEach((arg) => {
    if (arg.startsWith('--headless=')) {
      const value = arg.split('=')[1];
      options.headless = value === 'true';
    }
  });

  const boomerBot = new BoomerBot(options);
  boomerBot.run().catch((error) => {
    logger.error('Fatal error:', error);
    process.exit(1);
  });
}

export default BoomerBot;
