<?php

declare(strict_types=1);

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed. Use POST.',
    ]);
    exit;
}

require_once __DIR__ . '/config.php';

function firstSelectedValue(mixed $value): string
{
    if (is_array($value)) {
        foreach ($value as $item) {
            $normalized = trim((string)$item);
            if ($normalized !== '') {
                return $normalized;
            }
        }

        return '';
    }

    return trim((string)$value);
}

function sendWhatsAppConfirmation(string $whatsapp, string $firstName): void
{
    $phone = preg_replace('/[^\d]/', '', $whatsapp);
    if ($phone === '') {
        return;
    }

    $chatId = $phone . '@c.us';

    $message = "Hello *{$firstName}*, 🌸\n\n"
        . "Thank you for registering for the *BraWorld Free Bra Giveaway*. Your entry has been successfully received, and you are now part of the raffle draw. 🎉\n\n"
        . "The lucky winner will receive a *professional bra fitting and a beautiful high-quality bra courtesy of BraWorld*.\n\n"
        . "Stay tuned on *@braworld* as we will announce the lucky winner soon.\n\n"
        . "Thank you for being part of the BraWorld community! 🤗\n\n"
        . "👉 *While you wait, here are some beautiful options you could win*. We sell brand new bras from renowned international lingerie brands. "
        . "It's the same high-quality bras you would find in major retail stores in the US and UK, but at prices that are often more affordable than what many people pay internationally.";

    $url = 'https://7105.api.greenapi.com/waInstance7105498974/sendMessage/46a94059e2954d4f91d3b8e09567733949b95461ba06493981';

    $payload = json_encode([
        'chatId' => $chatId,
        'message' => $message,
    ]);

    $options = [
        'http' => [
            'header' => "Content-Type: application/json\r\n",
            'method' => 'POST',
            'content' => $payload,
            'timeout' => 10,
            'ignore_errors' => true,
        ],
    ];

    $context = stream_context_create($options);
    file_get_contents($url, false, $context);
}

$rawBody = file_get_contents('php://input');
$payload = json_decode($rawBody ?: '', true);

if (!is_array($payload)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request payload.',
    ]);
    exit;
}

$firstName = trim((string)($payload['firstName'] ?? ''));
$lastName = trim((string)($payload['lastName'] ?? ''));
$instagram = trim((string)($payload['instagram'] ?? ''));
$tiktok = trim((string)($payload['tiktok'] ?? ''));
$facebook = trim((string)($payload['facebook'] ?? ''));
$braSize = trim((string)($payload['braSize'] ?? ''));
$whatsapp = trim((string)($payload['whatsapp'] ?? ''));
$sourceOther = trim((string)($payload['sourceOther'] ?? ''));

$knowSize = firstSelectedValue($payload['knowSize'] ?? '');
$country = firstSelectedValue($payload['country'] ?? '');
$qualification = $payload['qualification'] ?? [];
$source = firstSelectedValue($payload['source'] ?? '');
$consent = !empty($payload['consent']) ? 1 : 0;

if (!is_array($qualification)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'One or more multi-select fields are invalid.',
    ]);
    exit;
}

if ($source === 'other' && $sourceOther !== '') {
    $source = 'other: ' . $sourceOther;
}

try {
    $pdo = getDatabaseConnection();

    $statement = $pdo->prepare(
        'INSERT INTO giveaway (
            first_name,
            last_name,
            instagram,
            tiktok,
            facebook,
            know_size,
            bra_size,
            country,
            whatsapp,
            qualification,
            source,
            consent
        ) VALUES (
            :first_name,
            :last_name,
            :instagram,
            :tiktok,
            :facebook,
            :know_size,
            :bra_size,
            :country,
            :whatsapp,
            :qualification,
            :source,
            :consent
        )'
    );

    $statement->execute([
        ':first_name' => $firstName,
        ':last_name' => $lastName,
        ':instagram' => $instagram,
        ':tiktok' => $tiktok,
        ':facebook' => $facebook,
        ':know_size' => $knowSize,
        ':bra_size' => $braSize,
        ':country' => $country,
        ':whatsapp' => $whatsapp,
        ':qualification' => json_encode(array_values($qualification)),
        ':source' => $source,
        ':consent' => $consent,
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Entry submitted successfully.',
        'entryId' => (int)$pdo->lastInsertId(),
    ]);

    sendWhatsAppConfirmation($whatsapp, $firstName);
} catch (Throwable $exception) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Unable to save entry. Check your database settings.',
        'error' => $exception->getMessage(),
    ]);
}
