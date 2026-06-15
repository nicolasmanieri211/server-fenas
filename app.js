// =====================================
// GOOGLE SHEETS
// =====================================

const SHEET_ID = '14PcJnhdht8cT9zRv4hubWl_0gHXp__VVBMmu6f9nuCU';

// gid=0 = primeira aba
const GID = '0';

const URL =
`https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;


// =====================================
// BUSCAR DADOS
// =====================================

async function atualizarDashboard() {

  try {

    const resposta = await fetch(URL);

    if (!resposta.ok) {

      throw new Error('Não foi possível acessar a planilha.');

    }

    const csv = await resposta.text();

    const dados = converterCSV(csv);

    if (!dados.length) {

      console.log('Nenhum dado encontrado.');

      return;

    }

    atualizarTela(dados[0]);

    console.log('Planilha atualizada.');

  }

  catch (erro) {

    console.error('Erro:', erro);

  }

}


// =====================================
// CONVERTER CSV
// =====================================

function converterCSV(csv) {

  const linhas = csv.trim().split(/\r?\n/);

  const cabecalho = linhas[0]
    .split(',')
    .map(item => item.replace(/"/g, '').trim());

  const registros = [];

  for (let i = 1; i < linhas.length; i++) {

    const valores = linhas[i]
      .split(',')
      .map(item => item.replace(/"/g, '').trim());

    const obj = {};

    cabecalho.forEach((campo, indice) => {

      obj[campo] = valores[indice];

    });

    registros.push(obj);

  }

  return registros;

}


// =====================================
// ATUALIZAR ELEMENTOS
// =====================================

function atualizar(id, valor) {

  const elemento = document.getElementById(id);

  if (elemento) {

    elemento.innerText = valor;

  }

}


// =====================================
// ATUALIZAR TELA
// =====================================

function atualizarTela(dados) {

  atualizar('val-temp', `${dados.temperatura || '--'}°C`);

  atualizar('val-temp-min', `${dados.temp_min || '--'}°C`);

  atualizar('val-temp-max', `${dados.temp_max || '--'}°C`);

  atualizar('val-hum', `${dados.umidade || '--'}%`);

  atualizar('val-wind', dados.vento || '--');

  atualizar('val-rain-week', `${dados.chuva_semana || '--'} mm`);

  atualizar('val-disease', dados.risco_doenca || '--');


  // Água do solo

  const solo = Number(dados.agua_solo || 0);

  atualizar('val-soil', `${solo}%`);

  atualizar('val-water-pct', `${solo}%`);


  // Barra

  const barra = document.getElementById('bar-water');

  if (barra) {

    barra.style.width = `${solo}%`;

  }


  // Gauge

  const gauge = document.getElementById('gauge-circle');

  if (gauge) {

    const raio = gauge.r.baseVal.value;

    const circunferencia = 2 * Math.PI * raio;

    gauge.style.strokeDasharray = circunferencia;

    gauge.style.strokeDashoffset =
      circunferencia - (solo / 100) * circunferencia;

  }

}


// =====================================
// BOTÃO SINCRONIZAR
// =====================================

const btn = document.getElementById('btn-sync');

if (btn) {

  btn.addEventListener('click', () => {

    btn.classList.add('spinning');

    atualizarDashboard();

    setTimeout(() => {

      btn.classList.remove('spinning');

    }, 800);

  });

}


// =====================================
// INICIALIZAÇÃO
// =====================================

window.addEventListener('DOMContentLoaded', () => {

  atualizarDashboard();

});


// =====================================
// ATUALIZAÇÃO AUTOMÁTICA
// =====================================

// 5 minutos

setInterval(atualizarDashboard, 300000);
