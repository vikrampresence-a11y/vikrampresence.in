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
$FROM_EMAIL      = 'Vikram Presence <hello@vikrampresence.shop>';
$REPLY_TO        = 'vikrampresence3280@gmail.com';
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
// Verified domain: vikrampresence.shop
// ═══════════════════════════════════════════════
try {
    // Plain text version (critical for spam avoidance)
    $textBody = "Hi there,\n\nThank you for purchasing $productName from Vikram Presence.\n\nAccess your product here: $driveLink\n\n" . ($paymentId ? "Payment ID: $paymentId\n\n" : "") . "If you have any questions, reply to this email.\n\nBest,\nVikram Presence\nhttps://vikrampresence.shop";

    $htmlBody = '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f9f9f9;font-family:Georgia,Times,serif;">
  <div style="max-width:580px;margin:0 auto;padding:40px 20px;">
    <div style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
      
      <div style="background:#1a1a1a;padding:28px;text-align:center;">
        <h1 style="color:#FFD700;font-size:22px;margin:0;letter-spacing:1px;font-weight:600;">Vikram Presence</h1>
      </div>
      
      <div style="padding:36px 32px;text-align:center;">
        <p style="color:#2d2d2d;font-size:15px;line-height:1.7;margin:0 0 8px;">Hi there,</p>
        <p style="color:#2d2d2d;font-size:15px;line-height:1.7;margin:0 0 24px;">
          Thank you for purchasing <strong>' . htmlspecialchars($productName) . '</strong>. Your product is ready to access.
        </p>
        
        <a href="' . htmlspecialchars($driveLink) . '" 
           style="display:inline-block;background:#1a1a1a;color:#FFD700;padding:14px 36px;font-size:14px;font-weight:600;text-decoration:none;border-radius:8px;letter-spacing:0.5px;">
          Access your product
        </a>
        
        <p style="color:#888;font-size:13px;margin:24px 0 0;line-height:1.5;">
          Or copy this link: <a href="' . htmlspecialchars($driveLink) . '" style="color:#1a1a1a;">' . htmlspecialchars($driveLink) . '</a>
        </p>
        
        ' . ($paymentId ? '<p style="color:#aaa;font-size:11px;margin:16px 0 0;">Payment ref: ' . htmlspecialchars($paymentId) . '</p>' : '') . '
      </div>
      
      <div style="border-top:1px solid #eee;padding:20px 32px;text-align:center;">
        <p style="color:#999;font-size:11px;margin:0;line-height:1.5;">
          This email confirms your purchase. Save it for your records.<br>
          Questions? Reply to this email.
        </p>
        <p style="color:#ccc;font-size:10px;margin:10px 0 0;">
          Vikram Presence &middot; <a href="https://vikrampresence.shop" style="color:#ccc;">vikrampresence.shop</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>';

    $emailPayload = json_encode([
        'from'     => $FROM_EMAIL,
        'to'       => [$email],
        'reply_to' => $REPLY_TO,
        'subject'  => "Your $productName is ready - Vikram Presence",
        'html'     => $htmlBody,
        'text'     => $textBody,
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
        CURLOPT_TIMEOUT        => 15,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_SSL_VERIFYHOST => 0,
    ]);

    $emailResponse = curl_exec($ch);
    $emailHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($curlError) {
        $results['emailDebug'] = "CURL Error: $curlError";
        error_log("[DELIVERY] ❌ Email curl error: $curlError");
    } elseif ($emailHttpCode >= 200 && $emailHttpCode < 300) {
        $results['emailSent'] = true;
        error_log("[DELIVERY] ✅ Email sent to $email");
    } else {
        $results['emailDebug'] = "HTTP $emailHttpCode: $emailResponse";
        error_log("[DELIVERY] ❌ Email failed (HTTP $emailHttpCode): $emailResponse");
    }
} catch (Exception $e) {
    $results['emailDebug'] = 'Exception: ' . $e->getMessage();
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
