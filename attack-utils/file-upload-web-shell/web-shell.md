# File Upload Exploit

An example of a file upload vulnerability that allows an attacker to upload a PHP web shell disguised as an image file. This web shell can then be used to execute arbitrary commands on the server.

## Files

- **`logo.php`** - A PHP web shell disguised as an image file with a fake GIF header. Allows remote command execution via the `?cmd=` parameter.
- **`exploit.sh`** - Automated bash script that uploads the web shell to the image server and executes commands to read the CTF.txt file.