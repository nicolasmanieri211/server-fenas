// CONFIGURAÇÃO DO GOOGLE SHEETS
const url = 'https://google.com';

async function atualizarDashboard() {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Falha na comunicação com o Google Sheets');
    
    const csvText = await response.text();
    const dados = extrairLinhasCsv(csvText);

    if (dados.length > 0) {
      renderizarDadosNoHTML(dados[0]); // Pega estritamente a primeira linha de dados
    }
  } catch (error) {
    console.error('Erro ao buscar dados agrícolas:', error);
  }
}

function extrairLinhasCsv(textoCsv) {
  // Divide por quebra de linha e limpa caracteres de retorno (\r) comuns no Windows
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

function renderizarDadosNoHTML(dadosAtualizados) {
  // Vincula os IDs do HTML aos cabeçalhos exatos da planilha
  if (dadosAtualizados.temperatura) document.getElementById('val-temp').innerText = `${dadosAtualizados.temperatura}°C`;
  if (dadosAtualizados.temp_min) document.getElementById('val-temp-min').innerText = `${dadosAtualizados.temp_min}°C`;
  if (dadosAtualizados.temp_max) document.getElementById('val-temp-max').innerText = `${dadosAtualizados.temp_max}°C`;
  if (dadosAtualizados.umidade) document.getElementById('val-hum').innerText = `${dadosAtualizados.umidade}%`;
  if (dadosAuthorized || dadosAtualizados.vento) document.getElementById('val-wind').innerText = dadosAtualizados.vento;
  if (dadosAtualizados.chuva_semana) document.getElementById('val-rain-week').innerText = `${dadosAtualizados.chuva_semana} mm`;

  if (dadosAtualizados.risco_doenca) {
    const elDisease = document.getElementById('val-disease');
    if (elDisease) elDisease.innerText = dadosAtualizados.risco_doenca;
  }

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

document.getElementById('btn-sync').addEventListener('click', () => {
  const botao = document.getElementById('btn-sync');
  botao.style.transform = 'rotate(360deg)';
  botao.style.transition = 'transform 0.6s ease';
  atualizarDashboard().then(() => {
    setTimeout(() => botao.style.transform = 'none', 600);
  });
});

window.addEventListener('DOMContentLoaded', atualizarDashboard);
