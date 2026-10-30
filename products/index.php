<?php
// Fallback for SPA routing if Hostinger/Apache reaches the /products/ directory directly
$spaIndex = __DIR__ . '/../index.html';
if (file_exists($spaIndex)) {
    include $spaIndex;
} else {
    header("Location: /products");
}
exit;
