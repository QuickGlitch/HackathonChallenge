# XSS Attack - Forum Message Data Exfiltration

## Overview

This XSS (Cross-Site Scripting) exploit leverages the forum's lack of input sanitization to steal user credentials and session data from other users.

## Attack Steps

1. Copy the payload from `example.html`
2. Create a new forum post with any title
3. Paste the payload into the message body
4. Submit the post
5. When other users view your post, their data will be automatically posted to the forum
6. Check the forum for new posts titled "Stolen User Data" containing victim credentials

## Data Exfiltrated

The attack captures the complete `user` object from localStorage, which typically includes:
- User ID
- Username
- Email address
- Name
- Authentication tokens
- Role/permissions
- Any other user session data

## Why This Works

The forum endpoint has **no input sanitization**, allowing raw HTML and JavaScript to be stored in the database and rendered directly in other users' browsers. This is a stored (persistent) XSS vulnerability, making it particularly dangerous as it affects all users who view the malicious post.

## Mitigation

To prevent this attack, the application should:
- Sanitize all user input before storing in the database
- Encode output when rendering user-generated content
- Implement Content Security Policy (CSP) headers
- Use authentication middleware to prevent unauthorized forum posts
