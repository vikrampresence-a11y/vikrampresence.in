<?php
// ═══════════════════════════════════════════════════════════════
// DELIVERY SYSTEM — Gmail SMTP (PHPMailer-style) + Fast2SMS
// Resend PURGED. Pure Gmail SMTP via fsockopen/mail().
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

// ── Gmail SMTP Credentials ──
$GMAIL_USER     = 'vikramyeragadindla@gmail.com';
$GMAIL_APP_PASS = 'bbbl jycl ypov xpjy';
$FROM_NAME      = 'Vikram Presence';
$REPLY_TO       = 'vikramyeragadindla@gmail.com';
$SITE_URL       = 'https://vikrampresence.shop';

// ── Fast2SMS ──
$FAST2SMS_KEY   = 'U8nhADIKyGtkqmjxu74JZCYWaRQ03BEo6iON9z5lHrf12gLFMepavm4t9W51sjBVfFqGlb6TJC2SUYxd';

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
// PHASE 1: SEND EMAIL via Gmail SMTP
// Using PHP's mail() with proper headers
// ═══════════════════════════════════════════════
try {
    $subject = "Your $productName is Ready! 🎉 — Vikram Presence";
    
    $htmlBody = '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#080808;font-family:\'Helvetica Neue\',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    
    <div style="text-align:center;padding:30px 0;border-bottom:1px solid #1c1c1c;">
      <h1 style="color:#FFD700;font-size:24px;margin:0;letter-spacing:3px;text-transform:uppercase;">VIKRAM PRESENCE</h1>
      <p style="color:#555;font-size:10px;margin:8px 0 0;letter-spacing:3px;text-transform:uppercase;">Digital Product Delivery</p>
    </div>

    <div style="padding:40px 0;text-align:center;">
      <div style="background:#0e0e0e;border:1px solid rgba(255,215,0,0.15);border-radius:16px;padding:30px;margin-bottom:30px;">
        <div style="font-size:42px;margin-bottom:12px;">🎉</div>
        <p style="color:#FFD700;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin:0 0 12px;">Payment Successful</p>
        <h2 style="color:#ffffff;font-size:22px;margin:0;letter-spacing:-0.5px;">' . htmlspecialchars($productName) . '</h2>
        ' . ($paymentId ? '<p style="color:#444;font-size:10px;margin:8px 0 0;font-family:monospace;">Payment ID: ' . htmlspecialchars($paymentId) . '</p>' : '') . '
      </div>

      <p style="color:#999;font-size:15px;line-height:1.7;margin:0 0 30px;">
        Thank you for your purchase! Click the button below to access your product instantly.
      </p>

      <a href="' . htmlspecialchars($driveLink) . '" 
         style="display:inline-block;background:#FFD700;color:#000000;padding:16px 48px;font-size:14px;font-weight:800;text-decoration:none;border-radius:50px;letter-spacing:2px;text-transform:uppercase;">
        ACCESS YOUR PRODUCT →
      </a>

      <p style="color:#555;font-size:12px;margin:25px 0 0;line-height:1.6;">
        Direct link:<br>
        <a href="' . htmlspecialchars($driveLink) . '" style="color:#FFD700;word-break:break-all;font-size:11px;">' . htmlspecialchars($driveLink) . '</a>
      </p>
    </div>

    <div style="background:#0c0c0c;border:1px solid #1a1a1a;border-radius:12px;padding:20px;margin-bottom:20px;">
      <p style="color:#666;font-size:11px;margin:0;text-align:center;">
        Need help? Reply to this email or contact<br>
        <a href="mailto:vikramyeragadindla@gmail.com" style="color:#FFD700;">vikramyeragadindla@gmail.com</a>
      </p>
    </div>

    <div style="border-top:1px solid #1a1a1a;padding:25px 0;text-align:center;">
      <p style="color:#333;font-size:10px;margin:0;letter-spacing:1px;">Save this email — it\'s your permanent product access.</p>
      <p style="color:#222;font-size:9px;margin:8px 0 0;">© Vikram Presence. All rights reserved.</p>
    </div>

  </div>
</body>
</html>';

    // ── Send via Gmail SMTP using cURL ──
    $smtpResult = sendGmailSMTP($GMAIL_USER, $GMAIL_APP_PASS, $FROM_NAME, $email, $subject, $htmlBody, $REPLY_TO);
    
    if ($smtpResult === true) {
        $results['emailSent'] = true;
        error_log("[DELIVERY] ✅ Email sent to $email via Gmail SMTP");
    } else {
        error_log("[DELIVERY] ❌ Gmail SMTP failed: $smtpResult");
        
        // Fallback: try PHP mail()
        $headers  = "MIME-Version: 1.0\r\n";
        $headers .= "Content-type: text/html; charset=UTF-8\r\n";
        $headers .= "From: $FROM_NAME <$GMAIL_USER>\r\n";
        $headers .= "Reply-To: $REPLY_TO\r\n";
        
        if (mail($email, $subject, $htmlBody, $headers)) {
            $results['emailSent'] = true;
            error_log("[DELIVERY] ✅ Email sent to $email via PHP mail() fallback");
        } else {
            error_log("[DELIVERY] ❌ PHP mail() also failed for $email");
        }
    }
} catch (Exception $e) {
    error_log("[DELIVERY] ❌ Email exception: " . $e->getMessage());
}

// ═══════════════════════════════════════════════
// PHASE 2: SEND SMS via Fast2SMS API
// ═══════════════════════════════════════════════
try {
    if (!empty($phone) && !empty($FAST2SMS_KEY)) {
        $cleanPhone = preg_replace('/[^0-9]/', '', $phone);
        if (strlen($cleanPhone) > 10) {
            $cleanPhone = substr($cleanPhone, -10);
        }

        if (strlen($cleanPhone) !== 10) {
            error_log("[DELIVERY] ⚠️ Invalid phone: '$phone' → '$cleanPhone'. Skipping SMS.");
        } else {
            $shortTitle = $productName;
            if (mb_strlen($shortTitle) > 18) {
                $shortTitle = mb_substr($shortTitle, 0, 18) . '..';
            }

            $shortLink = $SITE_URL . '/t/' . ($paymentId ?: 'success');
            $smsMessage = "Thank you for purchasing {$shortTitle}! Access it here: {$shortLink} - Vikram Presence";

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
                error_log("[DELIVERY] ✅ SMS sent to $cleanPhone");
            } else {
                $errorMsg = $smsData['message'] ?? $smsResponse ?? 'Unknown';
                error_log("[DELIVERY] ❌ Fast2SMS error (HTTP $smsHttpCode): $errorMsg");
            }
        }
    }
} catch (Exception $e) {
    error_log("[DELIVERY] ❌ SMS exception: " . $e->getMessage());
}

// ═══════════════════════════════════════════════
// RESPONSE
// ═══════════════════════════════════════════════
echo json_encode([
    'success'   => true,
    'emailSent' => $results['emailSent'],
    'smsSent'   => $results['smsSent'],
    'message'   => 'Delivery processed via Gmail SMTP',
]);


// ═══════════════════════════════════════════════
// Gmail SMTP Function (using fsockopen)
// ═══════════════════════════════════════════════
function sendGmailSMTP($username, $password, $fromName, $to, $subject, $htmlBody, $replyTo) {
    $host = 'ssl://smtp.gmail.com';
    $port = 465;
    
    $fp = @fsockopen($host, $port, $errno, $errstr, 15);
    if (!$fp) {
        return "Connection failed: $errstr ($errno)";
    }
    
    $response = fgets($fp, 512);
    if (substr($response, 0, 3) !== '220') {
        fclose($fp);
        return "Server not ready: $response";
    }
    
    // EHLO
    fwrite($fp, "EHLO vikrampresence.shop\r\n");
    $response = '';
    while ($line = fgets($fp, 512)) {
        $response .= $line;
        if (substr($line, 3, 1) === ' ') break;
    }
    
    // AUTH LOGIN
    fwrite($fp, "AUTH LOGIN\r\n");
    fgets($fp, 512);
    
    fwrite($fp, base64_encode($username) . "\r\n");
    fgets($fp, 512);
    
    fwrite($fp, base64_encode($password) . "\r\n");
    $authResponse = fgets($fp, 512);
    
    if (substr($authResponse, 0, 3) !== '235') {
        fclose($fp);
        return "Auth failed: $authResponse";
    }
    
    // MAIL FROM
    fwrite($fp, "MAIL FROM:<$username>\r\n");
    fgets($fp, 512);
    
    // RCPT TO
    fwrite($fp, "RCPT TO:<$to>\r\n");
    fgets($fp, 512);
    
    // DATA
    fwrite($fp, "DATA\r\n");
    fgets($fp, 512);
    
    // Headers + Body
    $boundary = md5(time());
    $headers  = "From: $fromName <$username>\r\n";
    $headers .= "To: $to\r\n";
    $headers .= "Reply-To: $replyTo\r\n";
    $headers .= "Subject: $subject\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    $headers .= "X-Mailer: VikramPresence/1.0\r\n";
    $headers .= "\r\n";
    $headers .= $htmlBody;
    $headers .= "\r\n.\r\n";
    
    fwrite($fp, $headers);
    $dataResponse = fgets($fp, 512);
    
    // QUIT
    fwrite($fp, "QUIT\r\n");
    fclose($fp);
    
    if (substr($dataResponse, 0, 3) === '250') {
        return true;
    }
    
    return "Send failed: $dataResponse";
}
