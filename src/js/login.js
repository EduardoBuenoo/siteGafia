// src/js/login.js

document.addEventListener('DOMContentLoaded', () => {
    const formLogin = document.getElementById('form-login');

    if (formLogin) {
        formLogin.addEventListener('submit', async (event) => {
            event.preventDefault();

            const email = document.getElementById('email').value;
            const senha = document.getElementById('senha').value;

            try {
                const response = await fetch('api/login.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, senha })
                });

                const data = await response.json();

                if (response.ok) {
                    alert('Login realizado com sucesso! Redirecionando...');
                    // Crie esta página depois, será a área logada do seu site
                    window.location.href = 'index.html'; 
                } else {
                    alert(`Erro: ${data.error}`);
                }

            } catch (error) {
                console.error('Erro de comunicação:', error);
                alert('Ocorreu um erro de comunicação com o servidor.');
            }
        });
    }
});
