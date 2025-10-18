<?php
// api/atualizar_perfil.php
require_once 'db_connection.php';
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) { /* ... verificação de segurança ... */ }

$data = json_decode(file_get_contents('php://input'), true);
$userId = $_SESSION['user_id'];

// Validação dos dados recebidos (pode adicionar mais)
$nome = $data['nome'] ?? '';
$sobrenome = $data['sobrenome'] ?? '';
$telefone = $data['telefone'] ?? '';

try {
    $sql = "UPDATE usuarios SET nome = :nome, sobrenome = :sobrenome, telefone = :telefone WHERE id_usuario = :id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':nome' => $nome,
        ':sobrenome' => $sobrenome,
        ':telefone' => $telefone,
        ':id' => $userId
    ]);

    // Atualiza o nome na sessão para que o menu seja atualizado no próximo refresh
    $_SESSION['user_name'] = $nome;

    echo json_encode(['message' => 'Perfil atualizado com sucesso!']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erro ao atualizar o perfil.']);
}
?>