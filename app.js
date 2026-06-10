// CONFIGURAÇÃO DO GOOGLE SHEETS
// URL direta para puxar os dados brutos em formato CSV da sua planilha publicada
const url = 'https://google.com';

// Função principal que busca e processa as informações
async function atualizarDashboard() {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Falha na comunicação com o Google Sheets');
    
    const csvText = await response.text();
    const dados = extrairLinhasCsv(csvText);

    if (dados.length > 0) {
      // Passa a primeira linha de dados para o HTML
      renderizarDadosNoHTML(dados[0]);
    }
  } catch (error) {
    console.error('Erro ao buscar dados agrícolas:', error);
  }
}

// Converte a string CSV em um array de objetos dinâmicos
function extrairLinhasCsv(textoCsv) {
  const linhas = textoCsv.split('\n').map(linha => 
    linha.replace(/\r/g, '').split(',').map(celula => celula.replace(/^"|"$/g, '').trim())
  );
  
  const cabecalhos = linhas[0]; 
  const registros = [];

  for (let i = 1; i < linhas.length; i++) {
    if (linhas[i].length === cabecalhos.length && linhas[i].join('').trim() !== '') {
      const obj = {};
      cabecalhos.forEach((cabecalho, index) => {
        obj[cabecalho] = linhas[i][index];
      });
      registros.push(obj);
    }
  }
  return registros;
}

// Alimenta a interface HTML com os dados dinâmicos mapeados por ID
function renderizarDadosNoHTML(dadosAtualizados) {
  if (!dadosAtualizados) return;

  // 1. Bloco de Dados ao Vivo (Temperatura, Umidade, Vento, Acumulado)
  if (dadosAtualizados.temperatura) document.getElementById('val-temp').innerText = `${dadosAtualizados.temperatura}°C`;
  if (dadosAtualizados.temp_min) document.getElementById('val-temp-min').innerText = `${dadosAtualizados.temp_min}°C`;
  if (dadosAtualizados.temp_max) document.getElementById('val-temp-max').innerText = `${dadosAtualizados.temp_max}°C`;
  if (dadosAtualizados.umidade) document.getElementById('val-hum').innerText = `${dadosAtualizados.umidade}%`;
  if (dadosAtualizados.vento) document.getElementById('val-wind').innerText = dadosAtualizados.vento;
  if (dadosAtualizados.chuva_semana) document.getElementById('val-rain-week').innerText = `${dadosAtualizados.chuva_semana} mm`;

  // 2. Cartões Inferiores do Mapa
  if (dadosAtualizados.risco_doenca) {
    const elDisease = document.getElementById('val-disease');
    if (elDisease) elDisease.innerText = dadosAtualizados.risco_doenca;
  }

  // 3. Gráfico Circular (Umidade do Solo)
  const porcentagemSolo = parseInt(dadosAtualizados.agua_solo) || 0;
  const elSoil = document.getElementById('val-soil');
  if (elSoil) elSoil.innerText = `${porcentagemSolo}%`;
  
  const gaugeCircle = document.getElementById('gauge-circle');
  if (gaugeCircle) {
    const raio = gaugeCircle.r.baseVal.value;
    const circunferencia = 2 * Math.PI * raio;
    const preenchimentoOffset = circunferencia - (porcentagemSolo / 100) * circunferencia;
    
    gaugeCircle.style.strokeDasharray = `${circunferencia} ${circunferencia}`;
    gaugeCircle.style.strokeDashoffset = preenchimentoOffset;
  }
}

// Associa o botão de sincronizar da Topbar
document.getElementById('btn-sync').addEventListener('click', () => {
  const botao = document.getElementById('btn-sync');
  botao.style.transform = 'rotate(360deg)';
  botao.style.transition = 'transform 0.6s ease';
  
  atualizarDashboard().then(() => {
    setTimeout(() => botao.style.transform = 'none', 600);
  });
});

// Executa assim que a página carrega
window.addEventListener('DOMContentLoaded', atualizarDashboard);
