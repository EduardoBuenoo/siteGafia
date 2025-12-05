// src/js/historico.js

document.addEventListener('DOMContentLoaded', () => {
    fetch('api/verificar_sessao.php')
        .then(res => res.json())
        .then(session => {
            if (session.loggedIn) {
                // Carrega todas as novas seções
                carregarResumoUsuario();
                carregarHistoricoDetalhado();
                carregarGraficosFrota();
            } else {
                window.location.href = 'login.html'; 
            }
        })
        .catch(error => console.error('Erro de sessão:', error));
});

// --- 1. RESUMO GERAL (Topo da página) ---
async function carregarResumoUsuario() {
    try {
        const response = await fetch('api/resumo_usuario.php');
        const data = await response.json();
        
        if (!data.error) {
            document.getElementById('total-viagens').textContent = data.total_viagens || 0;
            document.getElementById('total-km').textContent = parseFloat(data.total_km || 0).toFixed(0) + ' km';
            document.getElementById('total-abastecimentos').textContent = data.total_abastecimentos || 0;
        }
    } catch (e) { console.error("Erro resumo:", e); }
}

// --- 2. GRÁFICOS E TABELA DE DESEMPENHO (Meio da página) ---
async function carregarGraficosFrota() {
    try {
        const response = await fetch('api/desempenho_carros.php');
        const dados = await response.json();

        if (dados.error || dados.length === 0) return;

        // Preencher Tabela de Desempenho
        const tbody = document.getElementById('tabela-desempenho').querySelector('tbody');
        tbody.innerHTML = '';
        
        // Arrays para alimentar os Gráficos
        const labels = [];
        const dataViagens = [];
        const dataKM = [];
        // const dataTempo = []; // REMOVIDO: Variável não mais necessária
        const dataRecargas = [];

        dados.forEach(carro => {
            // Preenche a Tabela
            const row = tbody.insertRow();
            row.insertCell().textContent = carro.nome_veiculo;
            row.insertCell().textContent = `${parseFloat(carro.km_total_rodado).toFixed(0)} km`;
            row.insertCell().textContent = carro.total_viagens;
            row.insertCell().textContent = `${carro.total_horas} h`;
            row.insertCell().textContent = carro.total_recargas;

            // Preenche os Arrays dos Gráficos
            
            // ALTERAÇÃO: Removido o .split(' ')[0] para mostrar o nome completo (Marca + Modelo)
            // Agora aparecerá o modelo conforme solicitado.
            labels.push(carro.nome_veiculo); 
            
            dataViagens.push(carro.total_viagens);
            dataKM.push(parseFloat(carro.km_total_rodado));
            // dataTempo.push(parseFloat(carro.total_horas || 0)); // REMOVIDO
            dataRecargas.push(carro.total_recargas);
        });

        // Configuração Visual Comum dos Gráficos
        const cores = ['#ff2efc', '#9b5cff', '#34d399', '#fbbf24', '#f87171'];
        const commonOptions = {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, ticks: { color: '#ddd' }, grid: { color: '#ffffff1a' } },
                x: { ticks: { color: '#ddd' }, grid: { display: false } }
            }
        };

        // 1. Gráfico de Viagens (Barra Vertical) - Mantido
        new Chart(document.getElementById('chartViagens'), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{ label: 'Viagens', data: dataViagens, backgroundColor: '#ff2efc', borderRadius: 5 }]
            },
            options: commonOptions
        });

        // 2. Gráfico de KM (Rosca/Donut) - Mantido
        new Chart(document.getElementById('chartKM'), {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{ 
                    data: dataKM, 
                    backgroundColor: cores,
                    borderColor: '#2b0e47',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { position: 'bottom', labels: { color: '#fff' } } }
            }
        });

        // 3. Gráfico de Tempo (REMOVIDO COMPLETO)
        /*
        new Chart(document.getElementById('chartTempo'), {
            type: 'bar',
            data: { labels: labels, datasets: [...] },
            options: { ...commonOptions, indexAxis: 'y' }
        });
        */

        // 4. Gráfico de Recargas (ALTERADO de Pie para Bar)
        // Agora está igual ao de Viagens, mas com uma cor diferente para diferenciar
        new Chart(document.getElementById('chartRecargas'), {
            type: 'bar', // Mudado de 'pie' para 'bar'
            data: {
                labels: labels,
                datasets: [{ 
                    label: 'Recargas', 
                    data: dataRecargas, 
                    backgroundColor: '#9b5cff', // Roxo (brand-2)
                    borderRadius: 5 
                }]
            },
            options: commonOptions // Usa as mesmas opções de grade e eixos do gráfico de viagens
        });

    } catch (e) { console.error("Erro ao gerar gráficos:", e); }
}

// --- 3. HISTÓRICO DETALHADO (Lista no final da página) ---
async function carregarHistoricoDetalhado() {
    const tbody = document.getElementById('tabela-historico').querySelector('tbody');
    const loading = document.getElementById('historico-loading');

    try {
        const response = await fetch('api/historico_completo.php');
        const historico = await response.json();
        
        loading.style.display = 'none';
        tbody.innerHTML = '';

        if (!historico || historico.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 20px;">Nenhuma viagem encontrada.</td></tr>';
            return;
        }

        historico.forEach(v => {
            const row = tbody.insertRow();
            const dataF = new Date(v.dt_consulta).toLocaleDateString('pt-BR');
            
            row.insertCell().textContent = dataF;
            
            row.insertCell().innerHTML = `
                <div style="font-weight:600; color:#fff">${v.cidade_destino}</div>
                <div style="font-size:0.85rem; color:#aaa">De: ${v.cidade_origem}</div>
            `;
            
            row.insertCell().textContent = `${v.nm_marca} ${v.nm_modelo}`;
            row.insertCell().textContent = `${parseFloat(v.km_viagem).toFixed(1)} km`;
        });

    } catch (e) { 
        loading.textContent = 'Erro ao carregar histórico.';
        console.error(e); 
    }
}