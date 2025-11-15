# DorothyWilliams Forum Bot

This application simulates DorothyWilliams (one of the elderly users from the database seed) browsing the forum and clicking on links found in forum message bodies.

## Features

- **Automated Login**: Logs in as DorothyWilliams using her credentials from the seed file
- **Forum Navigation**: Automatically navigates to the forum page
- **Link Detection**: Scans all forum messages for clickable links in message bodies
- **Link Clicking**: Clicks each link found and attempts to click the first button on the destination page
- **Timeout Protection**: Each link click operation times out after 5 seconds to prevent getting stuck
- **Forum Return**: After each link interaction, returns to the forum to continue with the next link

## Prerequisites

- Node.js (v14 or higher)
- The store application should be running (frontend on port 3000, backend on port 3001)
- Database should be seeded with DorothyWilliams user account

## Installation

```bash
cd apps/boomer-bots
npm install
```

## Usage

### Run the full bot simulation
```bash
npm start
# or
npm run dorothy
# or
node boomer-bot.js
```

### Test bot functionality
```bash
npm test
# or
node test-bot.js
```

## Bot Behavior

1. **Initialization**: Launches a Chromium browser (visible by default for demonstration)
2. **Login**: Navigates to `/login` and signs in as DorothyWilliams with password `quilting456`
3. **Forum Access**: Goes to the `/forum` page
4. **Link Extraction**: Scans all forum messages for HTML links in message bodies
5. **Link Processing**: For each link found:
   - Clicks the link and navigates to the destination
   - Looks for the first `<button>` element on the page
   - If found, clicks the button
   - Waits up to 5 seconds for any response
   - Returns to the forum page
   - Continues with the next link

## Configuration

You can modify the bot behavior by editing `boomer-bot.js`:

- **Headless Mode**: Change `headless: false` to `headless: true` in the browser launch options
- **Timeout Duration**: Modify `this.clickTimeout = 5000` (time in milliseconds)
- **Base URL**: Change `this.baseUrl = 'http://localhost:3000'` if your frontend runs on a different port
- **Browser Size**: Adjust `defaultViewport: { width: 1280, height: 720 }`

## User Credentials

The bot uses DorothyWilliams' credentials from the database seed:
- **Username**: `DorothyWilliams`
- **Password**: `quilting456`
- **Profile**: Born in 1951, former nurse, president of the local quilting club

## Troubleshooting

### Bot fails to login
- Ensure the frontend application is running on port 3000
- Verify the database is seeded with DorothyWilliams user
- Check that the login form selectors match the current frontend implementation

### No links found
- The bot only finds links in forum message bodies (`<div class="message-body">`)
- Links must be proper HTML `<a>` tags with `href` attributes
- The bot ignores JavaScript links and hash anchors

### Timeout issues
- Increase the timeout duration if pages load slowly
- Check network connectivity between the bot and the applications
- Ensure the backend API is responsive

### Browser crashes
- Install the required browser dependencies:
  ```bash
  # On Ubuntu/Debian
  sudo apt-get install -y chromium-browser

  # On CentOS/RHEL
  sudo yum install -y chromium
  ```

## Example Output

```
🤖 Starting DorothyWilliams Bot...
✅ Browser launched successfully
🔐 Attempting to log in as DorothyWilliams...
📝 Filling in login form...
🚀 Submitting login form...
✅ Successfully logged in as DorothyWilliams
👵 DorothyWilliams is starting to browse the forum...
🏛️  Navigating to forum...
✅ Successfully navigated to forum
🔍 Extracting links from forum messages...
📋 Found 3 links in forum messages:
   1. "Buy gifts here" -> http://localhost:3000/products
   2. "Special deals" -> http://localhost:3000/cart
   3. "Admin panel" -> http://localhost:3000/admin

--- Processing link 1/3 ---
🖱️  Clicking link: "Buy gifts here" (http://localhost:3000/products)
🔘 Found a button, clicking it...
🔙 Returning to forum...
✅ Successfully returned to forum

--- Processing link 2/3 ---
🖱️  Clicking link: "Special deals" (http://localhost:3000/cart)
🚫 No clickable button found on this page
🔙 Returning to forum...
✅ Successfully returned to forum

--- Processing link 3/3 ---
🖱️  Clicking link: "Admin panel" (http://localhost:3000/admin)
⏰ 5s timeout reached for http://localhost:3000/admin

🎉 DorothyWilliams has finished browsing all forum links!
🔚 Closing browser...
```

## Security Note

This bot simulates potentially dangerous user behavior (clicking random links) in a controlled environment. It should only be used for:
- Penetration testing
- Security research
- Demonstration of XSS vulnerabilities
- Educational purposes

Never run this bot against production systems or systems you don't own.