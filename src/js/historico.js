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

// --- 1. RESUMO GERAL ---
async function carregarResumoUsuario() {
    try {
        const response = await fetch('api/resumo_usuario.php');
        const data = await response.json();
        
        if (!data.error) {
            const viagens = data.total_viagens || 0;
            const km = parseFloat(data.total_km || 0).toFixed(0);
            const recargas = data.total_abastecimentos || 0;

            // CORREÇÃO: Atualizado para usar os IDs do novo HTML
            if(document.getElementById('total-viagens')) {
                document.getElementById('total-viagens').textContent = viagens;
            }
            if(document.getElementById('total-km')) {
                document.getElementById('total-km').textContent = km;
            }
            if(document.getElementById('total-abastecimentos')) {
                document.getElementById('total-abastecimentos').textContent = recargas;
            }

            // REMOVIDO: Código dos gráficos "Donut" antigos que causava erro
            // pois os canvas 'chartResumoViagens' não existem no novo layout.
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
    } catch (e) { console.error("Erro sustentabilidade:", e); }
}

// --- 2. GRÁFICOS DA FROTA ---
async function carregarGraficosFrota() {
    try {
        const response = await fetch('api/desempenho_carros.php');
        const dados = await response.json();

        // Verifica se há dados válidos
        if (!dados || dados.error || dados.length === 0) return;

        const tbody = document.getElementById('tabela-desempenho').querySelector('tbody');
        if(tbody) tbody.innerHTML = '';
        
        const labels = []; const dataViagens = []; const dataKM = []; const dataRecargas = [];

        dados.forEach(carro => {
            // Garante que os números sejam tratados corretamente
            const horas = parseFloat(carro.total_horas || 0); // Ajuste conforme o retorno real da API
            const kmRodado = parseFloat(carro.km_total_rodado || 0);
            
            if(tbody) {
                const row = tbody.insertRow();
                row.insertCell().textContent = carro.nome_veiculo;
                row.insertCell().textContent = `${kmRodado.toFixed(0)} km`;
                row.insertCell().textContent = carro.total_viagens;
                row.insertCell().textContent = `${horas} h`; 
                row.insertCell().textContent = carro.total_recargas || 0;
            }

            labels.push(carro.nome_veiculo); 
            dataViagens.push(carro.total_viagens);
            dataKM.push(kmRodado);
            dataRecargas.push(carro.total_recargas || 0);
        });

        const commonOptions = {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, ticks: { color: '#9ca3af' }, grid: { color: '#ffffff1a' } },
                x: { ticks: { color: '#9ca3af' }, grid: { display: false } }
            }
        };

        // Verifica a existência dos elementos antes de criar os gráficos
        if (document.getElementById('chartViagens')) {
            new Chart(document.getElementById('chartViagens'), {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{ label: 'Viagens', data: dataViagens, backgroundColor: '#ff2efc', borderRadius: 6, barThickness: 20 }]
                },
                options: commonOptions
            });
        }

        if (document.getElementById('chartKM')) {
            new Chart(document.getElementById('chartKM'), {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{ 
                        data: dataKM, 
                        backgroundColor: ['#ff2efc', '#9b5cff', '#34d399', '#fbbf24', '#f87171'],
                        borderColor: '#1e0b36', 
                        borderWidth: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true, 
                    cutout: '60%', 
                    plugins: { legend: { position: 'right', labels: { color: '#fff', boxWidth: 12 } } }
                }
            });
        }

        if (document.getElementById('chartRecargas')) {
            new Chart(document.getElementById('chartRecargas'), {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{ label: 'Recargas', data: dataRecargas, backgroundColor: '#9b5cff', borderRadius: 6, barThickness: 20 }]
                },
                options: commonOptions
            });
        }

    } catch (e) { console.error("Erro gráficos:", e); }
}

// --- 3. LISTA HISTÓRICO ---
async function carregarHistoricoDetalhado() {
    const tabela = document.getElementById('tabela-historico');
    if(!tabela) return; // Segurança caso a tabela não exista
    
    const tbody = tabela.querySelector('tbody');
    const loading = document.getElementById('historico-loading');

    try {
        const response = await fetch('api/historico_completo.php');
        const historico = await response.json();
        
        if(loading) loading.style.display = 'none';
        tbody.innerHTML = '';

        if (!historico || historico.length === 0 || historico.error) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 30px; color:#aaa">Nenhuma viagem encontrada.</td></tr>';
            return;
        }

        historico.forEach(v => {
            const row = tbody.insertRow();
            // Tratamento de data seguro
            let dataF = '--/--/----';
            if(v.dt_consulta) {
                try {
                    dataF = new Date(v.dt_consulta).toLocaleDateString('pt-BR');
                } catch(e) {}
            }
            
            row.insertCell().innerHTML = `<span style="color:#ccc">${dataF}</span>`;
            
            row.insertCell().innerHTML = `
                <div style="font-weight:600; color:#fff">${v.cidade_destino}</div>
                <div style="font-size:0.8rem; color:#777; margin-top:2px;">Origem: ${v.cidade_origem}</div>
            `;
            
            row.insertCell().innerHTML = `<span style="color:#a78bfa">${v.nm_marca} ${v.nm_modelo}</span>`;
            row.insertCell().innerHTML = `<strong style="color:#34d399">${parseFloat(v.km_viagem).toFixed(1)} km</strong>`;
        });

    } catch (e) { 
        if(loading) loading.textContent = 'Erro ao carregar.';
        console.error(e); 
    }
}