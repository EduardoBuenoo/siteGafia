<?php
// api/meus_veiculos.php
require_once 'db_connection.php';
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(403);
    echo json_encode(['error' => 'Acesso não autorizado']);
    exit;
}

$userId = $_SESSION['user_id'];

// Se a requisição for POST, adiciona um veículo à garagem
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $carroId = $data['carro_id'] ?? null;

    if (!$carroId) {
        http_response_code(400);
        echo json_encode(['error' => 'ID do carro não fornecido.']);
        exit;
    }

    try {
        $sql = "INSERT INTO garagem (id_usuario, id_carro) VALUES (:user_id, :carro_id)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':user_id' => $userId, ':carro_id' => $carroId]);
        echo json_encode(['message' => 'Veículo adicionado à sua garagem!']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Erro ao adicionar veículo. Verifique se já não o adicionou.']);
    }
    exit;
}

// Se a requisição for GET, busca os veículos da garagem
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $sql = "SELECT c.id_carro, c.ano_carro, m.nm_marca, mo.nm_modelo
                FROM carro c
                JOIN garagem g ON c.id_carro = g.id_carro
                JOIN marca m ON c.id_marca = m.id_marca
                JOIN modelo mo ON c.id_modelo = mo.id_modelo
                WHERE g.id_usuario = :user_id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':user_id' => $userId]);
        $veiculos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($veiculos);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Erro ao buscar seus veículos.']);
    }
    exit;
}
?>