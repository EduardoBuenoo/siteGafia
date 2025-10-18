<?php
// api/buscar_veiculos.php
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
    $sql = "SELECT c.id_carro, c.ano_carro, c.tipo, m.nm_marca, mo.nm_modelo
            FROM carro c
            JOIN garagem g ON c.id_carro = g.id_carro
            JOIN marca m ON c.id_marca = m.id_marca
            JOIN modelo mo ON c.id_modelo = mo.id_modelo
            WHERE g.id_usuario = :userid";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([':userid' => $userId]);
    $veiculos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($veiculos);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erro ao buscar veículos.']);
}
?>