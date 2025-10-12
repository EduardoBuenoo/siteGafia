<?php

	// Conexão com o Banco De Dados

	$host = 'dpg-cvriq3be5dus738a7r3g-a.oregon-postgres.render.com';
	$dbname = 'dbgafia_tp8h';
	$user = 'dbgafia_tp8h_user';
	$password = 'YcBpnDhYNSD1OzYdr2Rijt3jEEiZJhOa';
	$port = '5432';

	//Cria uma linha de conexão
	$dsn = "pgsql:host={$host} port={$port} dbname={$dbname} user={$user} password={$password} sslmode=require";

	try {
		// Criando a instância do PDO
		$pdo = new PDO($dsn, $user, $password);

		//Executando a conexão
		$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	} catch (PDOException $e) {
		// Se ocorrer erro na conexão
		die("Erro ao conectar com o banco de dados: " . $e->getMessage());
	}
 ?>