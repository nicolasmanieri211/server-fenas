// CONFIGURAÇÃO DO GOOGLE SHEETS
// Corrigido: Extraído apenas o ID real da sua planilha
const SHEET_ID = '14PcJnhdht8cT9zRv4hubWl_0gHXp__VVBMmu6f9nuCU'; 
const SHEET_NAME = 'Página1'; // Nome da aba inferior da sua planilha

// Constrói a URL correta para exportar os dados brutos em formato CSV (Corrigido o ${SHEET_ID})
const url = `https://docs.google.com/spreadsheets/d/e/2PACX-1vQKqqsHaj5P4yc-WFlVOsiWsi8D2phxSV5oFI-cuuTjZQXVZb7pL72N2ZBGLmsTKnPRwJVjcVB9lN5e/pubhtml=${encodeURIComponent(SHEET_NAME)}`;

// Função principal que busca e processa as informações
async function atualizarDashboard() {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Falha na comunicação com o Google Sheets');
    
    const csvText = await response.text();
    const dados = extrairLinhasCsv(csvText);

    if (dados.length > 0) {
      // O objeto 'dados[0]' contém a primeira linha de dados logo após o cabeçalho
      renderizarDadosNoHTML(dados[0]);
    }
  } catch (error) {
    console.error('Erro ao buscar dados agrícolas:', error);
  }
}

// Converte a string CSV em um array de objetos dinâmicos
function extrairLinhasCsv(textoCsv) {
  const linhas = textoCsv.split('\n').map(linha => 
    linha.split(',').map(celula => celula.replace(/^"|"$/g, '').trim())
  );
  
  const cabecalhos = linhas[0]; // Primeira linha: temperatura, umidade, vento...
  const registros = [];

  for (let i = 1; i < linhas.length; i++) {
    if (linhas[i].length === cabecalhos.length) {
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
  // 1. Bloco de Dados ao Vivo (Temperatura, Umidade, Vento, Acumulado)
  document.getElementById('val-temp').innerText = `${dadosAtualizados.temperatura}°C`;
  document.getElementById('val-temp-min').innerText = `${dadosAtualizados.temp_min}°C`;
  document.getElementById('val-temp-max').innerText = `${dadosAtualizados.temp_max}°C`;
  document.getElementById('val-hum').innerText = `${dadosAtualizados.umidade}%`;
  document.getElementById('val-wind').innerText = dadosAtualizados.vento;
  document.getElementById('val-rain-week').innerText = `${dadosAtualizados.chuva_semana} mm`;

  // 2. Cartões Inferiores do Mapa
  document.getElementById('val-disease').innerText = dadosAtualizados.risco_doenca;

  // 3. Gráfico Circular (Umidade do Solo) - Atualiza texto e círculo SVG
  const porcentagemSolo = parseInt(dadosAtualizados.agua_solo) || 0;
  document.getElementById('val-soil').innerText = `${porcentagemSolo}%`;
  
  // Atualização dinâmica do efeito visual do gauge (círculo SVG)
  const gaugeCircle = document.getElementById('gauge-circle');
  if (gaugeCircle) {
    const raio = gaugeCircle.r.baseVal.value;
    const circunferencia = 2 * Math.PI * raio;
    const preenchimentoOffset = circunferencia - (porcentagemSolo / 100) * circunferencia;
    
    gaugeCircle.style.strokeDasharray = `${circunferencia} ${circunferencia}`;
    gaugeCircle.style.strokeDashoffset = preenchimentoOffset;
  }
}

// Associa o botão de sincronizar da Topbar para disparar a atualização manualmente
document.getElementById('btn-sync').addEventListener('click', () => {
  const botao = document.getElementById('btn-sync');
  botao.style.transform = 'rotate(360deg)';
  botao.style.transition = 'transform 0.6s ease';
  
  atualizarDashboard().then(() => {
    setTimeout(() => botao.style.transform = 'none', 600);
  });
});

// Executa a primeira carga assim que o painel abre na tela
window.addEventListener('DOMContentLoaded', atualizarDashboard);
