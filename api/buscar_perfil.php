<?php
// api/buscar_perfil.php
require_once 'db_connection.php';
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(403);
    echo json_encode(['error' => 'Acesso não autorizado']);
    exit;
}

$userId = $_SESSION['user_id'];

try {
    // Busca todos os dados do utilizador, exceto a senha
    $sql = "SELECT nome, sobrenome, email, cpf, telefone, dt_nasc FROM usuarios WHERE id_usuario = :id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':id' => $userId]);
    $perfil = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode($perfil);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erro ao buscar dados do perfil.']);
}
?>