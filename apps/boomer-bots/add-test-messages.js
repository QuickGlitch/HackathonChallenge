#!/usr/bin/env node
/**
 * Script to add sample forum messages with links for testing the bot
 * Uses the backend API instead of direct database access
 */

const https = require("https");
const http = require("http");

// First, we need to get auth cookies by logging in as different users
const users = [
  { username: "EdwardGreenwood", password: "memories1952", id: 7 },
  { username: "DorothyWilliams", password: "quilting456", id: 10 },
  { username: "HaroldSmith", password: "fishing1955", id: 9 },
  { username: "BettyJohnson", password: "knitting123", id: 8 },
];

const testMessages = [
  {
    title: "Great deals on products!",
    body: 'I found some amazing products here: <a href="http://localhost:3000/products">Check out our products</a>. Also try the <a href="http://localhost:3000/cart">shopping cart</a> feature!',
    userIndex: 0, // EdwardGreenwood
  },
  {
    title: "Help with my account",
    body: 'I need help with my account settings. Someone told me to try this <a href="http://localhost:3000/reseller">reseller page</a> to sell my quilts.',
    userIndex: 1, // DorothyWilliams herself
  },
  {
    title: "Found this interesting link",
    body: 'My grandson sent me this link: <a href="http://localhost:3000/login">login page</a>. Not sure what it does but I clicked it anyway. Also found <a href="http://localhost:3000/register">registration</a>.',
    userIndex: 2, // HaroldSmith
  },
  {
    title: "Special admin access?",
    body: 'Someone mentioned there\'s a special <a href="http://localhost:3000/admin">admin section</a> for VIP customers. Has anyone tried it?',
    userIndex: 3, // BettyJohnson
  },
];

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = "";

      res.on("data", (chunk) => {
        body += chunk;
      });

      res.on("end", () => {
        try {
          const responseData = JSON.parse(body);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: responseData,
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: body,
          });
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function loginUser(user) {
  console.log(`🔐 Logging in as ${user.username}...`);

  try {
    const options = {
      hostname: "localhost",
      port: 3001,
      path: "/api/users/login",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    };

    const response = await makeRequest(options, {
      username: user.username,
      password: user.password,
    });

    if (response.statusCode === 200) {
      console.log(`✅ Successfully logged in as ${user.username}`);
      // Extract cookies from response headers
      const cookies = response.headers["set-cookie"];
      return cookies ? cookies.join("; ") : null;
    } else {
      console.error(
        `❌ Login failed for ${user.username}:`,
        response.data.error || response.data
      );
      return null;
    }
  } catch (error) {
    console.error(
      `❌ Network error logging in ${user.username}:`,
      error.message
    );
    return null;
  }
}

async function postMessage(message, cookies) {
  console.log(`📝 Posting message: "${message.title}"`);

  try {
    const options = {
      hostname: "localhost",
      port: 3001,
      path: "/api/forum",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookies || "",
      },
    };

    const response = await makeRequest(options, {
      title: message.title,
      body: message.body,
    });

    if (response.statusCode === 200 || response.statusCode === 201) {
      console.log(`✅ Posted message: "${message.title}"`);
      return true;
    } else {
      console.error(
        `❌ Failed to post message "${message.title}":`,
        response.data.error || response.data
      );
      return false;
    }
  } catch (error) {
    console.error(
      `❌ Network error posting message "${message.title}":`,
      error.message
    );
    return false;
  }
}

async function addTestMessages() {
  console.log("🔗 Adding test forum messages with links via API...");

  for (const message of testMessages) {
    const user = users[message.userIndex];

    // Login as the user for this message
    const cookies = await loginUser(user);

    if (cookies) {
      // Post the message
      await postMessage(message, cookies);
    }

    // Small delay between messages
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log("✅ Test messages setup complete!");
}

async function main() {
  try {
    await addTestMessages();
  } catch (error) {
    console.error("❌ Error adding test messages:", error);
  }
}

main();
