document.addEventListener('DOMContentLoaded', () => {
    // Protege a página e carrega os dados
    fetch('api/verificar_sessao.php')
        .then(res => res.json())
        .then(session => {
            if (!session.loggedIn) {
                window.location.href = 'login.html'; // Redireciona se não houver sessão
            } else {
                carregarMeusVeiculos();
                carregarCarrosDisponiveis();
            }
        });

    // Evento de submissão do formulário
    document.getElementById('form-add-veiculo').addEventListener('submit', async (e) => {
        e.preventDefault();
        const carroId = document.getElementById('select-carro').value;
        if (!carroId) {
            alert('Por favor, selecione um veículo da lista.');
            return;
        }

        try {
            const response = await fetch('api/meus_veiculos.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ carro_id: carroId })
            });
            const result = await response.json();
            alert(result.message || result.error);
            if(response.ok) {
                carregarMeusVeiculos(); // Recarrega a lista da garagem
            }
        } catch (error) {
            alert('Erro de comunicação ao adicionar veículo.');
        }
    });
});

async function carregarMeusVeiculos() {
    const lista = document.getElementById('lista-veiculos');
    lista.innerHTML = '<p class="muted">A carregar sua garagem...</p>';

    try {
        const response = await fetch('api/meus_veiculos.php');
        const veiculos = await response.json();
        
        lista.innerHTML = ''; // Limpa a lista
        if (veiculos.length === 0) {
            lista.innerHTML = '<p class="muted">Você ainda não tem veículos na sua garagem.</p>';
            return;
        }

        veiculos.forEach(v => {
            const card = document.createElement('article');
            card.className = 'card';
            card.innerHTML = `<h3>${v.nm_marca} ${v.nm_modelo}</h3><p>Ano: ${v.ano_carro}</p>`;
            lista.appendChild(card);
        });
    } catch (error) {
        lista.innerHTML = '<p class="muted">Ocorreu um erro ao carregar seus veículos.</p>';
    }
}

async function carregarCarrosDisponiveis() {
    const select = document.getElementById('select-carro');
    try {
        const response = await fetch('api/buscar_carros_disponiveis.php');
        const carros = await response.json();
        
        select.innerHTML = '<option value="">Selecione um veículo...</option>'; // Limpa e adiciona a opção padrão
        carros.forEach(carro => {
            const option = document.createElement('option');
            option.value = carro.id_carro;
            option.textContent = `${carro.nm_marca} ${carro.nm_modelo} (${carro.ano_carro})`;
            select.appendChild(option);
        });

    } catch (error) {
        select.innerHTML = '<option value="">Erro ao carregar lista de veículos</option>';
    }
}