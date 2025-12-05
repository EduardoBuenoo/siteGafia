<?php
// api/admin_veiculos.php
require_once 'db_connection.php';
session_start();
header('Content-Type: application/json');

// 1. Segurança: Apenas Admin
if (!isset($_SESSION['is_admin']) || $_SESSION['is_admin'] !== true) {
    http_response_code(403);
    echo json_encode(['error' => 'Acesso negado.']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

// --- LISTAR TODOS OS CARROS (GET) ---
if ($method === 'GET') {
    // Se passar ?action=marcas, retorna só as marcas para preencher o select
    if (isset($_GET['action']) && $_GET['action'] === 'marcas') {
        try {
            $stmt = $pdo->query("SELECT id_marca, nm_marca FROM marca ORDER BY nm_marca");
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        } catch (PDOException $e) {
            echo json_encode([]);
        }
        exit;
    }

    // Listagem padrão da frota
    try {
        $sql = "SELECT c.id_carro, c.ano_carro, c.dur_bat, m.nm_marca, mo.nm_modelo, c.id_marca, c.id_modelo
                FROM carro c
                JOIN marca m ON c.id_marca = m.id_marca
                JOIN modelo mo ON c.id_modelo = mo.id_modelo
                ORDER BY c.id_carro DESC";
        $stmt = $pdo->query($sql);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}

// --- CADASTRAR OU ATUALIZAR (POST/PUT) ---
if ($method === 'POST' || $method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Dados recebidos
    $idCarro      = $data['id_carro'] ?? null;
    $ano          = $data['ano'];
    $bateria      = $data['bateria'];
    
    // Lógica da Marca: Pode vir um ID (existente) ou um Nome (nova)
    $idMarca      = $data['id_marca'] ?? null;     // Do Select
    $novaMarca    = $data['nova_marca'] ?? null;   // Do Input de Texto
    
    // Lógica do Modelo: Vem o nome (texto)
    $nomeModelo   = $data['nome_modelo'] ?? null;

    if (!$ano || !$bateria || !$nomeModelo) {
        http_response_code(400);
        echo json_encode(['error' => 'Preencha ano, bateria e modelo.']);
        exit;
    }

    try {
        $pdo->beginTransaction();

        // 1. RESOLVER A MARCA
        // Se o usuário digitou uma "Nova Marca", criamos ela. Se não, usamos o ID do select.
        if (!empty($novaMarca)) {
            // Verifica se já existe para não duplicar (opcional, mas recomendado)
            $stmtCheck = $pdo->prepare("SELECT id_marca FROM marca WHERE nm_marca ILIKE :nm");
            $stmtCheck->execute([':nm' => $novaMarca]);
            $existingMarca = $stmtCheck->fetch(PDO::FETCH_ASSOC);

            if ($existingMarca) {
                $idMarca = $existingMarca['id_marca'];
            } else {
                $stmtM = $pdo->prepare("INSERT INTO marca (nm_marca) VALUES (:nm)");
                $stmtM->execute([':nm' => $novaMarca]);
                $idMarca = $pdo->lastInsertId();
            }
        }

        if (!$idMarca) {
            throw new Exception("Selecione uma marca existente ou digite uma nova.");
        }

        // 2. RESOLVER O MODELO
        // Conforme solicitado: sempre cria um novo modelo baseado no nome (ou busca se quiser evitar duplicidade)
        // Aqui vou buscar primeiro para evitar poluir o banco com "Dolphin", "Dolphin", "Dolphin".
        // Mas se a regra for "sempre novo", basta remover o SELECT abaixo.
        
        $stmtModCheck = $pdo->prepare("SELECT id_modelo FROM modelo WHERE nm_modelo ILIKE :nm");
        $stmtModCheck->execute([':nm' => $nomeModelo]);
        $existingModelo = $stmtModCheck->fetch(PDO::FETCH_ASSOC);

        if ($existingModelo) {
            $idModelo = $existingModelo['id_modelo'];
        } else {
            $stmtMod = $pdo->prepare("INSERT INTO modelo (nm_modelo) VALUES (:nm)");
            $stmtMod->execute([':nm' => $nomeModelo]);
            $idModelo = $pdo->lastInsertId();
        }

        // 3. INSERIR OU ATUALIZAR O CARRO
        if ($method === 'POST') {
            $sqlCarro = "INSERT INTO carro (ano_carro, dur_bat, id_marca, id_modelo) 
                         VALUES (:ano, :bat, :marca, :modelo)";
            $stmtC = $pdo->prepare($sqlCarro);
            $stmtC->execute([
                ':ano' => $ano,
                ':bat' => $bateria,
                ':marca' => $idMarca,
                ':modelo' => $idModelo
            ]);
            $msg = 'Veículo cadastrado com sucesso!';
        } 
        else { // PUT
            if (!$idCarro) throw new Exception("ID do carro necessário para edição.");
            
            $sqlCarro = "UPDATE carro SET 
                         ano_carro = :ano, dur_bat = :bat, id_marca = :marca, id_modelo = :modelo
                         WHERE id_carro = :id";
            $stmtC = $pdo->prepare($sqlCarro);
            $stmtC->execute([
                ':ano' => $ano,
                ':bat' => $bateria,
                ':marca' => $idMarca,
                ':modelo' => $idModelo,
                ':id' => $idCarro
            ]);
            $msg = 'Veículo atualizado com sucesso!';
        }

        $pdo->commit();
        echo json_encode(['message' => $msg]);

    } catch (Exception $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['error' => 'Erro: ' . $e->getMessage()]);
    }
}
?>