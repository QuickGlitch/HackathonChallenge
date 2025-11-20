<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

if (!isset($_FILES['image'])) {
    http_response_code(400);
    echo json_encode(['error' => 'No image file provided']);
    exit;
}

$file = $_FILES['image'];
$uploadDir = __DIR__ . '/images/';

if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

// Generate a unique filename to prevent overwriting
$extension = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = uniqid() . '_' . time() . '.' . $extension;
$targetPath = $uploadDir . $filename;

if (move_uploaded_file($file['tmp_name'], $targetPath)) {
    // Return the URL to the image
    // Assuming the server is accessible via /images/ path from the frontend proxy
    $imageUrl = '/images/' . $filename;
    echo json_encode([
        'success' => true,
        'url' => $imageUrl,
        'message' => 'Image uploaded successfully'
    ]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save image']);
}
?>
