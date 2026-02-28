<?php
// ═══════════════════════════════════════════════
// EMAIL DELIVERY — Resend API relay
// Runs on Hostinger (PHP supported natively)
// ═══════════════════════════════════════════════

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['error' => 'POST only']);
    exit;
}

// ── Config ──
$RESEND_API_KEY = 're_Kodasp4R_6yoTk5VwaTxYrGovqvmUPzWv';
$FROM_EMAIL = 'Vikram Presence <onboarding@resend.dev>';

// ── Parse input ──
$input = json_decode(file_get_contents('php://input'), true);
$email = $input['email'] ?? '';
$productName = $input['productName'] ?? '';
$driveLink = $input['driveLink'] ?? '';
$paymentId = $input['paymentId'] ?? '';

if (!$email || !$productName || !$driveLink) {
    http_response_code(400);
    echo json_encode(['error' => 'email, productName, driveLink required']);
    exit;
}

// ── Build HTML email ──
$htmlBody = '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background-color:#000000;font-family:Helvetica Neue,Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;padding:30px 0;border-bottom:1px solid #222;">
      <h1 style="color:#FFD700;font-size:28px;margin:0;letter-spacing:2px;">VIKRAM PRESENCE</h1>
    </div>
    <div style="padding:40px 0;text-align:center;">
      <div style="background:#111;border:2px solid #FFD700;border-radius:16px;padding:30px;margin-bottom:30px;">
        <p style="color:#FFD700;font-size:12px;letter-spacing:3px;text-transform:uppercase;margin:0 0 10px;">Payment Successful</p>
        <h2 style="color:#ffffff;font-size:24px;margin:0 0 5px;">' . htmlspecialchars($productName) . '</h2>
        ' . ($paymentId ? '<p style="color:#666;font-size:11px;margin:5px 0 0;font-family:monospace;">Payment ID: ' . htmlspecialchars($paymentId) . '</p>' : '') . '
      </div>
      <p style="color:#cccccc;font-size:16px;line-height:1.6;margin:0 0 30px;">
        Thank you for your purchase! Click the button below to access your product.
      </p>
      <a href="' . htmlspecialchars($driveLink) . '" 
         style="display:inline-block;background:#FFD700;color:#000000;padding:18px 48px;font-size:16px;font-weight:800;text-decoration:none;border-radius:50px;letter-spacing:2px;text-transform:uppercase;">
        ACCESS YOUR PRODUCT →
      </a>
      <p style="color:#666;font-size:13px;margin:25px 0 0;line-height:1.5;">
        You can also copy this link:<br>
        <a href="' . htmlspecialchars($driveLink) . '" style="color:#FFD700;word-break:break-all;">' . htmlspecialchars($driveLink) . '</a>
      </p>
    </div>
    <div style="border-top:1px solid #222;padding:25px 0;text-align:center;">
      <p style="color:#444;font-size:11px;margin:0;">Save this email — it is your permanent access to the product.</p>
      <p style="color:#333;font-size:10px;margin:10px 0 0;">© Vikram Presence. All rights reserved.</p>
    </div>
  </div>
</body>
</html>';

// ── Send via Resend API ──
$payload = json_encode([
    'from' => $FROM_EMAIL,
    'to' => [$email],
    'subject' => "Your $productName is ready! 🎉 — Vikram Presence",
    'html' => $htmlBody,
]);

$ch = curl_init('https://api.resend.com/emails');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $payload,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $RESEND_API_KEY,
    ],
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode >= 200 && $httpCode < 300) {
    echo json_encode(['success' => true, 'emailSent' => true, 'message' => 'Email sent!']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'emailSent' => false, 'error' => $response]);
}
