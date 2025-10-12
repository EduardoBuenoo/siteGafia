<?php
// api/logout.php
session_start();

// Limpa todas as variáveis da sessão
session_unset();

// Destrói a sessão
session_destroy();

// Redireciona de volta para a página inicial
header('Location: ../index.html');
exit();
?>