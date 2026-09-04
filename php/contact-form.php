<?php
/**
 * Contact Form Handler
 * Compatible with standard Bluehost shared PHP hosting
 * IMPORTANT: Replace the $recipient variable below with your real email address.
 */

/* ── CORS / JSON HEADER ──────────────────────────────── */
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

/* ── ONLY ACCEPT POST ────────────────────────────────── */
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

/* ── CONFIGURATION ────────────────────────────────────
 * REPLACE WITH YOUR REAL EMAIL ADDRESS
 * ────────────────────────────────────────────────── */
$recipient    = 'Jacques.Yiryassa.Sawadogo@USherbrooke.ca';  // <-- CHANGE THIS
$from_name    = '[Jacques Yiryassa Sawadogo] — Website Contact';
$subject_prefix = '[Website Contact] ';

/* ── RATE-LIMIT HONEYPOT ─────────────────────────────── */
// If a bot fills the hidden field, silently discard
if (!empty($_POST['website'])) {
    echo json_encode(['success' => true, 'message' => 'Thank you. Your message has been sent.']);
    exit;
}

/* ── SANITIZE HELPER ─────────────────────────────────── */
function sanitize(string $value): string {
    $value = trim($value);
    $value = stripslashes($value);
    $value = htmlspecialchars($value, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    // Remove any header injection attempts
    $value = preg_replace('/[\r\n]/', ' ', $value);
    return $value;
}

/* ── COLLECT & VALIDATE ──────────────────────────────── */
$errors = [];

$name    = sanitize($_POST['name']    ?? '');
$email   = sanitize($_POST['email']   ?? '');
$subject = sanitize($_POST['subject'] ?? '');
$message = sanitize($_POST['message'] ?? '');

// Validate name
if (mb_strlen($name) < 2 || mb_strlen($name) > 100) {
    $errors[] = 'Name must be between 2 and 100 characters.';
}

// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email) > 254) {
    $errors[] = 'Please provide a valid email address.';
}

// Validate subject
if (mb_strlen($subject) < 3 || mb_strlen($subject) > 200) {
    $errors[] = 'Subject must be between 3 and 200 characters.';
}

// Validate message
if (mb_strlen($message) < 10 || mb_strlen($message) > 5000) {
    $errors[] = 'Message must be between 10 and 5000 characters.';
}

// Block obviously malicious patterns
$blocked = ['<script', 'javascript:', 'vbscript:', 'content-type:', 'bcc:', 'cc:', 'to:'];
foreach ($blocked as $pattern) {
    if (stripos($name . $subject . $message, $pattern) !== false) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Your message contains disallowed content.']);
        exit;
    }
}

/* ── RETURN ERRORS ───────────────────────────────────── */
if (!empty($errors)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => implode(' ', $errors)]);
    exit;
}

/* ── BUILD AND SEND EMAIL ────────────────────────────── */
$email_subject = $subject_prefix . $subject;

$email_body  = "You have received a new contact form submission from your website.\n\n";
$email_body .= "---------------------------------------------------\n";
$email_body .= "Name:    " . $name . "\n";
$email_body .= "Email:   " . $email . "\n";
$email_body .= "Subject: " . $subject . "\n";
$email_body .= "---------------------------------------------------\n\n";
$email_body .= "Message:\n\n" . $message . "\n\n";
$email_body .= "---------------------------------------------------\n";
$email_body .= "Sent from: " . ($_SERVER['HTTP_HOST'] ?? 'your website') . "\n";
$email_body .= "Date:      " . date('Y-m-d H:i:s') . " UTC\n";

// RFC 2822 compliant headers — avoid header injection
$safe_from_email = filter_var($email, FILTER_SANITIZE_EMAIL);
$headers  = "From: {$from_name} <{$recipient}>\r\n";
$headers .= "Reply-To: {$name} <{$safe_from_email}>\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "Content-Transfer-Encoding: 8bit\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";

$sent = mail($recipient, $email_subject, $email_body, $headers);

/* ── RESPOND ─────────────────────────────────────────── */
if ($sent) {
    echo json_encode([
        'success' => true,
        'message' => 'Your message has been sent successfully. I will get back to you as soon as possible.'
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'The message could not be sent due to a server configuration issue. Please contact me by email directly.'
    ]);
}
