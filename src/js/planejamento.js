// src/js/planejamento.js

let map;
let directionsService;
let directionsRenderer;
let markers = []; 
let usuarioEstaLogado = false; 
let veiculoSelecionado = { id: null, autonomia: 300, eficiencia: 200 }; 

const OCM_API_KEY = "c1b598ab-8144-43d6-9c74-e191d034ab21";

// --- Inicializa o Mapa ---
window.initMap = async function() {
    
    const { Map } = await google.maps.importLibrary("maps");
    const { Autocomplete } = await google.maps.importLibrary("places");
    const { DirectionsService, DirectionsRenderer } = await google.maps.importLibrary("routes");

    directionsService = new DirectionsService();
    directionsRenderer = new DirectionsRenderer();

    map = new Map(document.getElementById("map"), {
        zoom: 4,
        center: { lat: -14.235, lng: -51.925 }, 
        mapId: "GAFIA_MAP_STYLE"
    });

    directionsRenderer.setMap(map);
    
    const originInput = document.getElementById('origin-input');
    const destinationInput = document.getElementById('destination-input');
    
    if (originInput && destinationInput) {
        new Autocomplete(originInput, { componentRestrictions: { country: "br" } });
        new Autocomplete(destinationInput, { componentRestrictions: { country: "br" } });
    }

    const btnCalc = document.getElementById('calculate-route');
    if(btnCalc) btnCalc.addEventListener('click', calculateAndDisplayRoute);
    
    const selectCarro = document.getElementById('select-meu-carro');
    if (selectCarro) selectCarro.addEventListener('change', updateSelectedVehicle);

    // Verifica sessão ao carregar
    await checkSession(); 
};

function updateSelectedVehicle(event) {
    const selectedValue = event.target.value;
    if (selectedValue) {
        veiculoSelecionado = JSON.parse(selectedValue);
    } else {
        veiculoSelecionado = { id: null, autonomia: 300, eficiencia: 200 }; 
    }
}

async function checkSession() { 
    const loginPrompt = document.getElementById('login-prompt'); 
    const selectCarro = document.getElementById('select-meu-carro'); 
    
    try {
        const response = await fetch('api/verificar_sessao.php'); 
        const session = await response.json();
        
        if (session.loggedIn) {
            usuarioEstaLogado = true;
            
            // --- CORREÇÃO: Altera o link da logo para Dashboard se logado ---
            const logoLink = document.querySelector('.logo');
            if (logoLink) {
                logoLink.href = 'dashboard.html';
            }

            if (loginPrompt) loginPrompt.style.display = 'none'; 
            if (selectCarro) {
                selectCarro.style.display = 'block';
                carregarVeiculos(selectCarro);
            }
        } else {
            usuarioEstaLogado = false;
            // Se não estiver logado, a logo mantém o padrão (index.html) definido no HTML
            
            if (loginPrompt) loginPrompt.style.display = 'block'; 
            if (selectCarro) selectCarro.style.display = 'none'; 
        }
    } catch (error) {
        console.error('Erro ao verificar sessão:', error);
    }
}

async function carregarVeiculos(selectElement) {
    try {
        const res = await fetch('api/meus_veiculos.php?action=list_garage');
        const carros = await res.json();
        
        selectElement.innerHTML = '<option value="">Selecione seu Carro</option>';
        if (carros && carros.length > 0) {
            carros.forEach((carro, index) => {
                const eficiencia = carro.eficiencia_wh_km || 200;
                
                const option = document.createElement('option');
                option.value = JSON.stringify({
                    id: carro.id_carro, 
                    autonomia: carro.dur_bat, 
                    eficiencia: eficiencia 
                });
                option.textContent = `${carro.nm_marca} ${carro.nm_modelo}`;
                
                selectElement.appendChild(option);
            });
        }
    } catch (e) { console.error("Erro ao carregar veículos", e); }
}

async function findChargingStations(bounds) {
    clearMarkers(); 
    if (!bounds) return;

    const routeResult = directionsRenderer.getDirections();
    if (!routeResult || routeResult.routes.length === 0) return;

    const lastLeg = routeResult.routes[0].legs.slice(-1)[0];
    const centerLat = lastLeg.end_location.lat();
    const centerLng = lastLeg.end_location.lng();

    const distanceKm = 15; 
    const ocmUrl = `https://api.openchargemap.io/v3/poi/?output=json&latitude=${centerLat}&longitude=${centerLng}&distance=${distanceKm}&maxresults=100&verbose=false&countrycode=BR&key=${OCM_API_KEY}`;
    
    try {
        const response = await fetch(ocmUrl);
        const data = await response.json();

        if (data && data.length > 0) {
            data.forEach(poi => {
                if (poi.AddressInfo?.Latitude && poi.AddressInfo?.Longitude) {
                    const position = { lat: poi.AddressInfo.Latitude, lng: poi.AddressInfo.Longitude };
                    
                    const marker = new google.maps.Marker({
                        position: position,
                        map: map,
                        title: poi.AddressInfo.Title || 'Ponto de Recarga'
                    });
                    markers.push(marker);
                }
            });
        }
    } catch (error) {
        console.error("Erro OCM:", error);
    }
}

function calculateAndDisplayRoute() {
    const originInput = document.getElementById('origin-input');
    const destinationInput = document.getElementById('destination-input');
    
    if(!originInput.value || !destinationInput.value) {
        alert("Preencha origem e destino.");
        return;
    }

    const request = {
        origin: originInput.value,
        destination: destinationInput.value,
        travelMode: google.maps.TravelMode.DRIVING
    };

    directionsService.route(request, (result, status) => {
        if (status == 'OK') {
            directionsRenderer.setDirections(result);
            
            const rota = result.routes[0].legs[0];
            const distanciaKm = rota.distance.value / 1000;
            const tempoSegundos = rota.duration.value;
            
            // Cálculos
            const consumoKWh = (distanciaKm * veiculoSelecionado.eficiencia) / 1000;
            const distanciaPorCarga = (veiculoSelecionado.autonomia * 1000) / veiculoSelecionado.eficiencia;
            
            // Evita divisão por zero
            const paradas = distanciaPorCarga > 0 ? Math.ceil(Math.max(0, distanciaKm / distanciaPorCarga) - 1) : 0;
            
            const tempoRecargaMin = paradas * 40; 
            const tempoTotalSegundos = tempoSegundos + (tempoRecargaMin * 60);

            // Exibição
            document.getElementById('output-distancia').innerText = rota.distance.text;
            document.getElementById('output-duracao').innerText = rota.duration.text;
            document.getElementById('output-energia').innerText = `${consumoKWh.toFixed(1)} kWh`;
            document.getElementById('output-paradas').innerText = paradas;
            document.getElementById('output-tempo-recarrega').innerText = tempoRecargaMin + " min";
            
            const horas = Math.floor(tempoTotalSegundos / 3600);
            const minutos = Math.floor((tempoTotalSegundos % 3600) / 60);
            document.getElementById('output-tempo-total').innerText = `${horas}h ${minutos}m`;
            document.getElementById('output-recarregar').innerText = (paradas > 0 ? "Sim" : "Não"); 
            
            document.getElementById('advanced-route-details').style.display = 'block';

            // --- SALVAR NO BANCO ---
            if (usuarioEstaLogado && veiculoSelecionado.id) {
                const dadosViagem = {
                    id_carro: veiculoSelecionado.id,
                    origem: originInput.value,     
                    destino: destinationInput.value,   
                    distancia_km: distanciaKm,
                    tempo_viagem_segundos: tempoTotalSegundos, 
                    paradas: paradas
                };
                salvarViagemNoHistorico(dadosViagem);
            }
            
            findChargingStations(result.routes[0].bounds);

        } else {
            alert('Erro ao calcular rota: ' + status);
        }
    });
}

async function salvarViagemNoHistorico(dados) {
    try {
        const response = await fetch('api/salvar_viagem.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        
        const resultado = await response.json();
        
        if(resultado.success) {
            console.log("Histórico salvo com sucesso!");
        } else {
            console.warn("Erro API salvar:", resultado.message);
        }
    } catch (error) {
        console.error("Erro rede:", error);
    }
}

function clearMarkers() {
    markers.forEach(m => m.setMap(null));
    markers = [];
}