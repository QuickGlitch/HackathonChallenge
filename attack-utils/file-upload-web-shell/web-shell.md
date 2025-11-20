# File Upload Exploit

## Files

- **`logo.php`** - A PHP web shell disguised as an image file with a fake GIF header. Allows remote command execution via the `?cmd=` parameter.
- **`exploit.sh`** - Automated bash script that uploads the web shell to the image server and executes commands to read the CTF.txt file.