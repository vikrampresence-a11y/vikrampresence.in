<?php
/**
 * ═════════════════════════════════════════════════════════════════
 * VIKRAM PRESENCE — NATIVE PHP BACKEND API
 * ═════════════════════════════════════════════════════════════════
 * Replaces the Node.js backend for Hostinger Shared Web Hosting.
 * Handles:
 * 1. 6-Digit OTP Generation & Emailing via Gmail SMTP
 * 2. Razorpay Order Creation
 * 3. Razorpay Payment Verification & Fulfillment Email
 * ═════════════════════════════════════════════════════════════════
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ─── CONFIGURATION ───
define('GMAIL_USER', 'vikrampresence@gmail.com');
define('GMAIL_PASS', 'afpp hsst zfar zpaq'); // Verified App Password
define('RAZORPAY_KEY', 'rzp_live_SKSh64mq33En2x');
define('RAZORPAY_SECRET', 'F8062a2mw4yjR6BjdKivcOkt');

// Simple File-based DB for OTPs (Stored safely in a JSON file)
$db_file = __DIR__ . '/otps.json';

// SMTP Client to bypass need for Composer/PHPMailer on Hostinger
function send_gmail_smtp($to, $subject, $body) {
    $context = stream_context_create([
        'ssl' => [
            'verify_peer' => false,
            'verify_peer_name' => false,
            'allow_self_signed' => true
        ]
    ]);
    
    $socket = stream_socket_client('ssl://smtp.gmail.com:465', $errno, $errstr, 15, STREAM_CLIENT_CONNECT, $context);
    if (!$socket) {
        error_log("[SMTP Error] Connection failed: $errstr");
        return false;
    }

    $res = fread($socket, 512);
    fputs($socket, "EHLO hostinger\r\n"); $res .= fread($socket, 512);
    fputs($socket, "AUTH LOGIN\r\n"); $res .= fread($socket, 512);
    fputs($socket, base64_encode(GMAIL_USER) . "\r\n"); $res .= fread($socket, 512);
    fputs($socket, base64_encode(GMAIL_PASS) . "\r\n"); $res .= fread($socket, 512);
    
    if (strpos($res, '235') === false) {
        error_log("[SMTP Error] Auth failed: " . $res);
    }

    fputs($socket, "MAIL FROM: <" . GMAIL_USER . ">\r\n"); fread($socket, 512);
    fputs($socket, "RCPT TO: <$to>\r\n"); fread($socket, 512);
    fputs($socket, "DATA\r\n"); fread($socket, 512);

    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    $headers .= "From: Vikram Presence <" . GMAIL_USER . ">\r\n";
    $headers .= "To: <$to>\r\n";
    $headers .= "Subject: $subject\r\n";

    fputs($socket, $headers . "\r\n" . $body . "\r\n.\r\n"); 
    $finalRes = fread($socket, 512);
    fputs($socket, "QUIT\r\n");
    fclose($socket);
    
    if (strpos($finalRes, '250') !== false) return true;
    error_log("[SMTP Error] Data failed: " . $finalRes);
    return false;
}

$input = json_decode(file_get_contents('php://input'), true);
$action = $input['action'] ?? '';

// ═════════════════════════════════════════════════════════
// 1. SEND 6-DIGIT OTP
// ═════════════════════════════════════════════════════════
if ($action === 'send_otp') {
    $email = $input['email'] ?? '';
    if (!$email) { echo json_encode(['success' => false, 'error' => 'Email required']); exit; }

    // Generate Secure 6-digit OTP
    $otp = sprintf("%06d", mt_rand(100000, 999999));
    
    $db = file_exists($db_file) ? json_decode(file_get_contents($db_file), true) : [];
    $db[$email] = ['otp' => $otp, 'expires' => time() + 300]; // 5 mins TTL
    file_put_contents($db_file, json_encode($db));

    $html = "
    <div style='background:#0a0a0c;color:#fff;padding:60px 40px;text-align:center;font-family:Helvetica, Arial, sans-serif;'>
        <h1 style='color:#E2F034;letter-spacing:4px;text-transform:uppercase;font-size:20px;'>Vikram Presence</h1>
        <p style='color:#888;font-size:12px;text-transform:uppercase;letter-spacing:2px;margin-top:30px;'>Verification Code</p>
        <div style='background:#121215;border:1px solid rgba(226,240,52,0.2);display:inline-block;padding:20px 40px;border-radius:12px;margin:20px 0;'>
            <h2 style='font-size:42px;letter-spacing:14px;color:#E2F034;margin:0;font-family:monospace;'>$otp</h2>
        </div>
        <p style='color:#555;font-size:12px;margin-top:20px;'>Valid for 5 minutes. Do not share this code.</p>
    </div>";

    $sent = send_gmail_smtp($email, "Your 6-Digit Secure Verification Code", $html);
    if($sent) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Could not send email via SMTP']);
    }
    exit;
}

// ═════════════════════════════════════════════════════════
// 2. VERIFY 6-DIGIT OTP
// ═════════════════════════════════════════════════════════
if ($action === 'verify_otp') {
    $email = $input['email'] ?? '';
    $otp = $input['otp'] ?? '';

    $db = file_exists($db_file) ? json_decode(file_get_contents($db_file), true) : [];
    if (isset($db[$email]) && $db[$email]['otp'] === $otp && $db[$email]['expires'] > time()) {
        unset($db[$email]); // delete OTP to prevent reuse
        file_put_contents($db_file, json_encode($db));
        
        // Return simulated user token for frontend React context
        echo json_encode([
            'verified' => true,
            'token' => 'php_auth_' . bin2hex(random_bytes(16)),
            'user' => ['id' => 'hostinger_' . time(), 'email' => $email, 'verified' => true, 'name' => explode('@', $email)[0]]
        ]);
    } else {
        http_response_code(400);
        echo json_encode(['verified' => false, 'error' => 'Invalid or expired OTP']);
    }
    exit;
}

// ═════════════════════════════════════════════════════════
// 3. CREATE RAZORPAY ORDER
// ═════════════════════════════════════════════════════════
if ($action === 'create_order') {
    $amount = floatval($input['amount'] ?? 0);
    $ch = curl_init('https://api.razorpay.com/v1/orders');
    curl_setopt($ch, CURLOPT_USERPWD, RAZORPAY_KEY . ':' . RAZORPAY_SECRET);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        'amount' => $amount * 100, // in paise
        'currency' => 'INR',
        'receipt' => 'receipt_' . time()
    ]));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    $data = json_decode($response, true);
    if($httpCode == 200 && isset($data['id'])) {
        echo json_encode(['orderId' => $data['id'], 'amount' => $data['amount'], 'currency' => $data['currency']]);
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Failed to create order', 'details' => $data]);
    }
    exit;
}

// ═════════════════════════════════════════════════════════
// 4. VERIFY PAYMENT & FULFILL
// ═════════════════════════════════════════════════════════
if ($action === 'verify_payment') {
    $orderId = $input['orderId'] ?? '';
    $paymentId = $input['paymentId'] ?? '';
    $signature = $input['signature'] ?? '';
    
    $generatedSignature = hash_hmac('sha256', $orderId . '|' . $paymentId, RAZORPAY_SECRET);
    
    if ($generatedSignature === $signature) {
        $buyerEmail = $input['buyerEmail'];
        $productName = $input['productName'];
        $googleDriveLink = $input['googleDriveLink'];

        $html = "
        <div style='background:#0a0a0c;color:#fff;padding:60px 40px;text-align:center;font-family:Helvetica, Arial, sans-serif;'>
            <div style='font-size:40px;margin-bottom:20px;'>🎉</div>
            <h1 style='color:#E2F034;letter-spacing:2px;'>Payment Successful</h1>
            <h2 style='color:#fff;margin-bottom:40px;font-weight:300;'>$productName</h2>
            <a href='$googleDriveLink' style='display:inline-block;background:#E2F034;color:#000;padding:18px 40px;text-decoration:none;font-weight:bold;text-transform:uppercase;letter-spacing:2px;border-radius:50px;'>Access Your Product -></a>
            <p style='color:#555;font-size:12px;margin-top:30px;'>Save this email for permanent access.</p>
        </div>";

        send_gmail_smtp($buyerEmail, "Your Product is Ready: $productName", $html);
        
        // Return fulfillment success
        echo json_encode(['success' => true, 'productLink' => $googleDriveLink]);
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Signature mismatch']);
    }
    exit;
}
// ═════════════════════════════════════════════════════════
// 5. SEND CUSTOM EMAIL (Admin Emailer)
// ═════════════════════════════════════════════════════════
if ($action === 'send_custom_email') {
    $email = $input['email'] ?? '';
    $subject = $input['subject'] ?? '';
    $body = $input['body'] ?? '';

    if (!$email || !$subject || !$body) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'email, subject, and body required']);
        exit;
    }

    $html = "
    <div style='background:#0a0a0c;color:#fff;padding:60px 40px;font-family:Helvetica, Arial, sans-serif;'>
        $body
        <hr style='border:none;border-top:1px solid #222;margin:40px 0;'>
        <p style='color:#555;font-size:11px;text-align:center;'>Sent from Vikram Presence Admin</p>
    </div>";

    $sent = send_gmail_smtp($email, $subject, $html);
    echo json_encode(['success' => $sent]);
    exit;
}

http_response_code(400);
echo json_encode(['error' => 'Invalid action specified']);
?>
