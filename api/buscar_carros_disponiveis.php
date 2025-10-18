<?php
// api/buscar_carros_disponiveis.php
require_once 'db_connection.php';
header('Content-Type: application/json');

try {
    // Junta as tabelas carro, marca e modelo para criar uma lista amigável
    $sql = "SELECT c.id_carro, c.ano_carro, m.nm_marca, mo.nm_modelo
            FROM carro c
            JOIN marca m ON c.id_marca = m.id_marca
            JOIN modelo mo ON c.id_modelo = mo.id_modelo
            ORDER BY m.nm_marca, mo.nm_modelo, c.ano_carro DESC";
    
    $stmt = $pdo->query($sql);
    $carros = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($carros);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erro ao buscar lista de carros.']);
}
?>