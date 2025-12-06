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

// --- 1. RESUMO GERAL (Gráficos Elegantes) ---
async function carregarResumoUsuario() {
    try {
        const response = await fetch('api/resumo_usuario.php');
        const data = await response.json();
        
        if (!data.error) {
            const viagens = data.total_viagens || 0;
            const km = parseFloat(data.total_km || 0).toFixed(0);
            const recargas = data.total_abastecimentos || 0;

            // Atualiza apenas o número no HTML
            document.getElementById('val-viagens').textContent = viagens;
            document.getElementById('val-km').textContent = km;
            document.getElementById('val-recargas').textContent = recargas;

            // --- Função para criar Gráfico de Rosca com Gradiente ---
            const createGradientDonut = (canvasId, colorStart, colorEnd, isTall = false) => {
                const ctx = document.getElementById(canvasId).getContext('2d');
                
                // Cria o gradiente
                const gradient = ctx.createLinearGradient(0, 0, 0, 160);
                gradient.addColorStop(0, colorStart);
                gradient.addColorStop(1, colorEnd);

                new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Total'],
                        datasets: [{
                            data: [100], // 100% preenchido
                            backgroundColor: [gradient],
                            borderWidth: 0,
                            borderRadius: 10, // Bordas arredondadas
                            cutout: '85%',    // Espessura fina
                        },
                        {
                            // Anel de fundo (Track)
                            data: [100],
                            backgroundColor: '#ffffff0a', // Cinza bem transparente
                            borderWidth: 0,
                            cutout: '85%',
                            weight: 0.8 
                        }]
                    },
                    options: {
                        // Se for alto (isTall=true), desliga a proporção automática para ele crescer
                        maintainAspectRatio: !isTall, 
                        responsive: true,
                        plugins: { tooltip: { enabled: false }, legend: { display: false } },
                        events: [], // Estático
                        animation: {
                            animateScale: true,
                            animateRotate: true
                        }
                    }
                });
            };

            // Gera os 3 gráficos com cores Neon/Gradiente
            // O Segundo (KM) tem o parametro true para ser ALTO
            createGradientDonut('chartResumoViagens', '#ff2efc', '#bc13fe'); // Rosa
            createGradientDonut('chartResumoKm', '#34d399', '#059669', true);      // Verde (GRANDE)
            createGradientDonut('chartResumoRecargas', '#a78bfa', '#7c3aed'); // Roxo
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

        if (dados.error || dados.length === 0) return;

        const tbody = document.getElementById('tabela-desempenho').querySelector('tbody');
        tbody.innerHTML = '';
        
        const labels = [];
        const dataViagens = [];
        const dataKM = [];
        const dataRecargas = [];

        dados.forEach(carro => {
            const horas = parseFloat(carro.total_horas || 0);

            // Tabela
            const row = tbody.insertRow();
            row.insertCell().textContent = carro.nome_veiculo;
            row.insertCell().textContent = `${parseFloat(carro.km_total_rodado).toFixed(0)} km`;
            row.insertCell().textContent = carro.total_viagens;
            row.insertCell().textContent = `${horas} h`; 
            row.insertCell().textContent = carro.total_recargas;

            // Arrays
            labels.push(carro.nome_veiculo); 
            dataViagens.push(carro.total_viagens);
            dataKM.push(parseFloat(carro.km_total_rodado));
            dataRecargas.push(carro.total_recargas);
        });

        const commonOptions = {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, ticks: { color: '#9ca3af' }, grid: { color: '#ffffff1a' } },
                x: { ticks: { color: '#9ca3af' }, grid: { display: false } }
            }
        };

        // 1. Viagens (Barras)
        new Chart(document.getElementById('chartViagens'), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{ 
                    label: 'Viagens', 
                    data: dataViagens, 
                    backgroundColor: '#ff2efc', 
                    borderRadius: 6,
                    barThickness: 20
                }]
            },
            options: commonOptions
        });

        // 2. KM (Rosca) - AGORA TAMBÉM GRANDE/ALTO
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
                maintainAspectRatio: false, // <--- PERMITE ESTICAR
                cutout: '60%', 
                plugins: { legend: { position: 'bottom', labels: { color: '#fff', boxWidth: 12 } } }
            }
        });

        // 3. Recargas (Barras)
        new Chart(document.getElementById('chartRecargas'), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{ 
                    label: 'Recargas', 
                    data: dataRecargas, 
                    backgroundColor: '#9b5cff', 
                    borderRadius: 6,
                    barThickness: 20
                }]
            },
            options: commonOptions
        });

    } catch (e) { console.error("Erro gráficos:", e); }
}

// --- 3. LISTA HISTÓRICO ---
async function carregarHistoricoDetalhado() {
    const tbody = document.getElementById('tabela-historico').querySelector('tbody');
    const loading = document.getElementById('historico-loading');

    try {
        const response = await fetch('api/historico_completo.php');
        const historico = await response.json();
        
        loading.style.display = 'none';
        tbody.innerHTML = '';

        if (!historico || historico.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 30px; color:#aaa">Nenhuma viagem encontrada.</td></tr>';
            return;
        }

        historico.forEach(v => {
            const row = tbody.insertRow();
            const dataF = new Date(v.dt_consulta).toLocaleDateString('pt-BR');
            
            row.insertCell().innerHTML = `<span style="color:#ccc">${dataF}</span>`;
            
            row.insertCell().innerHTML = `
                <div style="font-weight:600; color:#fff">${v.cidade_destino}</div>
                <div style="font-size:0.8rem; color:#777; margin-top:2px;">Origem: ${v.cidade_origem}</div>
            `;
            
            row.insertCell().innerHTML = `<span style="color:#a78bfa">${v.nm_marca} ${v.nm_modelo}</span>`;
            row.insertCell().innerHTML = `<strong style="color:#34d399">${parseFloat(v.km_viagem).toFixed(1)} km</strong>`;
        });

    } catch (e) { 
        loading.textContent = 'Erro ao carregar.';
        console.error(e); 
    }
}