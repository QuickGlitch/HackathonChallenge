#!/usr/bin/env node
/**
 * Simple script to test posting a forum message via API
 */

const http = require("http");

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

async function testSimplePost() {
  console.log("🔐 Logging in as DorothyWilliams...");

  // Login first
  const loginOptions = {
    hostname: "localhost",
    port: 3001,
    path: "/api/users/login",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  };

  const loginResponse = await makeRequest(loginOptions, {
    username: "DorothyWilliams",
    password: "quilting456",
  });

  if (loginResponse.statusCode === 200) {
    console.log("✅ Successfully logged in");
    const cookies = loginResponse.headers["set-cookie"]
      ? loginResponse.headers["set-cookie"].join("; ")
      : "";

    console.log("📝 Posting simple message...");

    const postOptions = {
      hostname: "localhost",
      port: 3001,
      path: "/api/forum",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookies,
      },
    };

    const postResponse = await makeRequest(postOptions, {
      title: "Test message from Dorothy",
      body: "This is a simple test message without links.",
    });

    console.log("Response status:", postResponse.statusCode);
    console.log("Response data:", postResponse.data);
  } else {
    console.log("❌ Login failed:", loginResponse.data);
  }
}

testSimplePost();
