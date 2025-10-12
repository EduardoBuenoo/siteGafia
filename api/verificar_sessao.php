<?php
// api/verificar_sessao.php
session_start();
header('Content-Type: application/json');

if (isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true) {
    // Se o utilizador tem sessão iniciada, envia os seus dados
    echo json_encode([
        'loggedIn' => true,
        'userId' => $_SESSION['user_id'],
        'userName' => $_SESSION['user_name']
    ]);
} else {
    // Se não tem sessão iniciada
    echo json_encode(['loggedIn' => false]);
}
?>