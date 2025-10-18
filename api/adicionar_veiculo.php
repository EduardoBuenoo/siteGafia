<?php
// api/adicionar_veiculo.php
require_once 'db_connection.php';
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) { /* ... verificação de segurança ... */ }

$data = json_decode(file_get_contents('php://input'), true);
$userId = $_SESSION['user_id'];
// Supondo que você enviará marca, modelo, ano e tipo
$marcaId = $data['marca_id'];
$modeloId = $data['modelo_id'];
$ano = $data['ano'];
$tipo = $data['tipo'];

try {
    $pdo->beginTransaction();

    // 1. Insere o carro na tabela 'carro'
    $sqlCarro = "INSERT INTO carro (ano_carro, id_marca, id_modelo, tipo) VALUES (:ano, :marca, :modelo, :tipo)";
    $stmtCarro = $pdo->prepare($sqlCarro);
    $stmtCarro->execute([':ano' => $ano, ':marca' => $marcaId, ':modelo' => $modeloId, ':tipo' => $tipo]);
    $carroId = $pdo->lastInsertId(); // Pega o ID do carro que acabamos de criar

    // 2. Associa o carro ao usuário na tabela 'garagem'
    $sqlGaragem = "INSERT INTO garagem (id_usuario, id_carro) VALUES (:user, :carro)";
    $stmtGaragem = $pdo->prepare($sqlGaragem);
    $stmtGaragem->execute([':user' => $userId, ':carro' => $carroId]);

    $pdo->commit();
    echo json_encode(['message' => 'Veículo adicionado com sucesso!']);
} catch (PDOException $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['error' => 'Erro ao adicionar veículo.']);
}
?>