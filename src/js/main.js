// src/js/main.js

document.addEventListener('DOMContentLoaded', async () => {
    // Elementos dos menus
    const navGuest = document.getElementById('nav-guest');
    const navUser = document.getElementById('nav-user');
    const userGreeting = document.getElementById('user-greeting');

    try {
        // Faz uma chamada à API para verificar a sessão
        const response = await fetch('api/verificar_sessao.php');
        const session = await response.json();

        if (session.loggedIn) {
            // Se o utilizador tem sessão iniciada...
            navGuest.style.display = 'none';  // Esconde o menu de visitante
            navUser.style.display = 'flex';   // Mostra o menu de utilizador
            // Personaliza a saudação
            userGreeting.textContent = `Olá, ${session.userName}!`;
        } else {
            // Se o utilizador NÃO tem sessão iniciada...
            navGuest.style.display = 'flex';  // Mostra o menu de visitante
            navUser.style.display = 'none';   // Esconde o menu de utilizador
        }
    } catch (error) {
        console.error('Erro ao verificar a sessão:', error);
        // Em caso de erro, mostra o menu de visitante por segurança
        navGuest.style.display = 'flex';
        navUser.style.display = 'none';
    }
});