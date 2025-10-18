document.addEventListener('DOMContentLoaded', () => {
    // Protege a página e carrega os dados
    fetch('api/verificar_sessao.php')
        .then(res => res.json())
        .then(session => {
            if (!session.loggedIn) {
                window.location.href = 'login.html'; // Redireciona se não houver sessão
            } else {
                carregarPerfil();
            }
        });

    // Evento de submissão do formulário
    document.getElementById('form-perfil').addEventListener('submit', async (e) => {
        e.preventDefault();
        const dadosAtualizados = {
            nome: document.getElementById('nome').value,
            sobrenome: document.getElementById('sobrenome').value,
            telefone: document.getElementById('telefone').value,
        };

        const response = await fetch('api/atualizar_perfil.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosAtualizados)
        });
        const result = await response.json();
        const mensagemEl = document.getElementById('perfil-mensagem');
        mensagemEl.textContent = result.message || result.error;
    });
});

async function carregarPerfil() {
    const response = await fetch('api/buscar_perfil.php');
    const data = await response.json();
    if(data.error) {
        alert(data.error);
        return;
    }

    // Preenche o formulário com os dados do utilizador
    document.getElementById('nome').value = data.nome;
    document.getElementById('sobrenome').value = data.sobrenome;
    document.getElementById('telefone').value = data.telefone;
    document.getElementById('email').value = data.email;
    document.getElementById('cpf').value = data.cpf;
}