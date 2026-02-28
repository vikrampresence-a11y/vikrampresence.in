<?php
// ═══════════════════════════════════════════════════════════════
// DELIVERY SYSTEM — Email (Resend) + SMS (Fast2SMS)
// 20-Point Zero-Fail Architecture v2
// ═══════════════════════════════════════════════════════════════

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['error' => 'POST only']);
    exit;
}

// ── API Keys ──
$RESEND_API_KEY  = 're_Kodasp4R_6yoTk5VwaTxYrGovqvmUPzWv';
$FAST2SMS_KEY    = 'U8nhADIKyGtkqmjxu74JZCYWaRQ03BEo6iON9z5lHrf12gLFMepavm4t9W51sjBVfFqGlb6TJC2SUYxd';
$FROM_EMAIL      = 'Vikram Presence <onboarding@resend.dev>';
$SITE_URL        = 'https://vikrampresence.shop';

// ── Parse input ──
$input = json_decode(file_get_contents('php://input'), true);
$email       = $input['email'] ?? '';
$phone       = $input['phone'] ?? '';
$productName = $input['productName'] ?? '';
$driveLink   = $input['driveLink'] ?? '';
$paymentId   = $input['paymentId'] ?? '';

if (!$email || !$productName || !$driveLink) {
    http_response_code(400);
    echo json_encode(['error' => 'email, productName, driveLink required']);
    exit;
}

$results = ['emailSent' => false, 'smsSent' => false];

// ═══════════════════════════════════════════════
// PHASE 1: SEND EMAIL via Resend API
// ═══════════════════════════════════════════════
try {
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
        ACCESS YOUR PRODUCT
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

    $emailPayload = json_encode([
        'from'    => $FROM_EMAIL,
        'to'      => [$email],
        'subject' => "Your $productName is ready! 🎉 — Vikram Presence",
        'html'    => $htmlBody,
    ]);

    $ch = curl_init('https://api.resend.com/emails');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $emailPayload,
        CURLOPT_HTTPHEADER     => [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $RESEND_API_KEY,
        ],
        CURLOPT_TIMEOUT => 10,
    ]);

    $emailResponse = curl_exec($ch);
    $emailHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($emailHttpCode >= 200 && $emailHttpCode < 300) {
        $results['emailSent'] = true;
        error_log("[DELIVERY] ✅ Email sent to $email");
    } else {
        error_log("[DELIVERY] ❌ Email failed (HTTP $emailHttpCode): $emailResponse");
    }
} catch (Exception $e) {
    error_log("[DELIVERY] ❌ Email exception: " . $e->getMessage());
}

// ═══════════════════════════════════════════════
// PHASE 2: SEND SMS via Fast2SMS API
// 
// Point 3: Exact message template
// Point 7-8: Title truncation (max 18 chars)
// Point 11: Short branded link
// Point 13-15: Phone sanitization
// Point 17-18: Non-blocking, fault-tolerant
// ═══════════════════════════════════════════════
try {
    if (!empty($phone) && !empty($FAST2SMS_KEY)) {

        // ── Phone Sanitization (Points 13-15) ──
        $cleanPhone = preg_replace('/[^0-9]/', '', $phone);
        if (strlen($cleanPhone) > 10) {
            $cleanPhone = substr($cleanPhone, -10);
        }

        if (strlen($cleanPhone) !== 10) {
            error_log("[DELIVERY] ⚠️ Invalid phone: '$phone' → '$cleanPhone'. Skipping SMS.");
        } else {

            // ── Title Truncation (Points 7-8) ──
            $shortTitle = $productName;
            if (mb_strlen($shortTitle) > 18) {
                $shortTitle = mb_substr($shortTitle, 0, 18) . '..';
            }

            // ── Short Branded Link (Points 10-12) ──
            $shortLink = $SITE_URL . '/t/' . ($paymentId ?: 'success');

            // ── Exact Message (Point 3) ──
            // Format: "Thank you for purchasing [Book]! Access it here: [Link] - Vikram Presence"
            $smsMessage = "Thank you for purchasing {$shortTitle}! Access it here: {$shortLink} - Vikram Presence";

            // ── Fast2SMS Payload (Point 16) ──
            $smsPayload = json_encode([
                'route'    => 'q',
                'message'  => $smsMessage,
                'language' => 'english',
                'flash'    => 0,
                'numbers'  => $cleanPhone,
            ]);

            $ch = curl_init('https://www.fast2sms.com/dev/bulkV2');
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST           => true,
                CURLOPT_POSTFIELDS     => $smsPayload,
                CURLOPT_HTTPHEADER     => [
                    'Content-Type: application/json',
                    'authorization: ' . $FAST2SMS_KEY,
                ],
                CURLOPT_TIMEOUT => 10,
            ]);

            $smsResponse = curl_exec($ch);
            $smsHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            $smsData = json_decode($smsResponse, true);

            if (isset($smsData['return']) && $smsData['return'] === true) {
                $results['smsSent'] = true;
                error_log("[DELIVERY] ✅ SMS sent to $cleanPhone: $smsMessage");
            } else {
                $errorMsg = $smsData['message'] ?? $smsResponse ?? 'Unknown';
                error_log("[DELIVERY] ❌ Fast2SMS error (HTTP $smsHttpCode): $errorMsg");
            }
        }
    } else {
        if (empty($phone)) error_log("[DELIVERY] ⚠️ No phone — skipping SMS");
    }
} catch (Exception $e) {
    // Points 19-20: SMS failure NEVER crashes the API
    error_log("[DELIVERY] ❌ SMS exception: " . $e->getMessage());
}

// ═══════════════════════════════════════════════
// RESPONSE — Always 200 OK to frontend
// ═══════════════════════════════════════════════
echo json_encode([
    'success'   => true,
    'emailSent' => $results['emailSent'],
    'smsSent'   => $results['smsSent'],
    'message'   => 'Delivery processed',
]);
