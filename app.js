// =====================================
// GOOGLE SHEETS
// =====================================

// Link publicado da planilha
const SHEET_URL =
'https://docs.google.com/spreadsheets/d/e/2PACX-1vQKqqsHaj5P4yc-WFlVOsiWsi8D2phxSV5oFI-cuuTjZQXVZb7pL72N2ZBGLmsTKnPRwJVjcVB9lN5e/pub';

// Nome da aba
const SHEET_NAME = 'Página1';

// Endereço CSV
const URL =
`${SHEET_URL}?output=csv&sheet=${encodeURIComponent(SHEET_NAME)}`;


// =====================================
// BUSCAR DADOS
// =====================================

async function atualizarDashboard() {

  try {

    const resposta = await fetch(URL);

    if (!resposta.ok) {
      throw new Error('Falha ao acessar a planilha.');
    }

    const csv = await resposta.text();

    const dados = converterCSV(csv);

    if (!dados.length) return;

    atualizarTela(dados[0]);

  }

  catch (erro) {

    console.error('Erro:', erro);

  }

}


// =====================================
// CONVERTER CSV
// =====================================

function converterCSV(csv) {

  const linhas = csv.trim().split('\n');

  const cabecalho = linhas[0]
  .split(',')
  .map(c => c.replace(/"/g, '').trim());

  const registros = [];

  for (let i = 1; i < linhas.length; i++) {

    const valores = linhas[i]
    .split(',')
    .map(c => c.replace(/"/g, '').trim());

    const obj = {};

    cabecalho.forEach((campo, indice) => {

      obj[campo] = valores[indice];

    });

    registros.push(obj);

  }

  return registros;

}


// =====================================
// ATUALIZAR HTML
// =====================================

function atualizarTela(d) {

  atualizar('val-temp', `${d.temperatura || '--'}°C`);

  atualizar('val-temp-min', `${d.temp_min || '--'}°C`);

  atualizar('val-temp-max', `${d.temp_max || '--'}°C`);

  atualizar('val-hum', `${d.umidade || '--'}%`);

  atualizar('val-wind', d.vento || '--');

  atualizar('val-rain-week', `${d.chuva_semana || '--'} mm`);

  atualizar('val-disease', d.risco_doenca || '--');



  // Umidade do solo

  const solo = Number(d.agua_solo || 0);

  atualizar('val-soil', `${solo}%`);



  // Gauge circular

  const gauge = document.getElementById('gauge-circle');

  if (gauge) {

    const raio = gauge.r.baseVal.value;

    const circ = 2 * Math.PI * raio;

    gauge.style.strokeDasharray = circ;

    gauge.style.strokeDashoffset =
      circ - (solo / 100) * circ;

  }



  // Barra verde

  atualizar('val-water-pct', `${solo}%`);

  const barra = document.getElementById('bar-water');

  if (barra) {

    barra.style.width = `${solo}%`;

  }

}


// =====================================
// AUXILIAR
// =====================================

function atualizar(id, valor) {

  const elemento = document.getElementById(id);

  if (elemento) {

    elemento.innerText = valor;

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

// Atualiza a cada 5 minutos

setInterval(atualizarDashboard, 300000);
