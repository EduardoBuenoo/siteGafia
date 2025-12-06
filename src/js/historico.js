// src/js/historico.js

document.addEventListener('DOMContentLoaded', () => {
    fetch('api/verificar_sessao.php')
        .then(res => res.json())
        .then(session => {
            if (session.loggedIn) {
                carregarResumoUsuario();
                carregarSustentabilidade();
                carregarHistoricoDetalhado();
                carregarGraficosFrota();
            } else {
                window.location.href = 'login.html'; 
            }
        })
        .catch(error => console.error('Erro de sessão:', error));
});

// --- 1. RESUMO GERAL (Agora com Gráficos/Canvas) ---
async function carregarResumoUsuario() {
    try {
        const response = await fetch('api/resumo_usuario.php');
        const data = await response.json();
        
        if (!data.error) {
            const viagens = data.total_viagens || 0;
            const km = parseFloat(data.total_km || 0).toFixed(0);
            const recargas = data.total_abastecimentos || 0;

            // Atualiza os números no centro dos gráficos
            document.getElementById('val-viagens').textContent = viagens;
            document.getElementById('val-km').textContent = km + " km";
            document.getElementById('val-recargas').textContent = recargas;

            // Função auxiliar para criar gráficos de rosca simples
            const createDonut = (canvasId, value, color) => {
                new Chart(document.getElementById(canvasId), {
                    type: 'doughnut',
                    data: {
                        labels: ['Total'],
                        datasets: [{
                            data: [1], // Valor dummy para preencher o círculo
                            backgroundColor: [color],
                            borderWidth: 0
                        }]
                    },
                    options: {
                        cutout: '85%', // Deixa o círculo mais fino
                        responsive: true,
                        plugins: { tooltip: { enabled: false }, legend: { display: false } },
                        events: [] // Desativa interações (mouse hover)
                    }
                });
            };

            // Gera os 3 gráficos do topo
            createDonut('chartResumoViagens', viagens, '#ff2efc'); // Rosa
            createDonut('chartResumoKm', km, '#34d399');      // Verde
            createDonut('chartResumoRecargas', recargas, '#9b5cff'); // Roxo
        }
    } catch (e) { console.error("Erro resumo:", e); }
}

// --- 1.5. SUSTENTABILIDADE ---
async function carregarSustentabilidade() {
    try {
        const response = await fetch('api/dados_sustentabilidade.php');
        const data = await response.json();

        if (!data.error) {
             const co2 = document.getElementById('eco-co2');
             const arvores = document.getElementById('eco-arvores');
             
             if(co2) co2.textContent = data.kg_co2_poupados || 0;
             if(arvores) arvores.textContent = data.arvores_equivalentes || 0;
        }
    } catch (e) { console.error("Erro ao carregar sustentabilidade:", e); }
}

// --- 2. GRÁFICOS E TABELA DE DESEMPENHO ---
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
        // dataTempo removido
        const dataRecargas = [];

        dados.forEach(carro => {
            // Garante que o valor de horas seja numérico
            const horas = parseFloat(carro.total_horas || 0);

            // Preenche a Tabela (Mantendo a coluna de horas para informação)
            const row = tbody.insertRow();
            row.insertCell().textContent = carro.nome_veiculo;
            row.insertCell().textContent = `${parseFloat(carro.km_total_rodado).toFixed(0)} km`;
            row.insertCell().textContent = carro.total_viagens;
            row.insertCell().textContent = `${horas} h`; 
            row.insertCell().textContent = carro.total_recargas;

            // Preenche os Arrays dos Gráficos (Nome completo)
            labels.push(carro.nome_veiculo); 
            dataViagens.push(carro.total_viagens);
            dataKM.push(parseFloat(carro.km_total_rodado));
            dataRecargas.push(carro.total_recargas);
        });

        // Configuração Visual Comum
        const cores = ['#ff2efc', '#9b5cff', '#34d399', '#fbbf24', '#f87171'];
        const commonOptions = {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, ticks: { color: '#ddd' }, grid: { color: '#ffffff1a' } },
                x: { ticks: { color: '#ddd' }, grid: { display: false } }
            }
        };

        // 1. Gráfico de Viagens (Barra Vertical)
        new Chart(document.getElementById('chartViagens'), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{ label: 'Viagens', data: dataViagens, backgroundColor: '#ff2efc', borderRadius: 5 }]
            },
            options: commonOptions
        });

        // 2. Gráfico de KM (Rosca/Donut)
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

        // 3. Gráfico de Tempo (REMOVIDO conforme solicitado)

        // 4. Gráfico de Recargas (Barra Vertical)
        new Chart(document.getElementById('chartRecargas'), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{ 
                    label: 'Recargas', 
                    data: dataRecargas, 
                    backgroundColor: '#9b5cff', 
                    borderRadius: 5 
                }]
            },
            options: commonOptions
        });

    } catch (e) { console.error("Erro ao gerar gráficos:", e); }
}

// --- 3. HISTÓRICO DETALHADO ---
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