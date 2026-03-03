<?php
/**
 * ═════════════════════════════════════════════════
 * IMAGE UPLOAD API — Vikram Presence Admin Portal
 * Handles direct file upload for product cover images
 * ═════════════════════════════════════════════════
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'POST only']);
    exit;
}

// Validate file
if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'No valid file uploaded']);
    exit;
}

$file = $_FILES['image'];
$allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
$maxSize = 5 * 1024 * 1024; // 5MB

if (!in_array($file['type'], $allowed)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Only JPG, PNG, WebP, GIF allowed']);
    exit;
}

if ($file['size'] > $maxSize) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Max file size: 5MB']);
    exit;
}

// Create uploads directory
$uploadDir = __DIR__ . '/../uploads/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Generate unique filename
$ext = pathinfo($file['name'], PATHINFO_EXTENSION) ?: 'jpg';
$filename = 'cover_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
$destination = $uploadDir . $filename;

if (move_uploaded_file($file['tmp_name'], $destination)) {
    $url = '/uploads/' . $filename;
    echo json_encode(['success' => true, 'url' => $url, 'filename' => $filename]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to save file']);
}
?>
